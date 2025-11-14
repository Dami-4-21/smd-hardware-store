const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  userId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'CONVERTED_TO_ORDER';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  anticipatedOutstanding: number;
  notes?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  convertedToOrderId?: string;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    financialLimit?: number;
    currentOutstanding?: number;
    paymentTerm?: string;
    accountStatus?: string;
  };
  convertedOrder?: {
    id: string;
    orderNumber: string;
    status: string;
  };
  reviewer?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface QuotationsListResponse {
  quotations: Quotation[];
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

export const quotationService = {
  /**
   * Get all quotations with pagination and filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<QuotationsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const response = await fetch(
        `${API_URL}/quotations?${queryParams.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to fetch quotations';
        try {
          const error = await response.json();
          errorMessage = error.error?.message || error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Handle backend response format: {success: true, data: [...]}
      if (result.success && result.data) {
        return {
          quotations: result.data,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: result.data.length,
            totalPages: 1,
          },
        };
      }
      
      return result;
    } catch (error: any) {
      // Network error or fetch failed
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running on ' + API_URL);
      }
      throw error;
    }
  },

  /**
   * Get quotation by ID
   */
  async getById(id: string): Promise<Quotation> {
    const response = await fetch(`${API_URL}/quotations/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch quotation');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Approve quotation and convert to order
   */
  async approve(id: string): Promise<{ quotation: Quotation; order: any }> {
    const response = await fetch(`${API_URL}/quotations/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to approve quotation');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Decline quotation with reason
   */
  async decline(id: string, reason: string): Promise<Quotation> {
    const response = await fetch(`${API_URL}/quotations/${id}/decline`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminNotes: reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to decline quotation');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Delete quotation (admin only)
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/quotations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete quotation';
      
      try {
        const error = await response.json();
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        if (response.status === 403) {
          errorMessage = 'You do not have permission to delete this quotation. Only administrators can delete quotations.';
        } else if (response.status === 404) {
          errorMessage = 'Quotation not found.';
        } else if (response.status === 400) {
          errorMessage = 'Cannot delete this quotation. It may have already been approved or converted to an order.';
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  },
};
