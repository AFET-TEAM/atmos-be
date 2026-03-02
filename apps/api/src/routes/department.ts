import { Elysia, t } from "elysia";
import { query } from "../db";
import { mapRows } from "../utils";

export const departmentsRoutes = () => {
  return new Elysia({ name: "routes:departments" })
    .get(
      "/departments",
      async () => {
        const res = await query(`
          SELECT id, name, created_at
          FROM departments
          ORDER BY name ASC
        `);

        return mapRows(res.rows);
      },
      {
        detail: {
          summary: "List all departments",
          tags: ["departments"],
        },
      }
    )
    .post(
      "/departments",
      async ({ body }) => {
        const { name } = body as any;

        const res = await query(
          `
          INSERT INTO departments (name, created_at, updated_at)
          VALUES ($1, NOW(), NOW())
          RETURNING id, name, created_at
        `,
          [name]
        );

        return mapRows(res.rows)[0];
      },
      {
        body: t.Object({
          name: t.String(),
        }),
        detail: {
          summary: "Create new department",
          tags: ["departments"],
        },
      }
    )
    .get(
      "/departments/:id",
      async ({ params }) => {
        const res = await query(
          `
          SELECT id, name, created_at
          FROM departments
          WHERE id = $1
        `,
          [Number((params as any).id)]
        );

        if (res.rows.length === 0) {
          return new Response("Department not found", { status: 404 });
        }

        return mapRows(res.rows)[0];
      },
      {
        params: t.Object({ id: t.Numeric() }),
        detail: {
          summary: "Get department by ID",
          tags: ["departments"],
        },
      }
    );
};
