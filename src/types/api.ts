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
  id: string; // WooCommerce ID as string
  name: string;
  price: number;
  image: string;
  category: string; // Category slug
  categoryId: number; // Category ID
  brand: string; // Added for cart compatibility
  stock: number;
  description: string;
  shortDescription?: string;
  sku: string;
  specifications: {
    [key: string]: string;
  };
  images: string[];
  attributes?: Array<{
    name: string;
    options: string[];
  }>;
  sizeTableData?: {
    isSizeProduct: boolean;
    unitType: string;
    sizeTable: Array<{
      size: string;
      quantity: number;
      price: number;
    }>;
  };
  packSizeData?: {
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
