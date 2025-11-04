import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all categories (hierarchical structure)
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;

    // Get all top-level categories (no parent)
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        ...(includeInactive !== 'true' && { isActive: true }),
      },
      include: {
        children: {
          where: includeInactive !== 'true' ? { isActive: true } : {},
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    // Transform to include product count
    const transformedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      parentId: cat.parentId,
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
      productCount: cat._count.products,
      subcategories: cat.children.map(child => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        imageUrl: child.imageUrl,
        parentId: child.parentId,
        displayOrder: child.displayOrder,
        isActive: child.isActive,
      })),
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    res.json({
      success: true,
      data: transformedCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch categories',
      },
    });
  }
};

/**
 * Get single category by ID
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch category',
      },
    });
  }
};

/**
 * Get subcategories of a parent category
 */
export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;

    const subcategories = await prisma.category.findMany({
      where: {
        parentId,
        isActive: true,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    const transformedSubcategories = subcategories.map(cat => ({
      ...cat,
      productCount: cat._count.products,
    }));

    res.json({
      success: true,
      data: transformedSubcategories,
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch subcategories',
      },
    });
  }
};

/**
 * Create new category
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, imageUrl, parentId, displayOrder } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name and slug are required',
        },
      });
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category with this slug already exists',
        },
      });
    }

    // If parentId provided, verify parent exists
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parent category not found',
          },
        });
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        parentId,
        displayOrder: displayOrder || 0,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create category',
      },
    });
  }
};

/**
 * Update category
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, parentId, displayOrder, isActive } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
        },
      });
    }

    // If slug is being changed, check for conflicts
    if (slug && slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category with this slug already exists',
          },
        });
      }
    }

    // If parentId is being changed, verify new parent exists and prevent circular reference
    if (parentId && parentId !== existingCategory.parentId) {
      if (parentId === id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category cannot be its own parent',
          },
        });
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parent category not found',
          },
        });
      }

      // Check if the new parent is a child of this category (circular reference)
      if (parentCategory.parentId === id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot create circular category relationship',
          },
        });
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(parentId !== undefined && { parentId }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update category',
      },
    });
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
        },
      });
    }

    // Check if category has subcategories
    if (category.children.length > 0 && cascade !== 'true') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category has subcategories. Use cascade=true to delete all.',
          subcategoriesCount: category.children.length,
        },
      });
    }

    // If category has products, unassign them (don't delete products)
    if (category._count.products > 0) {
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    }

    // Delete category (cascade will delete subcategories due to Prisma schema)
    await prisma.category.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: {
        deletedCategoryId: id,
        unassignedProducts: category._count.products,
        deletedSubcategories: category.children.length,
      },
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete category',
      },
    });
  }
};

/**
 * Get products in a category
 */
export const getCategoryProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
        },
      });
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: id },
        include: {
          images: true,
          specifications: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({
        where: { categoryId: id },
      }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch category products',
      },
    });
  }
};
