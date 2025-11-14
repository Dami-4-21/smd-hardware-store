const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  productsChange: number;
  totalCustomers: number;
  customersChange: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
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

export const dashboardService = {
  /**
   * Get dashboard statistics and data
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch dashboard data');
    }

    const result = await response.json();
    
    // Handle backend response format: {success: true, data: {...}}
    if (result.success && result.data) {
      return result.data;
    }
    
    return result;
  },

  /**
   * Get dashboard statistics only
   */
  async getStats(): Promise<DashboardStats | null> {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch statistics:', response.status);
        return null; // Return null on error
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data.stats || result.data;
      }
      
      return result.stats || result;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null; // Return null on error
    }
  },

  /**
   * Get recent orders for dashboard
   */
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
      const response = await fetch(`${API_URL}/dashboard/recent-orders?limit=${limit}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch recent orders:', response.status);
        return []; // Return empty array on error
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [];
      }
      
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return []; // Return empty array on error
    }
  },

  /**
   * Get low stock products
   */
  async getLowStockProducts(limit: number = 5): Promise<LowStockProduct[]> {
    try {
      const response = await fetch(`${API_URL}/dashboard/low-stock?limit=${limit}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch low stock products:', response.status);
        return []; // Return empty array on error
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [];
      }
      
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return []; // Return empty array on error
    }
  },
};
