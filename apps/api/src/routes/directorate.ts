import { query } from "@/db";
import Elysia, { t } from "elysia";

export const directorateRoutes = () =>
  new Elysia({ name: "routes:directorate" })
    .get(
      "/directorates",
      async () => {
        const result = await query(
          "SELECT id, name FROM directorates WHERE deleted_at IS NULL ORDER BY name"
        );
        return result.rows.map((row) => ({
          id: Number(row.id),
          name: String(row.name),
        }));
      },
      {
        response: t.Array(
          t.Object({
            id: t.Number(),
            name: t.String(),
          })
        ),
        detail: { summary: "Get all directorates", tags: ["directorates"] },
      }
    )

    .get(
      "/directorates/:directorateId/users",
      async ({ params }) => {
        const { directorateId } = params;
        const result = await query(
          "SELECT id, email, full_name, team, profession, profile_picture, address, connection, user_department, user_status_id, role FROM users WHERE directorate = $1 AND deleted_at IS NULL",
          [Number(directorateId)]
        );
        return result.rows.map((row) => ({
          id: Number(row.id),
          email: String(row.email),
          full_name: String(row.full_name),
          team: row.team,
          profession: row.profession,
          profile_picture: row.profile_picture,
          address: row.address,
          connection: row.connection,
          user_department: row.user_department,
          user_status_id: row.user_status_id,
          role: row.role,
        }));
      },
      {
        response: t.Array(
          t.Object({
            id: t.Number(),
            email: t.String(),
            full_name: t.String(),
            team: t.Optional(t.String()),
            profession: t.Optional(t.String()),
            profile_picture: t.Optional(t.String()),
            address: t.Optional(t.String()),
            connection: t.Optional(t.Boolean()),
            user_department: t.Optional(t.String()),
            user_status_id: t.Optional(t.Number()),
            role: t.String(),
          })
        ),
        detail: {
          summary: "Get users by directorate ID",
          tags: ["directorates"],
        },
      }
    )

    .post(
      "/directorates",
      async ({ body }) => {
        const { directorate } = body as any;
        const result = await query(
          "INSERT INTO directorates (name) VALUES ($1) RETURNING id, name, created_at",
          [directorate]
        );
        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to create directorate");
        }
        return {
          id: Number(row.id),
          name: String(row.name),
        };
      },
      {
        body: t.Object({
          directorate: t.String(),
        }),
        response: t.Object({
          id: t.Number(),
          name: t.String(),
        }),
        detail: { summary: "Create a new directorate", tags: ["directorates"] },
      }
    );
