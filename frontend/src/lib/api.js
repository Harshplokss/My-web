import axios from "axios";

// Automatically detects local environment vs deployed cloud environment
const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const BACKEND = isLocal
  ? (process.env.REACT_APP_LOCAL_API_URL || "http://localhost:8000")
  : (process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || "https://my-web-fekd.onrender.com");

export const API = BACKEND.endsWith('/api') ? BACKEND : `${BACKEND}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 10000,
});

// Interceptor to attach Authorization header if token exists in localStorage (fixes Safari & Brave third-party cookie blocking)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("treasure_session_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));
