import { toCamelCase, toSnakeCase } from "@/utils/caseConverters";
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/v1",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }

  return null;
}

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        token = getCookie("auth");
      }

      return token;
    }
    return null;
  },

  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      let userData = localStorage.getItem(USER_KEY);
      if (!userData) {
        const cookieUser = getCookie("user");
        if (cookieUser) {
          try {
            const user = JSON.parse(cookieUser);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return user;
          } catch (e) {
            console.error("Failed to parse user cookie:", e);
            return null;
          }
        }
      }

      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  setUser: (user: any): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },
};

// Utility function to convert camelCase to snake_case
instance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();

    // Convert request data to snake_case
    if (config.data && typeof config.data === "object") {
      config.data = toSnakeCase(config.data);
    }

    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && tokenManager.isTokenExpired(token)) {
      tokenManager.removeToken();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/auth/login"
      ) {
        window.location.href = "/auth/login";
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    // Convert snake_case to camelCase in response data (skip blobs)
    if (response.data && !(response.data instanceof Blob)) {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.removeToken();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/auth/login"
      ) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
