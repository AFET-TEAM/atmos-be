import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { swaggerPlugin } from "./config/swagger";
import { query } from "./db";
import { authPlugin } from "./plugins/auth";
import { authRoutes } from "./routes/auth";
import { cityRoutes } from "./routes/city";
import { commentsRoutes } from "./routes/comments";
import { contentRoutes } from "./routes/content";
import { countUserInfo } from "./routes/count";
import { departmentsRoutes } from "./routes/department";
import { likesRoutes } from "./routes/likes";
import { lookupsRoutes } from "./routes/lookups";
import { meetingsRoutes } from "./routes/meetings";
import { tasksRoutes } from "./routes/tasks";
import { teamsRoutes } from "./routes/teams";
import { usersRoutes } from "./routes/users";

const app = new Elysia()
  .state("version", "1.0.0")
  .use(
    cors({
      origin: ["http://localhost:4321", "http://127.0.0.1:4321"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    })
  )
  .use(swaggerPlugin)
  .use(authPlugin)

  .get("/", () => ({ ok: true, service: "elysia-postgres-api" }), {
    detail: { summary: "Health Root (unversioned)", tags: ["health"] },
  });

const v1 = new Elysia({ prefix: "/v1", name: "api:v1" })
  .onAfterHandle(({ set }) => {
    set.headers["x-api-version"] = "1";
  })
  .use(authRoutes())
  .get(
    "/health",
    async () => {
      const res = await query("SELECT 1 as ok");
      return { ok: res.rows[0]?.ok === 1 };
    },
    { detail: { summary: "DB health check (v1)", tags: ["health"] } }
  )
  .use(usersRoutes())
  .use(teamsRoutes())
  .use(meetingsRoutes())
  .use(commentsRoutes())
  .use(likesRoutes())
  .use(lookupsRoutes())
  .use(tasksRoutes())
  .use(contentRoutes())
  .use(departmentsRoutes())
  .use(cityRoutes())
  .use(countUserInfo);
app.use(v1);

app.listen({ port: 3000, hostname: "0.0.0.0" });
console.log("Elysia on http://localhost:3000 | API: /v1 | Swagger: /swagger");
