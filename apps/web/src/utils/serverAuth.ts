// Server-side auth helper for Astro SSR
// Reads user from JWT cookie on each request - no global state pollution

import type { AstroCookies } from "astro";

export interface ServerUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  user_department?: string;
  department_label?: string;
  team?: string;
  team_label?: string;
  directorate?: string;
  directorate_label?: string;
  gender?: string;
  profile_picture?: string;
  address?: string;
}

function decodeJWT(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: any): boolean {
  if (!payload?.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get current user from cookie - use this in Astro components
 * This reads from the request cookie, not from global state
 */
export function getServerUser(cookies: AstroCookies): ServerUser | null {
  const token = cookies.get("auth")?.value;

  if (!token) return null;

  const payload = decodeJWT(token);

  if (!payload || isTokenExpired(payload)) return null;

  return {
    id: payload.id,
    email: payload.email,
    full_name: payload.full_name || "",
    role: payload.role || "user",
    user_department: payload.user_department,
    department_label: payload.department_label,
    team: payload.team,
    team_label: payload.team_label,
    directorate: payload.directorate,
    directorate_label: payload.directorate_label,
    gender: payload.gender,
    profile_picture: payload.profile_picture,
    address: payload.address,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  return getServerUser(cookies) !== null;
}

/**
 * Check if user has specific role
 */
export function hasRole(cookies: AstroCookies, roles: string[]): boolean {
  const user = getServerUser(cookies);
  if (!user) return false;
  return roles.includes(user.role);
}
