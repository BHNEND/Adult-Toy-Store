// API client with token management
const API_BASE = '/api';

// Token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

// Request headers
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API client
export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },
};

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    return api.post<{ token: string; user: any }>('/auth/login', { email, password });
  },

  async register(email: string, password: string, name: string) {
    return api.post<{ token: string; user: any }>('/auth/register', { email, password, name });
  },

  async me() {
    return api.get<any>('/auth/me');
  },
};

// Product API
export const productApi = {
  async list(params?: { category?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return api.get<any>(`/products?${searchParams.toString()}`);
  },

  async get(id: string) {
    return api.get<any>(`/products/${id}`);
  },
};

// Cart API
export const cartApi = {
  async list() {
    return api.get<any>('/cart');
  },

  async add(productId: string, quantity: number = 1) {
    return api.post<any>('/cart', { productId, quantity });
  },

  async update(itemId: string, quantity: number) {
    return api.put<any>(`/cart/${itemId}`, { quantity });
  },

  async remove(itemId: string) {
    return api.delete<any>(`/cart/${itemId}`);
  },
};

// Order API
export const orderApi = {
  async list() {
    return api.get<any>('/orders');
  },

  async get(id: string) {
    return api.get<any>(`/orders/${id}`);
  },

  async create(data: { addressId: string }) {
    return api.post<any>('/orders', data);
  },

  async cancel(id: string) {
    return api.post<any>(`/orders/${id}/cancel`, {});
  },
};

// Address API
export const addressApi = {
  async list() {
    return api.get<any>('/addresses');
  },

  async create(data: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }) {
    return api.post<any>('/addresses', data);
  },

  async update(
    id: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      isDefault?: boolean;
    }
  ) {
    return api.put<any>(`/addresses/${id}`, data);
  },

  async delete(id: string) {
    return api.delete<any>(`/addresses/${id}`);
  },

  async setDefault(id: string) {
    return api.post<any>(`/addresses/${id}/default`, {});
  },
};
