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
  // 1) derive'e generic ver: { user?: AuthUser }
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
          };
        }
      } catch {
        // invalid token -> anonymous
      }
    }
    return { user };
  })
  // 2) plugin olarak işaretle (tipler taşınsın)
  .as("scoped");
