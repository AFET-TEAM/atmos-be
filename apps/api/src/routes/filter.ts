import { query } from "@/db";
import { Elysia, t } from "elysia";

export const filterRoutes = () => {
  return new Elysia({ name: "routes:filter", prefix: "/filter" })
    .options("/users-by-fields", () => new Response(null, { status: 204 }))
    .post(
      "/users-by-fields",
      async ({ body }) => {
        const { department, team, directorate } = body as any;

        let queryStr = `
      SELECT
        u.*,
        d.id AS department_value,
        d.name AS department_label,
        dir.id AS directorate_value,
        dir.name AS directorate_label
      FROM users u
      LEFT JOIN departments d ON u.user_department = d.id::character varying
      LEFT JOIN directorates dir ON u.directorate = dir.id::character varying
      WHERE u.deleted_at IS NULL AND u.is_active IS TRUE AND (u.role IS NULL OR u.role != 'supervisor')
    `;
        const queryParams: any[] = [];
        let paramIndex = 1;

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
        const { mapRows } = await import("@/utils");
        const rows = mapRows(result.rows as any) as any[];

        // Convert Date objects to ISO strings for validation/serialization
        for (const r of rows) {
          if (r.createdAt instanceof Date)
            r.createdAt = r.createdAt.toISOString();
          if (r.updatedAt instanceof Date)
            r.updatedAt = r.updatedAt.toISOString();
          if (r.deletedAt instanceof Date)
            r.deletedAt = r.deletedAt.toISOString();
          // ensure missing optional fields remain undefined (not null)
          if (r.profilePicture === undefined) r.profilePicture = undefined;
        }

        return rows;
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
            fullName: t.Optional(t.String()),
            team: t.Optional(t.String()),
            profession: t.Optional(t.Nullable(t.String())),
            profilePicture: t.Optional(t.Nullable(t.String())),
            address: t.Nullable(t.String()),
            connection: t.Optional(t.Boolean()),
            userDepartment: t.Optional(t.String()),
            departmentValue: t.Optional(t.Number()),
            departmentLabel: t.Optional(t.String()),
            directorateValue: t.Optional(t.Number()),
            directorateLabel: t.Optional(t.String()),
            userStatusId: t.Optional(t.Number()),
            role: t.Optional(t.String()),
            createdAt: t.Optional(t.String()),
            updatedAt: t.Optional(t.String()),
            deletedAt: t.Nullable(t.String()),
            password: t.Optional(t.String()),
            directorate: t.Optional(t.String()),
            gender: t.Optional(t.Nullable(t.String())),
            job: t.Optional(t.String()),
            jobvalue: t.Optional(t.String()),
            isActive: t.Optional(t.Boolean()),
          }),
        ),
        detail: {
          summary: "Get users filtered by department, team, and/or directorate",
          tags: ["filters"],
        },
      },
    )
    .get(
      "/departments",
      async () => {
        const result = await query(
          "SELECT id, name FROM departments WHERE deleted_at IS NULL ORDER BY name",
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
          }),
        ),
        detail: { summary: "Get all departments", tags: ["filters"] },
      },
    )
    .get(
      "/teams",
      async () => {
        const result = await query(
          "SELECT DISTINCT team FROM users WHERE team IS NOT NULL AND deleted_at IS NULL ORDER BY team",
        );
        return result.rows.map((row) => ({
          team: String(row.team),
        }));
      },
      {
        response: t.Array(
          t.Object({
            team: t.String(),
          }),
        ),
        detail: { summary: "Get all teams", tags: ["filters"] },
      },
    )
    .get(
      "/directorates",
      async () => {
        const result = await query(
          "SELECT id, name FROM directorates WHERE deleted_at IS NULL ORDER BY name",
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
          }),
        ),
        detail: { summary: "Get all directorates", tags: ["filters"] },
      },
    );
};
