const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Customer {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  rneNumber?: string;
  rnePdfUrl?: string;
  taxId?: string;
  customerType?: string;
  isActive: boolean;
  emailVerified: boolean;
  // B2B Financial Fields
  financialLimit?: number;
  currentOutstanding?: number;
  paymentTerm?: string;
  accountStatus?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    orders: number;
  };
  addresses?: Address[];
  orders?: Order[];
}

export interface Address {
  id: string;
  label?: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface CreateCustomerData {
  email: string;
  username?: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName: string;
  rneNumber: string;
  rnePdfUrl?: string;
  taxId?: string;
  customerType?: string;
  // B2B Financial Fields
  paymentMethod?: string;
  paymentTerm?: string;
  financialLimit?: number;
  accountStatus?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface CreateCustomerResponse {
  customer: Customer;
  credentials: {
    username: string;
    password: string;
    email: string;
  };
}

export interface CustomersListResponse {
  customers: Customer[];
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

export const customerService = {
  /**
   * Get all customers with pagination and filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    customerType?: string;
    isActive?: boolean;
  }): Promise<CustomersListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.customerType) queryParams.append('customerType', params.customerType);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await fetch(`${API_URL}/customers?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch customers');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch customer');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Create a new customer
   */
  async create(customerData: CreateCustomerData): Promise<CreateCustomerResponse> {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create customer');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Update customer
   */
  async update(id: string, updates: Partial<CreateCustomerData>): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update customer');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Delete customer
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete customer');
    }
  },

  /**
   * Reset customer password
   */
  async resetPassword(id: string, password?: string): Promise<{ newPassword: string }> {
    const response = await fetch(`${API_URL}/customers/${id}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to reset password');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Upload RNE PDF document
   */
  async uploadRnePdf(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadType', 'documents');

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload document');
    }

    const data = await response.json();
    return data.data.url;
  },
};
