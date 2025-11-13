const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface QuotationItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  userId: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
  anticipatedOutstanding: number;
}

export interface CreateQuotationData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  notes?: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('customer_token');
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
   * Create a new quotation (customer submits for approval)
   */
  async create(data: CreateQuotationData): Promise<Quotation> {
    const response = await fetch(`${API_URL}/quotations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create quotation');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get customer's own quotations
   */
  async getMyQuotations(): Promise<Quotation[]> {
    const response = await fetch(`${API_URL}/quotations`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch quotations');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get a specific quotation by ID
   */
  async getById(id: string): Promise<Quotation> {
    const response = await fetch(`${API_URL}/quotations/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch quotation');
    }

    const result = await response.json();
    return result.data;
  },
};
