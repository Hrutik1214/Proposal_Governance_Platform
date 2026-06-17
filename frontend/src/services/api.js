const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    // Route to Spring Boot backend API port 8080
    if (window.location.port !== '8080' && window.location.port !== '') {
      return `http://${window.location.hostname}:8080/api`;
    }
    return '/api';
  }
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `GET Request failed with status ${res.status}`);
    }
    return res.json();
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `POST Request failed with status ${res.status}`);
    }
    return res.json();
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `PUT Request failed with status ${res.status}`);
    }
    return res.json();
  },

  // Upload file requires special handling (multipart/form-data, no content-type header so browser boundary works)
  upload: async (endpoint, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed with status ${res.status}`);
    }
    return res.json();
  },

  downloadUrl: (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    return `${API_BASE_URL}/files/download?filePath=${encodeURIComponent(filePath)}`;
  },

  downloadFile: async (filePath, customName) => {
    if (!filePath) {
      alert('No document file attached to this proposal.');
      return;
    }
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      window.open(filePath, '_blank');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const targetUrl = `${API_BASE_URL}/files/download?filePath=${encodeURIComponent(filePath)}`;
      const res = await fetch(targetUrl, { headers });
      if (!res.ok) {
        throw new Error(`File download failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = customName || filePath.split('/').pop() || 'document.pdf';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download file error:', err);
      window.open(`${API_BASE_URL}/files/download?filePath=${encodeURIComponent(filePath)}`, '_blank');
    }
  },

  // Subscription and Trust API helpers
  getSubscriptions: async () => {
    return await api.get('/subscriptions');
  },
  checkoutSubscription: async (planId) => {
    return await api.post('/subscriptions/checkout', { planId });
  },
  createPaymentOrder: async (data) => {
    return await api.post('/payment/create-order', data);
  },
  verifyPaymentSignature: async (data) => {
    return await api.post('/payment/verify', data);
  },
  getTrustScore: async (founderId) => {
    return await api.get(`/trust/score/${founderId}`);
  },
  getAuditLogs: async () => {
    return await api.get('/audit/logs');
  },
};
