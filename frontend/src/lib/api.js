import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || "http://localhost:8000";
export const API = BACKEND.endsWith('/api') ? BACKEND : `${BACKEND}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Interceptor to attach Authorization header if token exists in localStorage (fixes Safari & Brave third-party cookie blocking)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("treasure_session_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));
