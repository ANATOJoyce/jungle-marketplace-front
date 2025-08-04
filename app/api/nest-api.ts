import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEST_API_URL,
  timeout: 10000,
});

// Intercepteur pour injecter le token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/register';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/register', credentials),
  logout: () => api.post('/auth/logout'),
};



