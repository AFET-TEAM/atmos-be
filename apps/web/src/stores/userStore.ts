import { tokenManager } from "@/axios/axiosInstance";
import { atom, computed } from "nanostores";

export interface User {
  id: number;
  email: string;
  full_name: string;
  user_department?: string;
  address?: string;
  role: string;
  profile_picture?: string;
  team?: string;
  profession?: string;
  created_at?: string;
}

// Nanostores atoms - mevcut tokenManager'ı kullanarak
export const $user = atom<User | null>(null);
export const $token = atom<string | null>(null);

// Computed values (derived state)
export const $isLoggedIn = computed(
  $user,
  (user: User | null) => user !== null
);
export const $userName = computed(
  $user,
  (user: User | null) => user?.full_name || "Guest"
);
export const $userRole = computed(
  $user,
  (user: User | null) => user?.role || "user"
);
export const $userDepartment = computed(
  $user,
  (user: User | null) => user?.user_department || "N/A"
);

// Initialize store from localStorage (sadece browser'da)
if (typeof window !== "undefined") {
  const storedUser = tokenManager.getUser();
  const storedToken = tokenManager.getToken();

  if (storedUser) $user.set(storedUser);
  if (storedToken) $token.set(storedToken);
}

// Actions - tokenManager ile senkronize
export function setUser(user: User | null) {
  $user.set(user);
  if (user) {
    tokenManager.setUser(user);
  }
}

export function setToken(token: string | null) {
  $token.set(token);
  if (token) {
    tokenManager.setToken(token);
  }
}

export function updateUser(updates: Partial<User>) {
  const currentUser = $user.get();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    $user.set(updatedUser);
    tokenManager.setUser(updatedUser);
  }
}

export function logout() {
  $user.set(null);
  $token.set(null);
  tokenManager.removeToken();

  if (typeof window !== "undefined") {
    document.cookie =
      "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    document.cookie =
      "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    document.cookie =
      "auth=; path=/; domain=" +
      window.location.hostname +
      "; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie =
      "user=; path=/; domain=" +
      window.location.hostname +
      "; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
}

export function login(user: User, token: string) {
  $user.set(user);
  $token.set(token);
  tokenManager.setUser(user);
  tokenManager.setToken(token);
}

export function getUser(): User | null {
  let user = $user.get();
  if (!user && typeof window !== "undefined") {
    user = tokenManager.getUser();
    if (user) $user.set(user);
  }
  return user;
}

export function getToken(): string | null {
  let token = $token.get();
  if (!token && typeof window !== "undefined") {
    token = tokenManager.getToken();
    if (token) $token.set(token);
  }
  return token;
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

export function isTokenExpired(): boolean {
  const token = getToken();
  return token ? tokenManager.isTokenExpired(token) : true;
}
