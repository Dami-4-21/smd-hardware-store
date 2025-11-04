const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  categoryId: string;
  basePrice: number | string; // Prisma Decimal returns as string
  stockQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  sizeTable?: ProductSizeTable[];
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductSpecification {
  id: string;
  specName: string;
  specValue: string;
}

export interface ProductSizeTable {
  id: string;
  unitType: string;
  size: string;
  price: number;
  stockQuantity: number;
}

export interface CreateProductData {
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  categoryId: string;
  price: number;
  stockQuantity: number;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: Array<{ imageUrl: string; altText?: string; isPrimary?: boolean }>;
  specifications?: Array<{ name: string; value: string }>;
  sizeTables?: Array<{
    unitType: string;
    size: string;
    price: number;
    stockQuantity: number;
  }>;
}

export interface ProductsListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const productService = {
  /**
   * Get all products with pagination and filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    featured?: boolean;
    inStock?: boolean;
  }): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
    if (params?.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());

    const response = await fetch(`${API_URL}/products?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch products');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch product');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Create new product
   */
  async create(productData: CreateProductData): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create product');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Update product
   */
  async update(id: string, productData: Partial<CreateProductData>): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update product');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete product');
    }
  },

  /**
   * Search products
   */
  async search(query: string, page: number = 1, limit: number = 20): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_URL}/products/search?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to search products');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get products by category
   */
  async getByCategory(categoryId: string, page: number = 1, limit: number = 20): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_URL}/products/category/${categoryId}?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch products');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 10): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products/featured?limit=${limit}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch featured products');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Update product stock
   */
  async updateStock(id: string, stockQuantity: number): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stockQuantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update stock');
    }

    const data = await response.json();
    return data.data;
  },
};
