import { defineMiddleware } from "astro/middleware";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/", "/favicon.svg"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function decodeJwtPayload(token: string) {
  const part = token.split(".")[1];
  if (!part) throw new Error("Invalid token");
  const json = Buffer.from(part, "base64url").toString("utf-8");
  return JSON.parse(json);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;

  if (isPublicPath(pathname)) {
    return next();
  }

  const token = cookies.get("auth")?.value;

  if (!token || token.trim() === "") {
    return context.redirect("/auth/login");
  }

  try {
    const payload = decodeJwtPayload(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (!payload?.exp || payload.exp < currentTime) {
      cookies.delete("auth", { path: "/" });
      cookies.delete("user", { path: "/" });
      return context.redirect("/auth/login");
    }

    return next();
  } catch (err) {
    cookies.delete("auth", { path: "/" });
    cookies.delete("user", { path: "/" });
    return context.redirect("/auth/login");
  }
});
