import { query } from "@/db";
import { Elysia, t } from "elysia";

export const filterRoutes = () => {
  return new Elysia({ name: "routes:filter", prefix: "/filter" })
    .options("/users-by-fields", () => new Response(null, { status: 204 }))
    .post(
      "/users-by-fields",
      async ({ body }) => {
        const { department, team, directorate } = body as any; // ✅ Alan adlarını değiştir

        let queryStr = `
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.team,
        u.profession,
        u.profile_picture,
        u.address,
        u.connection,
        u.user_department,
        u.user_status_id,
        u.role,
        u.directorate,
        d.id as departmentValue,
        d.name as departmentLabel,
        dir.id as directorateValue,
        dir.name as directorateLabel
      FROM users u
      LEFT JOIN departments d ON u.user_department = d.id::character varying
      LEFT JOIN directorates dir ON u.directorate = dir.id::character varying
      WHERE u.deleted_at IS NULL
    `;
        const queryParams: any[] = [];
        let paramIndex = 1;

        // ✅ Filtrelemeyi düzelt
        if (department && department !== "") {
          queryStr += ` AND u.user_department = $${paramIndex}::character varying`;
          queryParams.push(String(department));
          paramIndex++;
        }

        if (team && team !== "") {
          queryStr += ` AND u.team = $${paramIndex}`;
          queryParams.push(team);
          paramIndex++;
        }

        if (directorate && directorate !== "") {
          queryStr += ` AND u.directorate = $${paramIndex}::character varying`;
          queryParams.push(String(directorate));
          paramIndex++;
        }

        const result = await query(queryStr, queryParams);
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
          departmentValue: row.departmentValue
            ? Number(row.departmentValue)
            : undefined,
          departmentLabel: row.departmentLabel || undefined,
          directorateValue: row.directorateValue
            ? Number(row.directorateValue)
            : undefined,
          directorateLabel: row.directorateLabel || undefined,
          user_status_id: row.user_status_id,
          role: row.role,
        }));
      },
      {
        body: t.Object({
          department: t.Optional(t.String()), // ✅ Değiştirildi
          team: t.Optional(t.String()),
          directorate: t.Optional(t.String()), // ✅ String olmalı
        }),
        response: t.Array(
          t.Object({
            id: t.Number(),
            email: t.String(),
            full_name: t.String(),
            team: t.Optional(t.String()),
            profession: t.Nullable(t.String()), // ✅ Nullable yap
            profile_picture: t.Nullable(t.String()), // ✅ Nullable yap
            address: t.Nullable(t.String()), // ✅ Nullable yap
            connection: t.Optional(t.Boolean()),
            user_department: t.Optional(t.String()), // ✅ Ekle
            departmentValue: t.Optional(t.Number()),
            departmentLabel: t.Optional(t.String()),
            directorateValue: t.Optional(t.Number()),
            directorateLabel: t.Optional(t.String()),
            user_status_id: t.Optional(t.Number()),
            role: t.String(),
          })
        ),
        detail: {
          summary: "Get users filtered by department, team, and/or directorate",
          tags: ["filters"],
        },
      }
    )
    .get(
      "/departments",
      async () => {
        const result = await query(
          "SELECT id, name FROM departments WHERE deleted_at IS NULL ORDER BY name"
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
        detail: { summary: "Get all departments", tags: ["filters"] },
      }
    )
    .get(
      "/teams",
      async () => {
        const result = await query(
          "SELECT DISTINCT team FROM users WHERE team IS NOT NULL AND deleted_at IS NULL ORDER BY team"
        );
        return result.rows.map((row) => ({
          team: String(row.team),
        }));
      },
      {
        response: t.Array(
          t.Object({
            team: t.String(),
          })
        ),
        detail: { summary: "Get all teams", tags: ["filters"] },
      }
    )
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
        detail: { summary: "Get all directorates", tags: ["filters"] },
      }
    );
};
