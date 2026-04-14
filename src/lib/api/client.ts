import axios from 'axios';
import { useAuthStore } from '@/lib/store/authStore';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Get the JWT token from the Zustand store
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Since our backend wraps everything in standard { data, error, meta }, 
    // we can return response.data directly
    return response.data;
  },
  (error) => {
    // Automatically log out if the backend says our token is invalid/expired
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login'; 
    }
    
    // Throw the backend's standard error object specifically instead of Axios generic errors
    if (error.response?.data?.error) {
      return Promise.reject(error.response.data.error);
    }
    
    return Promise.reject(error);
  }
);
