// WooCommerce API Types
export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    src: string;
    name: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    up?: Array<{ href: string }>;
  };
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  sku: string;
  stock_quantity: number | null;
  stock_status: string;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
    variation: boolean;
    visible: boolean;
  }>;
  variations?: number[];
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  size_table_data?: {
    is_size_product: boolean;
    unit_type: string;
    size_table: Array<{
      size: string;
      quantity: number;
      price: number;
    }>;
  };
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

// Transformed types for our app (compatible with existing structure)
export interface Category {
  id: string; // WooCommerce ID as string
  name: string;
  image: string;
  slug: string;
  parent: number;
  subcategories?: string[];
  count: number;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number; // Changed from 'price' to match backend
  price?: number; // Deprecated - kept for backward compatibility
  image: string;
  category: any; // Category object from backend
  categoryId: string; // Changed to string to match backend UUID
  brand: string;
  stock: number; // Mapped from stockQuantity
  stockQuantity?: number; // Backend field name
  description: string;
  shortDescription?: string;
  sku: string;
  slug: string; // Added for SEO
  isActive: boolean; // Added to track product status
  isFeatured?: boolean;
  specifications: {
    [key: string]: string;
  };
  images: string[]; // Array of image URLs
  imagesData?: Array<{ // Full image objects from backend
    id: string;
    imageUrl: string;
    altText?: string;
    displayOrder: number;
    isPrimary: boolean;
  }>;
  attributes?: Array<{
    name: string;
    options: string[];
  }>;
  sizeTable?: Array<{ // Changed from sizeTableData to match backend
    id: string;
    unitType: string; // kg, piece, L, m, etc.
    size: string;
    price: number;
    stockQuantity: number;
  }>;
  sizeTableData?: { // Deprecated - kept for backward compatibility
    isSizeProduct: boolean;
    unitType: string;
    sizeTable: Array<{
      size: string;
      quantity: number;
      price: number;
    }>;
  };
  packSizes?: Array<{ // Changed from packSizeData to match backend
    id: string;
    packType: string;
    packQuantity: number;
    size?: string;
    unitType?: string;
    price: number;
    stockQuantity: number;
  }>;
  packSizeData?: { // Deprecated - kept for backward compatibility
    isPackProduct: boolean;
    packSizes: Array<{
      id: string;
      packType: string; // e.g., "Pack of 12", "Pack of 6"
      packQuantity: number; // 12, 6, 3
      size?: string; // Optional size (X, Y, Z)
      unitType?: string; // Optional: m, cm, mm
      price: number;
      stockQuantity: number;
      sku?: string;
    }>;
  };
}

// API Response types
export interface CategoriesResponse {
  categories: Category[];
  totalPages: number;
  totalCategories: number;
}

export interface ProductsResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
}

// Navigation types
export interface NavigationState {
  currentCategory: Category | null;
  parentCategory: Category | null;
  breadcrumbs: Category[];
}
