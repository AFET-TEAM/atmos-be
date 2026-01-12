import { Elysia } from "elysia";
import { swaggerPlugin } from "./config/swagger";
import { query } from "./db";
import { authPlugin } from "./plugins/auth";
import { announcementsRoutes } from "./routes/announcements";
import { authRoutes } from "./routes/auth";
import { cityRoutes } from "./routes/city";
import { commentsRoutes } from "./routes/comments";
import { contentRoutes } from "./routes/content";
import { countUserInfo } from "./routes/count";
import { departmentsRoutes } from "./routes/department";
import { directorateRoutes } from "./routes/directorate";
import { filterRoutes } from "./routes/filter";
import { likesRoutes } from "./routes/likes";
import { lookupsRoutes } from "./routes/lookups";
import { meetingsRoutes } from "./routes/meetings";
import { TabHeaders } from "./routes/tabsheader";
import { tasksRoutes } from "./routes/tasks";
import { teamsRoutes } from "./routes/teams";
import { usersRoutes } from "./routes/users";

const CORS_ORIGINS = [
  "http://localhost:4321",
  "http://localhost:4322",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:4322",
  "https://atos-api.afet.space",
];

const app = new Elysia()
  .state("version", "1.0.0")
  .options("*", ({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "http://localhost:4321";
    set.headers["Access-Control-Allow-Credentials"] = "true";
    set.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    set.headers["Access-Control-Max-Age"] = "3600";
    return null;
  })
  .onBeforeHandle(({ request, set }) => {
    const origin = request.headers.get("origin") || "http://localhost:4321";

    set.headers["Access-Control-Allow-Origin"] = origin;
    set.headers["Access-Control-Allow-Credentials"] = "true";
    set.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
  })
  .use(swaggerPlugin)
  .use(authPlugin)

  .get("/", () => ({ ok: true, service: "elysia-postgres-api" }), {
    detail: { summary: "Health Root (unversioned)", tags: ["health"] },
  });

const v1 = new Elysia({ prefix: "/v1", name: "api:v1" })
  .use(authPlugin)
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
  .use(countUserInfo)
  .use(TabHeaders())
  .use(announcementsRoutes())
  .use(directorateRoutes())
  .use(filterRoutes());

app.use(v1);

app.listen({ port: 3000, hostname: "0.0.0.0" });
console.log("Elysia on http://localhost:3000 | API: /v1 | Swagger: /swagger");
