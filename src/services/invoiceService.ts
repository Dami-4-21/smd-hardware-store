const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  quotationId?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentTerm?: string;
  dueDate?: string;
  paidDate?: string;
  paidAmount?: number;
  issuedDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };
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

export const invoiceService = {
  /**
   * Get all invoices for the logged-in customer
   */
  async getMyInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${API_URL}/invoices`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch invoices');
    }

    const result = await response.json();
    return result.data || [];
  },

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch invoice');
    }

    const result = await response.json();
    return result.data;
  },
};
