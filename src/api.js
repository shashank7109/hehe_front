import axios from 'axios';

const api = axios.create({
  // Prefer explicit BASE_URL, but keep backward compatibility with older key.
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:5050/api',
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired / invalid token)
// Skip redirect on the login route itself — let the form handle that error
api.interceptors.response.use(
  res => res,
  err => {
    const isLoginRequest = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      // Hard redirect — clears all React state and forces re-login
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
