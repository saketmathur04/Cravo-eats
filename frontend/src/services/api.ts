/**
 * Shared Axios client for API requests.
 *
 * - Automatically attaches the JWT token from localStorage.
 * - Normalizes error responses for consistent handling.
 */
import axios, { AxiosError, AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
  withCredentials: true,
  timeout: 15_000,
});

/** Attach JWT token from localStorage to every outgoing request */
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalize error responses into a consistent Error object */
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message ?? error.message ?? "Network error";
    return Promise.reject(new Error(message));
  }
);

export type ApiResult<T> = { data: T };
