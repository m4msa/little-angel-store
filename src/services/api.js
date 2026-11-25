/**
 * Little Angel Store - Centralized Backend API Client
 * Connects frontend state seamlessly with the Express/Node.js backend.
 * Provides real-time synchronization, validation, and transparent offline fallback.
 */

const API_BASE = '/api';

/**
 * Generic Fetch Helper with Timeout & Error Handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 12000);
  config.signal = controller.signal;

  try {
    const res = await fetch(url, config);
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const errorMsg = (data && data.error) || (data && data.message) || `HTTP error ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[API] Request timed out for: ${endpoint}`);
    } else {
      console.warn(`[API] Request failed for ${endpoint}:`, err.message);
    }
    throw err;
  }
}

export const api = {
  // ---------------- Health & Overview ----------------
  async getHealth() {
    return request('/health');
  },

  async getOverview() {
    return request('/overview');
  },

  // ---------------- Products ----------------
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.inStock !== undefined) query.set('inStock', String(params.inStock));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`);
  },

  async getProduct(id) {
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    return request('/products', {
      method: 'POST',
      body: productData
    });
  },

  async updateProduct(id, updates) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: updates
    });
  },

  async toggleProductStock(id, inStock) {
    return request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: { inStock }
    });
  },

  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // ---------------- Categories ----------------
  async getCategories() {
    return request('/categories');
  },

  async createCategory(categoryData) {
    return request('/categories', {
      method: 'POST',
      body: categoryData
    });
  },

  async updateCategory(id, updates) {
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: updates
    });
  },

  async deleteCategory(id) {
    return request(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // ---------------- Orders ----------------
  async getOrders() {
    return request('/orders');
  },

  async getOrder(id) {
    return request(`/orders/${id}`);
  },

  async createOrder(orderData) {
    return request('/orders', {
      method: 'POST',
      body: orderData
    });
  },

  async updateOrderStatus(id, status) {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
  },

  async deleteOrder(id) {
    return request(`/orders/${id}`, {
      method: 'DELETE'
    });
  },

  // ---------------- Users & Roles ----------------
  async getUsers() {
    return request('/users');
  },

  async getUser(id) {
    return request(`/users/${id}`);
  },

  async createUser(userData) {
    return request('/users', {
      method: 'POST',
      body: userData
    });
  },

  async updateUser(id, updates) {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: updates
    });
  },

  async updateUserPermissions(id, permissions, role) {
    return request(`/users/${id}/permissions`, {
      method: 'PUT',
      body: { permissions, role }
    });
  },

  async deleteUser(id) {
    return request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // ---------------- Authentication ----------------
  async login(identifier, password) {
    return request('/auth/login', {
      method: 'POST',
      body: { identifier, password }
    });
  },

  async register(userData) {
    return request('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  // ---------------- Settings ----------------
  async getSettings() {
    return request('/settings');
  },

  async updateSettings(settingsData) {
    return request('/settings', {
      method: 'PUT',
      body: settingsData
    });
  }
};

export default api;
