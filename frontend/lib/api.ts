import {
  Store,
  Category,
  ProductListItem,
  ProductDetail,
  Order,
  InventoryItem,
  DashboardOverview,
  User
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const DEFAULT_STORE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || 'noire';

export class ApiClient {
  private static getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Store-Slug': DEFAULT_STORE_SLUG,
      ...customHeaders,
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('noire_access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const activeStore = localStorage.getItem('noire_active_store') || DEFAULT_STORE_SLUG;
      headers['X-Store-Slug'] = activeStore;
    }

    return headers;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) errorMessage = errorData.detail;
        else if (errorData.message) errorMessage = errorData.message;
        else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) errorMessage = `${firstKey}: ${Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey]}`;
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Store endpoints
  static store = {
    getCurrent: () => ApiClient.request<Store>('/stores/current/'),
  };

  // Categories endpoints
  static categories = {
    getAll: () => ApiClient.request<{ results: Category[] } | Category[]>('/categories/?all=true').then(res => {
      return Array.isArray(res) ? res : res.results || [];
    }),
  };

  // Products endpoints
  static products = {
    list: (params: Record<string, string | number | boolean | undefined> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return ApiClient.request<{ count: number; results: ProductListItem[] }>(`/products/${queryString}`);
    },
    getBySlug: (slug: string) => ApiClient.request<ProductDetail>(`/products/${slug}/`),
    create: (data: any) => ApiClient.request<ProductDetail>('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (slug: string, data: any) => ApiClient.request<ProductDetail>(`/products/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (slug: string) => ApiClient.request<void>(`/products/${slug}/`, {
      method: 'DELETE',
    }),
  };

  // Marketing endpoints
  static marketing = {
    validateCoupon: (code: string, subtotal: number, shipping_fee: number = 0) =>
      ApiClient.request<{
        valid: boolean;
        code: string;
        discount_type: string;
        value: number;
        discount_amount: number;
        message: string;
      }>('/marketing/coupons/validate/', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal, shipping_fee }),
      }),
  };

  // Orders endpoints
  static orders = {
    checkout: (orderData: any) => ApiClient.request<Order>('/orders/checkout/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
    track: (orderNumber: string) => ApiClient.request<Order>(`/orders/track/${orderNumber}/`),
    list: (params: Record<string, string | number | undefined> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return ApiClient.request<{ count: number; results: Order[] }>(`/orders/${queryString}`);
    },
    updateStatus: (orderId: string, newStatus: string) =>
      ApiClient.request<Order>(`/orders/${orderId}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      }),
  };

  // Inventory endpoints
  static inventory = {
    list: (params: Record<string, string | boolean | undefined> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return ApiClient.request<{ count: number; results: InventoryItem[] }>(`/inventory/${queryString}`);
    },
    updateStock: (variantId: string, quantity: number, reason: string = 'MANUAL_CORRECTION', notes: string = '') =>
      ApiClient.request<InventoryItem>(`/inventory/${variantId}/update_stock/`, {
        method: 'POST',
        body: JSON.stringify({ quantity, reason, notes }),
      }),
  };

  // Analytics endpoints
  static analytics = {
    getOverview: () => ApiClient.request<DashboardOverview>('/analytics/overview/'),
  };

  // Auth endpoints
  static auth = {
    login: (email: string, password: string) =>
      ApiClient.request<{ access: string; refresh: string; user: User }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getProfile: () => ApiClient.request<User>('/auth/profile/'),
  };
}
