import { query } from "@/db";
import Elysia, { t } from "elysia";

export const jobsRoutes = () =>
  new Elysia({ name: "routes:jobs" })
    .get(
      "/jobs",
      async () => {
        const result = await query(
          "SELECT id, name FROM jobs WHERE deleted_at IS NULL ORDER BY name"
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
        detail: { summary: "Get all jobs", tags: ["jobs"] },
      }
    )
    .get(
      "/jobs/:jobId/users",
      async ({ params }: { params: { jobId: string } }) => {
        const { jobId } = params;
        const result = await query(
          "SELECT id, email, full_name, team, profession, profile_picture, address, connection, user_department, user_status_id, role FROM users WHERE job_id = $1 AND deleted_at IS NULL",
          [Number(jobId)]
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
            user_status_id: t.Number(),
            role: t.String(),
          })
        ),
        detail: { summary: "Get users by job ID", tags: ["jobs", "users"] },
      }
    );
