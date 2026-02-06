// config/swagger.ts
import { swagger } from "@elysiajs/swagger";

const servers = [
  { url: "https://api-atos-dev.afet.team", description: "Production" },
  { url: "http://localhost:3000", description: "Local Development" },
];

export const swaggerPlugin = swagger({
  path: "/swagger",
  documentation: {
    info: {
      title: "Elysia Postgres API",
      version: "1.0.0",
      description: "CRUD endpoints over PostgreSQL. Versioned under /v1.",
    },
    // BASE_URL yerine doğrudan listeyi verelim
    servers: servers,
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
    },
  },
});
