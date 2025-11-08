const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface BannerSlide {
  id: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  slideType: 'IMAGE' | 'TEXT';
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  linkType?: string;
  linkedProductId?: string;
  linkedCategoryId?: string;
  linkedProduct?: {
    id: string;
    name: string;
    slug: string;
  };
  linkedCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  displayOrder: number;
  isActive: boolean;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerSlideData {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  slideType: 'IMAGE' | 'TEXT';
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  linkType?: string;
  linkedProductId?: string;
  linkedCategoryId?: string;
  displayOrder?: number;
  isActive?: boolean;
  duration?: number;
}

class BannerService {
  private getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllSlides(): Promise<BannerSlide[]> {
    const response = await fetch(`${API_URL}/banners/admin/all`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch banner slides');
    }

    const data = await response.json();
    return data.data;
  }

  async getSlide(id: string): Promise<BannerSlide> {
    const response = await fetch(`${API_URL}/banners/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch banner slide');
    }

    const data = await response.json();
    return data.data;
  }

  async createSlide(slideData: CreateBannerSlideData): Promise<BannerSlide> {
    const response = await fetch(`${API_URL}/banners`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(slideData),
    });

    if (!response.ok) {
      throw new Error('Failed to create banner slide');
    }

    const data = await response.json();
    return data.data;
  }

  async updateSlide(id: string, slideData: Partial<CreateBannerSlideData>): Promise<BannerSlide> {
    const response = await fetch(`${API_URL}/banners/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(slideData),
    });

    if (!response.ok) {
      throw new Error('Failed to update banner slide');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteSlide(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete banner slide');
    }
  }

  async reorderSlides(slides: { id: string; displayOrder: number }[]): Promise<void> {
    const response = await fetch(`${API_URL}/banners/reorder`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ slides }),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder banner slides');
    }
  }
}

export const bannerService = new BannerService();
