import { swagger } from "@elysiajs/swagger";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

export const swaggerPlugin = swagger({
  path: "/swagger",
  documentation: {
    info: {
      title: "Elysia Postgres API",
      version: "1.0.0",
      description: "CRUD endpoints over PostgreSQL. Versioned under /v1.",
    },
    servers: [{ url: BASE_URL }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
    },
  },
});
