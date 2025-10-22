import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth";
import type { AuthUser } from "../types/auth";

const JWT_COOKIE = "auth";

export const authRoutes = () =>
  new Elysia({ name: "routes:auth" })
    .use(authPlugin)
    .post(
      "/auth/login",
      async ({ body, jwt, setCookie }) => {
        const { email, password } = body as { email: string; password: string };

        // TODO: gerçek doğrulama
        if (email !== "demo@site.test" || password !== "demo")
          return new Response("Unauthorized", { status: 401 });

        const user: AuthUser = { id: 1, email, role: "editor" };
        const token = await jwt.sign({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        setCookie(JWT_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7,
        });

        return { token, user };
      },
      {
        body: t.Object({ email: t.String(), password: t.String() }),
        detail: { summary: "Login (demo)", tags: ["auth"] },
      }
    )
    .post(
      "/auth/logout",
      ({ setCookie, removeCookie }) => {
        setCookie(JWT_COOKIE, "", {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 0,
        });
        try {
          removeCookie?.(JWT_COOKIE);
        } catch {}
        return { ok: true };
      },
      { detail: { summary: "Logout", tags: ["auth"] } }
    )
    .get(
      "/auth/me",
      ({ user }) => user ?? new Response("Unauthorized", { status: 401 }),
      { detail: { summary: "Current user", tags: ["auth"] } }
    );
