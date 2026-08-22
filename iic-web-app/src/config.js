// Central API Base URL Configuration
// In development, VITE_API_URL is empty (""), allowing Vite proxy (vite.config.js) to forward /api and /uploads to backend.
// In production, VITE_API_URL can be set in environment variables (e.g. VITE_API_URL=https://api.domain.com).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";
export default API_BASE_URL;
