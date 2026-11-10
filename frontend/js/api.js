// Centralized API Handler
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api`
  : '/api';

const API = {
  // Products
  async getProducts({ category = '', search = '', sort = '' } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/products/categories`);
    return res.json();
  },

  // Auth
  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.json();
  },

  // Orders
  async createOrder(orderData, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  async getUserOrders(token, email = null) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const url = email
      ? `${API_BASE_URL}/orders?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/orders`;

    const res = await fetch(url, { headers });
    return res.json();
  },

  async getOrderDetails(identifier) {
    const res = await fetch(`${API_BASE_URL}/orders/${identifier}`);
    return res.json();
  }
};
