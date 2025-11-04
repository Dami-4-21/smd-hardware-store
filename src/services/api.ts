// New API service for custom backend (replaces WooCommerce)
import {
  Category,
  Product,
  CategoriesResponse,
  ProductsResponse
} from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle backend response format { success: true, data: ... }
    if (data.success) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Transform backend category to frontend format
function transformCategory(backendCategory: any): Category {
  const category: Category = {
    id: backendCategory.id,
    name: backendCategory.name,
    image: backendCategory.imageUrl || '/placeholder-category.jpg',
    slug: backendCategory.slug,
    parent: backendCategory.parentId ? 1 : 0, // Just indicate if it has a parent (1) or not (0)
    count: backendCategory.productCount || 0,
    description: backendCategory.description || '',
  };

  // Include subcategories if they exist
  if (backendCategory.subcategories && Array.isArray(backendCategory.subcategories)) {
    category.subcategories = backendCategory.subcategories.map((sub: any) => sub.id);
    console.log(`Category "${category.name}" has ${category.subcategories?.length || 0} subcategories:`, category.subcategories);
  }

  return category;
}

// Transform backend product to frontend format
function transformProduct(backendProduct: any): Product {
  // Extract specifications from product_specifications relation
  const specifications: { [key: string]: string } = {};
  if (backendProduct.specifications && Array.isArray(backendProduct.specifications)) {
    backendProduct.specifications.forEach((spec: any) => {
      specifications[spec.specName || spec.key || spec.name] = spec.specValue || spec.value;
    });
  }

  // Extract attributes (if any)
  const attributes = backendProduct.attributes || [];

  // Get primary image
  const primaryImage = backendProduct.images?.find((img: any) => img.isPrimary)?.imageUrl 
    || backendProduct.images?.[0]?.imageUrl 
    || '/placeholder-product.jpg';

  // Get all images
  const images = backendProduct.images?.map((img: any) => img.imageUrl) || [];

  // Handle size table data
  let sizeTableData;
  if (backendProduct.sizeTable && Array.isArray(backendProduct.sizeTable) && backendProduct.sizeTable.length > 0) {
    sizeTableData = {
      isSizeProduct: true,
      unitType: backendProduct.sizeTable[0].unitType || 'piece',
      sizeTable: backendProduct.sizeTable.map((size: any) => ({
        size: size.size,
        quantity: size.stockQuantity || size.quantity || 0, // Backend uses stockQuantity
        price: parseFloat(size.price)
      }))
    };
  }

  // Handle pack size data
  let packSizeData;
  if (backendProduct.packSizes && Array.isArray(backendProduct.packSizes) && backendProduct.packSizes.length > 0) {
    packSizeData = {
      isPackProduct: true,
      packSizes: backendProduct.packSizes.map((pack: any) => ({
        id: pack.id,
        packType: pack.packType,
        packQuantity: pack.packQuantity,
        size: pack.size || undefined,
        unitType: pack.unitType || undefined,
        price: parseFloat(pack.price),
        stockQuantity: pack.stockQuantity,
        sku: pack.sku || undefined
      }))
    };
  }

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    price: parseFloat(backendProduct.basePrice || backendProduct.price || '0'),
    image: primaryImage,
    category: backendProduct.category?.slug || '',
    categoryId: backendProduct.categoryId || 0,
    brand: backendProduct.brand || 'Generic',
    stock: backendProduct.stockQuantity || 0,
    description: backendProduct.description || '',
    shortDescription: backendProduct.shortDescription || '',
    sku: backendProduct.sku || '',
    specifications,
    images,
    attributes,
    sizeTableData,
    packSizeData
  };
}

// API Service class (replaces WooCommerceAPI)
export class API {
  // Fetch all categories with hierarchy
  static async getCategories(parent: number = 0): Promise<CategoriesResponse> {
    try {
      const categories = await apiRequest<any[]>('/categories');
      
      // Filter by parent if specified
      // parent === 0 means get only root categories (no parentId)
      // parent !== 0 is not used in current implementation
      const filteredCategories = parent === 0
        ? categories.filter(cat => !cat.parentId)
        : categories;

      return {
        categories: filteredCategories.map(transformCategory),
        totalPages: 1,
        totalCategories: filteredCategories.length,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        categories: [],
        totalPages: 0,
        totalCategories: 0,
      };
    }
  }

  // Fetch all categories recursively (including subcategories)
  static async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await apiRequest<any[]>('/categories');
      return categories.map(transformCategory);
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return [];
    }
  }

  // Fetch single category by ID
  static async getCategory(categoryId: number): Promise<Category> {
    const category = await apiRequest<any>(`/categories/${categoryId}`);
    return transformCategory(category);
  }

  // Get subcategories of a category
  static async getSubcategories(categoryId: string): Promise<Category[]> {
    try {
      const subcategories = await apiRequest<any[]>(`/categories/${categoryId}/subcategories`);
      return subcategories.map(transformCategory);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }

  // Check if category has subcategories
  static async hasSubcategories(categoryId: string): Promise<boolean> {
    const subcategories = await this.getSubcategories(categoryId);
    return subcategories.length > 0;
  }

  // Fetch products by category
  static async getProductsByCategory(
    categoryId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ProductsResponse> {
    try {
      const response = await apiRequest<any>(
        `/categories/${categoryId}/products?page=${page}&limit=${perPage}`
      );

      return {
        products: response.products.map(transformProduct),
        totalPages: response.pagination?.totalPages || 1,
        totalProducts: response.pagination?.total || response.products.length,
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return {
        products: [],
        totalPages: 0,
        totalProducts: 0,
      };
    }
  }

  // Fetch all products (paginated)
  static async getProducts(page: number = 1, perPage: number = 20): Promise<ProductsResponse> {
    try {
      const response = await apiRequest<any>(
        `/products?page=${page}&limit=${perPage}`
      );

      return {
        products: response.products.map(transformProduct),
        totalPages: response.pagination?.totalPages || 1,
        totalProducts: response.pagination?.total || response.products.length,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        products: [],
        totalPages: 0,
        totalProducts: 0,
      };
    }
  }

  // Fetch single product by ID
  static async getProduct(productId: string): Promise<Product> {
    const product = await apiRequest<any>(`/products/${productId}`);
    return transformProduct(product);
  }

  // Search products
  static async searchProducts(query: string, page: number = 1, perPage: number = 20): Promise<ProductsResponse> {
    try {
      const response = await apiRequest<any>(
        `/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${perPage}`
      );

      return {
        products: response.products.map(transformProduct),
        totalPages: response.pagination?.totalPages || 1,
        totalProducts: response.pagination?.total || response.products.length,
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        products: [],
        totalPages: 0,
        totalProducts: 0,
      };
    }
  }

  // Create order (for checkout) - Updated for new backend
  static async createOrder(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      selectedSize?: string;
      selectedUnitType?: string;
    }>;
    shippingAddressId?: string;
    shippingAddress?: string;
    paymentMethod: string;
    notes?: string;
  }): Promise<any> {
    try {
      // Get auth token
      const token = localStorage.getItem('customer_token');
      
      const order = await apiRequest<any>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get customer's orders
  static async getMyOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> {
    try {
      const token = localStorage.getItem('customer_token');
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const orders = await apiRequest<any>(`/orders/my-orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<any> {
    try {
      const token = localStorage.getItem('customer_token');
      
      const order = await apiRequest<any>(`/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
}

// Export as default for backward compatibility
export default API;
