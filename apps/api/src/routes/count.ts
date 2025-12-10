import { query } from "@/db";
import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth";

export const countUserInfo = new Elysia({ name: "routes:count" })
  .use(authPlugin)

  .get(
    "/users/:id/counts",
    async ({ params }) => {
      const { id } = params;

      const [
        meetingsRes,
        techtalksRes,
        documentsRes,
        reportsRes,
        ideasRes,
        totalUsers,
      ] = await Promise.all([
        query(
          `SELECT COUNT(*) AS count FROM meetings WHERE created_by = $1 AND deleted_at IS NULL`,
          [id]
        ),
        query(
          `SELECT COUNT(*) AS count FROM techtalks WHERE user_id = $1 AND deleted_at IS NULL`,
          [id]
        ),
        query(
          `SELECT COUNT(*) AS count FROM documents WHERE user_id = $1 AND deleted_at IS NULL`,
          [id]
        ),
        query(
          `SELECT COUNT(*) AS count FROM reports WHERE user_id = $1 AND deleted_at IS NULL`,
          [id]
        ),
        query(
          `SELECT COUNT(*) AS count FROM ideas WHERE user_id = $1 AND deleted_at IS NULL`,
          [id]
        ),
        query(`SELECT COUNT(*) AS count FROM users WHERE deleted_at IS NULL`),
      ]);

      return {
        meetings: Number(meetingsRes.rows[0]?.count ?? 0),
        techtalks: Number(techtalksRes.rows[0]?.count ?? 0),
        documents: Number(documentsRes.rows[0]?.count ?? 0),
        reports: Number(reportsRes.rows[0]?.count ?? 0),
        ideas: Number(ideasRes.rows[0]?.count ?? 0),
        totalUsers: Number(totalUsers.rows[0]?.count ?? 0),
      };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      detail: {
        summary: "Get user's content counts",
        tags: ["count"],
      },
    }
  )

  .get(
    "/my/counts",
    async ({ user }) => {
      if (!user) {
        return new Response("Unauthorized", { status: 401 });
      }

      const [meetingsRes, techtalksRes, documentsRes, reportsRes, ideasRes] =
        await Promise.all([
          query(
            `SELECT COUNT(*) AS count FROM meetings WHERE created_by = $1 AND deleted_at IS NULL`,
            [user.id]
          ),
          query(
            `SELECT COUNT(*) AS count FROM techtalks WHERE user_id = $1 AND deleted_at IS NULL`,
            [user.id]
          ),
          query(
            `SELECT COUNT(*) AS count FROM documents WHERE user_id = $1 AND deleted_at IS NULL`,
            [user.id]
          ),
          query(
            `SELECT COUNT(*) AS count FROM reports WHERE user_id = $1 AND deleted_at IS NULL`,
            [user.id]
          ),
          query(
            `SELECT COUNT(*) AS count FROM ideas WHERE user_id = $1 AND deleted_at IS NULL`,
            [user.id]
          ),
        ]);

      return {
        meetings: Number(meetingsRes.rows[0]?.count ?? 0),
        techtalks: Number(techtalksRes.rows[0]?.count ?? 0),
        documents: Number(documentsRes.rows[0]?.count ?? 0),
        reports: Number(reportsRes.rows[0]?.count ?? 0),
        ideas: Number(ideasRes.rows[0]?.count ?? 0),
      };
    },
    {
      detail: {
        summary: "Get current user's content counts",
        tags: ["count"],
      },
    }
  );
