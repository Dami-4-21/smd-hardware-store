const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  selectedSize?: string;
  selectedUnitType?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    images?: Array<{
      imageUrl: string;
    }>;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    customerType?: string;
  };
  _count?: {
    items: number;
  };
}

export interface OrdersListResponse {
  orders: Order[];
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

export const orderService = {
  /**
   * Get all orders with pagination and filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    userId?: string;
  }): Promise<OrdersListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.userId) queryParams.append('userId', params.userId);

    const response = await fetch(`${API_URL}/orders?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch orders');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get order by ID
   */
  async getById(id: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch order');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string, notes?: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update order status');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Cancel order
   */
  async cancel(id: string, reason?: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to cancel order');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Update order items (bulk update)
   */
  async updateItems(
    id: string,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>
  ): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/items`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update order items');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Add item to order
   */
  async addItem(id: string, productId: string, quantity: number): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add item to order');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Remove item from order
   */
  async removeItem(id: string, itemId: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to remove item from order');
    }

    const data = await response.json();
    return data.data;
  },
};
