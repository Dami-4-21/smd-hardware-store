import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

/**
 * Get all products with pagination and filters
 */
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, categoryId, search, featured, inStock } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId as string;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { displayOrder: 'asc' } },
          specifications: true,
          sizeTable: true,
          packSizes: { orderBy: { packQuantity: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: true,
        sizeTable: true,
        packSizes: { orderBy: { packQuantity: 'desc' } },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' },
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product
 */
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      slug,
      sku,
      description,
      shortDescription,
      brand,
      categoryId,
      price,
      stockQuantity,
      isFeatured,
      isActive,
      images,
      specifications,
      sizeTables,
    } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name and slug are required' },
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Category is required' },
      });
    }

    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid price is required' },
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: { message: 'Category not found' },
      });
    }

    // Create product with related data
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        shortDescription,
        brand,
        categoryId,
        basePrice: parseFloat(price),
        stockQuantity: parseInt(stockQuantity) || 0,
        isFeatured: isFeatured || false,
        isActive: isActive !== false,
        images: images?.length ? {
          create: images.map((img: any, index: number) => ({
            imageUrl: img.imageUrl || img.url,
            altText: img.altText || name,
            displayOrder: img.displayOrder !== undefined ? img.displayOrder : index,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
          })),
        } : undefined,
        specifications: specifications?.length ? {
          create: specifications.map((spec: any) => ({
            specName: spec.name,
            specValue: spec.value,
          })),
        } : undefined,
        sizeTable: sizeTables?.length ? {
          create: sizeTables.map((size: any) => ({
            unitType: size.unitType || 'piece',
            size: size.size,
            price: parseFloat(size.price),
            stockQuantity: parseInt(size.stockQuantity) || 0,
          })),
        } : undefined,
      },
      include: {
        category: true,
        images: true,
        specifications: true,
        sizeTable: true,
        packSizes: true,
      },
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { message: 'Product with this SKU or slug already exists' },
      });
    }
    next(error);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { images, specifications, sizeTables, ...updateData } = req.body;

    // Convert numeric fields
    if (updateData.price) {
      updateData.basePrice = parseFloat(updateData.price);
      delete updateData.price; // Remove 'price' field, use 'basePrice'
    }
    if (updateData.basePrice) updateData.basePrice = parseFloat(updateData.basePrice);
    if (updateData.stockQuantity) updateData.stockQuantity = parseInt(updateData.stockQuantity);
    
    // Remove fields that don't exist in schema
    delete updateData.weight;
    delete updateData.compareAtPrice;
    delete updateData.costPrice;
    delete updateData.lowStockThreshold;
    delete updateData.metaTitle;
    delete updateData.metaDescription;
    delete updateData.metaKeywords;

    // Update product in a transaction to handle related data
    const product = await prisma.$transaction(async (tx) => {
      // Update main product data
      const updatedProduct = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // Handle images update
      if (images && Array.isArray(images)) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Create new images
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: any, index: number) => ({
              productId: id,
              imageUrl: img.imageUrl,
              altText: img.altText || updatedProduct.name,
              displayOrder: index,
              isPrimary: img.isPrimary || index === 0,
            })),
          });
        }
      }

      // Handle specifications update
      if (specifications && Array.isArray(specifications)) {
        // Delete existing specifications
        await tx.productSpecification.deleteMany({
          where: { productId: id },
        });

        // Create new specifications
        if (specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: specifications.map((spec: any) => ({
              productId: id,
              specName: spec.specName || spec.name,
              specValue: spec.specValue || spec.value,
            })),
          });
        }
      }

      // Handle size tables update
      if (sizeTables && Array.isArray(sizeTables)) {
        // Delete existing size tables
        await tx.productSizeTable.deleteMany({
          where: { productId: id },
        });

        // Create new size tables
        if (sizeTables.length > 0) {
          await tx.productSizeTable.createMany({
            data: sizeTables.map((size: any) => ({
              productId: id,
              unitType: size.unitType || 'piece',
              size: size.size,
              price: parseFloat(size.price),
              stockQuantity: parseInt(size.stockQuantity),
            })),
          });
        }
      }

      // Return updated product with all relations
      return await tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          specifications: true,
          sizeTable: true,
          packSizes: { orderBy: { packQuantity: 'desc' } },
        },
      });
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' },
      });
    }
    next(error);
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' },
      });
    }
    next(error);
  }
};

/**
 * Get products by category
 * Includes products from subcategories if the category is a parent
 */
export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, includeSubcategories = 'true' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Check if this category has subcategories (children in Prisma schema)
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: true, // subcategories are called 'children' in the schema
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: { message: 'Category not found' },
      });
    }

    // Build where clause - include products from this category and its subcategories
    const categoryIds = [categoryId];
    
    // If includeSubcategories is true and category has children (subcategories), add them
    if (includeSubcategories === 'true' && category.children && category.children.length > 0) {
      categoryIds.push(...category.children.map(sub => sub.id));
    }

    const whereClause = {
      categoryId: {
        in: categoryIds,
      },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take,
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          sizeTable: true,
          packSizes: { orderBy: { packQuantity: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        categoryInfo: {
          id: category.id,
          name: category.name,
          hasSubcategories: category.children.length > 0,
          subcategoryCount: category.children.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 */
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' },
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      OR: [
        { name: { contains: q as string, mode: 'insensitive' as const } },
        { description: { contains: q as string, mode: 'insensitive' as const } },
        { sku: { contains: q as string, mode: 'insensitive' as const } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: Number(limit),
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product stock
 */
export const updateProductStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { stockQuantity: parseInt(stockQuantity) },
    });

    res.json({
      success: true,
      data: product,
      message: 'Stock updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add product size table entry
 */
export const addProductSizeTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { unitType, size, price, stockQuantity } = req.body;

    const sizeTable = await prisma.productSizeTable.create({
      data: {
        productId: id,
        unitType: unitType || 'piece',
        size,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity) || 0,
      },
    });

    res.status(201).json({
      success: true,
      data: sizeTable,
      message: 'Size table entry added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product size table entry
 */
export const updateProductSizeTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sizeId } = req.params;
    const updateData = req.body;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stockQuantity) updateData.stockQuantity = parseInt(updateData.stockQuantity);

    const sizeTable = await prisma.productSizeTable.update({
      where: { id: sizeId },
      data: updateData,
    });

    res.json({
      success: true,
      data: sizeTable,
      message: 'Size table entry updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product size table entry
 */
export const deleteProductSizeTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sizeId } = req.params;

    await prisma.productSizeTable.delete({
      where: { id: sizeId },
    });

    res.json({
      success: true,
      message: 'Size table entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
