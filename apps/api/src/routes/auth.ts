import { query } from "@/db";
import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth";
import type { AuthUser } from "../types/auth";

const JWT_COOKIE = "auth";

// Basit password hashing (production'da bcrypt kullanılmalı)
async function hashPassword(password: string): Promise<string> {
  // TODO: bcrypt veya argon2 kullan
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export const authRoutes = () =>
  new Elysia({ name: "routes:auth" })
    .use(authPlugin)

    .post(
      "/auth/register",
      async ({ body, jwt, cookie }) => {
        const { email, password, full_name } = body;

        try {

          const existingUser = await query(
            "SELECT id FROM users WHERE email = $1",
            [email]
          );

          if (existingUser.rows.length > 0) {
            return new Response(
              JSON.stringify({ error: "Email already exists" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const hashedPassword = await hashPassword(password);

          const result = await query(
            "INSERT INTO users (email, password, full_name, user_status_id) VALUES ($1, $2, $3, 1) RETURNING id, email, full_name",
            [email, hashedPassword, full_name]
          );

          const newUser = result.rows[0];
          if (!newUser) {
            throw new Error("User creation failed");
          }
          const user: AuthUser = {
            id: newUser.id,
            email: newUser.email,
            role: "user",
          };

          const token = await jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
          });

          if (cookie[JWT_COOKIE]) {
            cookie[JWT_COOKIE].set({
              value: token,
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: process.env.NODE_ENV === "production",
              maxAge: 60 * 60 * 24 * 7,
            });
          }

          return { token, user };
        } catch (error) {
          console.error("Register error:", error);
          return new Response(
            JSON.stringify({ error: "Registration failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      {
        body: t.Object({
          email: t.String({ format: "email" }),
          password: t.String({ minLength: 6 }),
          full_name: t.String({ minLength: 2 }),
        }),
        detail: { summary: "Register new user", tags: ["auth"] },
      }
    )

    .post(
      "/auth/login",
      async ({ body, jwt, cookie }) => {
        const { email, password } = body;

        try {
          const result = await query(
            "SELECT id, email, password, full_name FROM users WHERE email = $1 AND deleted_at IS NULL",
            [email]
          );

          if (result.rows.length === 0) {
            return new Response(
              JSON.stringify({ error: "User not found" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const dbUser = result.rows[0];
          if (!dbUser) {
             return new Response(
              JSON.stringify({ error: "User not found" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const isPasswordValid = await verifyPassword(password, dbUser.password);

          if (!isPasswordValid) {
            return new Response(
              JSON.stringify({ error: "Invalid password" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const user: AuthUser = {
            id: dbUser.id,
            email: dbUser.email,
            role: "user", // TODO: Veritabanından role bilgisini al
          };

          // JWT token oluştur
          const token = await jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
          });

          // Cookie'ye kaydet
          // Cookie'ye kaydet
          if (cookie[JWT_COOKIE]) {
            cookie[JWT_COOKIE].set({
              value: token,
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              secure: process.env.NODE_ENV === "production",
              maxAge: 60 * 60 * 24 * 7, // 7 gün
            });
          }

          return { token, user };
        } catch (error) {
          console.error("Login error:", error);
          return new Response(
            JSON.stringify({ error: "Login failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      {
        body: t.Object({
          email: t.String({ format: "email" }),
          password: t.String({ minLength: 1 }),
        }),
        detail: { summary: "Login", tags: ["auth"] },
      }
    )

    .post(
      "/auth/logout",
      ({ cookie, removeCookie }) => {
        if (cookie[JWT_COOKIE]) {
          cookie[JWT_COOKIE].set({
            value: "",
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
          });
        }
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
