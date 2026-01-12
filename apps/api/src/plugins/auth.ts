import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import type { AuthUser } from "../types/auth";

const JWT_COOKIE = "auth";

export const authPlugin = new Elysia({ name: "plugin:auth" })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "dev-secret-change-me",
      exp: "7d",
    })
  )

  .derive<{ user?: AuthUser }>(async ({ headers, cookie, jwt }) => {
    const auth = headers["authorization"] || headers["Authorization"];
    let token =
      typeof auth === "string" && auth.startsWith("Bearer ")
        ? auth.slice(7)
        : undefined;

    if (!token && typeof cookie?.[JWT_COOKIE] === "string")
      token = cookie[JWT_COOKIE] as string;

    let user: AuthUser | undefined;
    if (token) {
      try {
        const payload = await jwt.verify(token);
        if (payload && typeof payload === "object") {
          user = {
            id: Number((payload as any).id),
            email: String((payload as any).email),
            role: ((payload as any).role ?? "user") as AuthUser["role"],
            full_name: String((payload as any).full_name || ""),
            team: (payload as any).team || undefined,
            profession: (payload as any).profession || undefined,
            profile_picture: (payload as any).profile_picture || undefined,
            address: (payload as any).address || undefined,
            connection: (payload as any).connection || undefined,
            user_department: (payload as any).user_department || undefined,
            user_status_id: (payload as any).user_status_id || undefined,
            directorate: (payload as any).directorate || undefined,
            department_label: (payload as any).department_label || undefined,
            directorate_label: (payload as any).directorate_label || undefined,
            team_label: (payload as any).team_label || undefined,
            gender: (payload as any).gender || undefined,
            job: String((payload as any).job || ""),
            jobValue: String((payload as any).jobValue || ""),
          };
        }
      } catch {}
    }
    return { user };
  })

  .as("scoped");
