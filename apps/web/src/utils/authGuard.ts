import { tokenManager } from "@/axios/axiosInstance";

export function requireAuth() {
  if (typeof window === "undefined") return true;

  const token = tokenManager.getToken();

  if (!token) {
    window.location.href = "/auth/login";
    return false;
  }

  if (tokenManager.isTokenExpired(token)) {
    tokenManager.removeToken();
    window.location.href = "/auth/login";
    return false;
  }

  return true;
}

export function redirectIfAuthenticated() {
  if (typeof window === "undefined") return false;

  const token = tokenManager.getToken();

  if (token && !tokenManager.isTokenExpired(token)) {
    window.location.href = "/dashboard";
    return true;
  }

  return false;
}
