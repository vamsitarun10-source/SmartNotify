import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach token
api.interceptors.request.use(async (config) => {
  try {
    const raw = await AsyncStorage.getItem("enc_auth_token");
    if (raw) {
      try {
        const decoded = decodeURIComponent(atob(raw));
        const token = decoded.split("::")[0];
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.exp * 1000 > Date.now()) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch {}
    }
  } catch {}
  return config;
});

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // 401 — auto logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      await AsyncStorage.multiRemove(["enc_auth_token", "enc_auth_user"]);
      return Promise.reject(error);
    }

    // Network error — retry once
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise((r) => setTimeout(r, 2000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
