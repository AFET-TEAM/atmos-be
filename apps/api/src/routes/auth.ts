import { query } from "@/db";
import Elysia, { t } from "elysia";
import { sendPasswordResetEmail } from "../email";
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

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export const authRoutes = () =>
  new Elysia({ name: "routes:auth" })
    .use(authPlugin)

    .post(
      "/auth/register",
      async ({ body, jwt, cookie }) => {
        const {
          email,
          password,
          full_name,
          address,
          user_department,
          team,
          directorate,
          gender,
          job,
        } = body;

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

          let departmentLabel = null;
          if (user_department) {
            const deptRes = await query(
              "SELECT name FROM departments WHERE id = $1",
              [user_department]
            );
            departmentLabel = deptRes.rows[0]?.name || null;
          }

          let directorateLabel = null;
          if (directorate) {
            const dirRes = await query(
              "SELECT name FROM directorates WHERE id = $1",
              [directorate]
            );
            directorateLabel = dirRes.rows[0]?.name || null;
          }

          let teamLabel = null;
          if (team) {
            const teamRes = await query(
              "SELECT name FROM teams WHERE id = $1",
              [team]
            );
            teamLabel = teamRes.rows[0]?.name || null;
          }

          let jobValue = null;
          if (job) {
            const jobRes = await query("SELECT name FROM jobs WHERE id = $1", [
              job,
            ]);
            jobValue = jobRes.rows[0]?.name || null;
          }

          const result = await query(
            "INSERT INTO users (email, password, full_name, user_status_id, address, user_department, department_label, directorate, directorate_label, team, team_label, gender, job, jobvalue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id, email, full_name, user_department, department_label, address, user_status_id, directorate, directorate_label, team, team_label, gender, role, job, jobvalue",
            [
              email, // $1
              hashedPassword, // $2
              full_name, // $3
              1, // $4 (user_status_id)
              address, // $5
              user_department, // $6
              departmentLabel, // $7
              directorate, // $8
              directorateLabel, // $9
              team, // $10
              teamLabel, // $11
              gender, // $12
              job, // $13
              jobValue, // $14
            ]
          );

          const newUser = result.rows[0];
          if (!newUser) {
            throw new Error("User creation failed");
          }

          const user: AuthUser = {
            id: newUser.id,
            email: newUser.email,
            role: "user",
            full_name: newUser.full_name,
            team: newUser.team,
            profession: undefined,
            profile_picture: undefined,
            address: newUser.address,
            connection: undefined,
            user_department: newUser.user_department,
            department_label: newUser.department_label,
            user_status_id: newUser.user_status_id,
            directorate: newUser.directorate,
            directorate_label: newUser.directorate_label,
            team_label: newUser.team_label,
            gender: newUser.gender,
            job: newUser.job,
            jobValue: newUser.jobvalue,
          };

          const token = await jwt.sign(user);

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
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          return new Response(
            JSON.stringify({ error: errorMessage, details: String(error) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      {
        body: t.Object({
          email: t.String({ format: "email" }),
          password: t.String({ minLength: 6 }),
          full_name: t.String({ minLength: 2 }),
          address: t.Optional(t.String()),
          user_department: t.Optional(t.Numeric()),
          team: t.Optional(t.String()),
          directorate: t.Optional(t.Numeric()),
          gender: t.Optional(t.String()),
          job: t.Optional(t.Numeric()),
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
            "SELECT id, email, password, full_name, team, team_label, profession, profile_picture, address, connection, user_department, department_label, user_status_id, role, directorate, directorate_label, gender, job, jobvalue FROM users WHERE email = $1 AND deleted_at IS NULL",
            [email]
          );

          if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: "User not found" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const dbUser = result.rows[0];
          if (!dbUser) {
            return new Response(JSON.stringify({ error: "User not found" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const isPasswordValid = await verifyPassword(
            password,
            dbUser.password
          );

          if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: "Invalid password" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const user: AuthUser = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role || "user",
            full_name: dbUser.full_name || "",
            team: dbUser.team,
            team_label: dbUser.team_label,
            profession: dbUser.profession,
            profile_picture: dbUser.profile_picture,
            address: dbUser.address,
            connection: dbUser.connection,
            user_department: dbUser.user_department,
            department_label: dbUser.department_label,
            user_status_id: dbUser.user_status_id,
            directorate: dbUser.directorate,
            directorate_label: dbUser.directorate_label,
            gender: dbUser.gender,
            job: dbUser.job,
            jobValue: dbUser.jobvalue,
          };

          const token = await jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            team: user.team,
            profession: user.profession,
            profile_picture: user.profile_picture,
            address: user.address,
            connection: user.connection,
            user_department: user.user_department,
            user_status_id: user.user_status_id,
            directorate: user.directorate,
            department_label: user.department_label,
            directorate_label: user.directorate_label,
            team_label: user.team_label,
            gender: user.gender,
            job: user.job,
            jobValue: user.jobValue,
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
          console.error("Login error:", error);
          return new Response(JSON.stringify({ error: "Login failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
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
    )

    .post(
      "/auth/forgot-password",
      async ({ body }) => {
        const { email } = body;

        try {
          const userRes = await query(
            "SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL",
            [email]
          );

          // Kullanıcı yoksa da başarılı dön (e-posta enum önleme)
          if (userRes.rows.length === 0) {
            return { ok: true };
          }

          const userId = userRes.rows[0].id;

          // Eski tokenleri temizle
          await query("DELETE FROM password_reset_tokens WHERE user_id = $1", [userId]);

          const tokenBytes = new Uint8Array(32);
          crypto.getRandomValues(tokenBytes);
          const token = Array.from(tokenBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

          await query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [userId, token, expiresAt]
          );

          const appUrl = process.env.APP_URL || "https://atos-dev.afet.team";
          const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

          await sendPasswordResetEmail(email, resetUrl);

          return { ok: true };
        } catch (error) {
          console.error("Forgot password error:", error);
          return new Response(
            JSON.stringify({ error: "İşlem sırasında bir hata oluştu" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      {
        body: t.Object({
          email: t.String({ format: "email" }),
        }),
        detail: { summary: "Şifremi unuttum - sıfırlama e-postası gönder", tags: ["auth"] },
      }
    )

    .post(
      "/auth/reset-password",
      async ({ body }) => {
        const { token, password } = body;

        try {
          const tokenRes = await query(
            "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1",
            [token]
          );

          if (tokenRes.rows.length === 0) {
            return new Response(
              JSON.stringify({ error: "Geçersiz veya süresi dolmuş token" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { user_id, expires_at } = tokenRes.rows[0];

          if (new Date() > new Date(expires_at)) {
            await query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);
            return new Response(
              JSON.stringify({ error: "Token süresi dolmuş, lütfen tekrar talep edin" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const hashedPassword = await hashPassword(password);

          await query("UPDATE users SET password = $1 WHERE id = $2", [
            hashedPassword,
            user_id,
          ]);

          await query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user_id]);

          return { ok: true };
        } catch (error) {
          console.error("Reset password error:", error);
          return new Response(
            JSON.stringify({ error: "Şifre sıfırlama sırasında hata oluştu" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      {
        body: t.Object({
          token: t.String({ minLength: 1 }),
          password: t.String({ minLength: 6 }),
        }),
        detail: { summary: "Şifreyi sıfırla (token ile)", tags: ["auth"] },
      }
    );
