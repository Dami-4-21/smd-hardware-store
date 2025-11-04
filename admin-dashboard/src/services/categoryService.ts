// API-based category service for admin dashboard

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  productCount: number;
  imageUrl?: string;
  subcategories?: Category[];
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// In-memory cache for categories
let categoriesCache: Category[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Category change listeners
type CategoryChangeListener = (categories: Category[]) => void;
const listeners: CategoryChangeListener[] = [];

export const categoryService = {
  /**
   * Fetch all categories from API
   */
  async fetchAll(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      const categories = data.data || data;
      
      // Update cache
      categoriesCache = categories;
      cacheTimestamp = Date.now();
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get all categories (from cache or fetch)
   */
  async getAll(): Promise<Category[]> {
    // Return cache if fresh
    if (categoriesCache.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return [...categoriesCache];
    }
    
    // Fetch fresh data
    return await this.fetchAll();
  },

  /**
   * Get all categories synchronously (from cache only)
   */
  getAllSync(): Category[] {
    return [...categoriesCache];
  },

  /**
   * Get flattened list of all categories (including subcategories)
   */
  getAllFlattened(): Category[] {
    const flattened: Category[] = [];
    
    const flatten = (cats: Category[]) => {
      cats.forEach(cat => {
        flattened.push(cat);
        if (cat.subcategories) {
          flatten(cat.subcategories);
        }
      });
    };
    
    flatten(categoriesCache);
    return flattened;
  },

  /**
   * Get category by ID
   */
  getById(id: string): Category | undefined {
    const flattened = this.getAllFlattened();
    return flattened.find(cat => cat.id === id);
  },

  /**
   * Add new category via API
   */
  async add(category: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create category');
      }

      const data = await response.json();
      const newCategory = data.data;
      
      // Refresh cache
      await this.fetchAll();
      this.notifyListeners();
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update category via API
   */
  async update(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update category');
      }

      const data = await response.json();
      const updatedCategory = data.data;
      
      // Refresh cache
      await this.fetchAll();
      this.notifyListeners();
      
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete category via API
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete category');
      }
      
      // Refresh cache
      await this.fetchAll();
      this.notifyListeners();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  /**
   * Set all categories (for initial load or reset)
   */
  setAll(categories: Category[]): void {
    categoriesCache = categories;
    cacheTimestamp = Date.now();
    this.notifyListeners();
  },

  /**
   * Clear cache (force refresh on next fetch)
   */
  clearCache(): void {
    categoriesCache = [];
    cacheTimestamp = 0;
  },

  /**
   * Subscribe to category changes
   */
  subscribe(listener: CategoryChangeListener): () => void {
    listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },

  /**
   * Notify all listeners of changes
   */
  notifyListeners(): void {
    const categories = this.getAllSync();
    listeners.forEach(listener => listener(categories));
  },
};
