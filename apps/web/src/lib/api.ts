const API_BASE = import.meta.env.PUBLIC_API_BASE ?? "http://localhost:3000/v1";

export const paginateDefaults = { limit: 20, offset: 0 };

const toQS = (q?: Record<string, any>) =>
  q
    ? "?" +
      new URLSearchParams(
        Object.entries(q)
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

async function api<T>(
  path: string,
  init?: RequestInit,
  q?: Record<string, any>
) {
  const url = (path.startsWith("http") ? path : `${API_BASE}${path}`) + toQS(q);
  const res = await fetch(url, {
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(
      `${res.status} ${res.statusText}: ${t || "Request failed"}`
    );
  }
  const ct = res.headers.get("content-type") || "";
  return (
    ct.includes("application/json") ? res.json() : res.text()
  ) as Promise<T>;
}

export const get = <T>(path: string, q?: Record<string, any>) =>
  api<T>(path, { method: "GET" }, q);
export const post = <T>(path: string, body?: any) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });
export const patch = <T>(path: string, body?: any) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const del = <T>(path: string) => api<T>(path, { method: "DELETE" });
