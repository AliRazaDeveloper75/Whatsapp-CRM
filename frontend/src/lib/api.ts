import axios from "axios";
import { tokenStorage } from "@/lib/tokenStorage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? tokenStorage.getAccess() : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
