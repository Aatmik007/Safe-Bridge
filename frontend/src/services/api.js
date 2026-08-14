const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Universal request wrapper handling JWT injection, CORS, and standard error handling
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('safebridge_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred while processing the request');
      error.status = response.status;
      error.data = data;
      error.isCooldown = data.isCooldown;
      error.cooldownRemainingMs = data.cooldownRemainingMs;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error('Cannot connect to SafeBridge server. Please ensure backend is running.');
      networkError.status = 503;
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    getMe: () => request('/auth/me'),
  },

  bridges: {
    getAll: () => request('/bridges'),
    getById: (id) => request(`/bridges/${id}`),
    getQrCodes: (id) => request(`/bridges/${id}/qrs`),
    report: (id, issueType, note) =>
      request(`/bridges/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ issueType, note }),
      }),
  },

  crossings: {
    start: (bridgeId, token, location) =>
      request('/crossings/start', {
        method: 'POST',
        body: JSON.stringify({ bridgeId, token, location }),
      }),
    verify: (bridgeId, token, location) =>
      request('/crossings/verify', {
        method: 'POST',
        body: JSON.stringify({ bridgeId, token, location }),
      }),
    getActive: () => request('/crossings/active'),
    getMy: (page = 1) => request(`/crossings/my?page=${page}`),
    cancel: () => request('/crossings/cancel', { method: 'POST' }),
  },

  rewards: {
    getAll: () => request('/rewards'),
    redeem: (id) => request(`/rewards/${id}/redeem`, { method: 'POST' }),
    getMyRedemptions: () => request('/rewards/my-redemptions'),
  },

  leaderboard: {
    get: () => request('/leaderboard'),
  },

  admin: {
    getOverview: () => request('/admin/overview'),
  },
};

export default api;
