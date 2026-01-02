import { query } from "@/db";
import Elysia, { t } from "elysia";

export const announcementsRoutes = () =>
  new Elysia({ name: "routes:announcements" })
    .get(
      "/announcements",
      async () => {
        const result = await query(
          "SELECT id, title, content, created_at FROM announcements ORDER BY created_at DESC"
        );
        return result.rows.map((row) => ({
          id: Number(row.id),
          title: String(row.title),
          content: String(row.content),
          created_at: String(row.created_at),
        }));
      },
      {
        response: t.Array(
          t.Object({
            id: t.Number(),
            title: t.String(),
            content: t.String(),
            created_at: t.String(),
          })
        ),
        detail: { summary: "Get all announcements", tags: ["announcements"] },
      }
    )
    .post(
      "/announcements",
      async ({ body }) => {
        const { title, content } = body as any;
        const result = await query(
          "INSERT INTO announcements (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING id, title, content, created_at",
          [title, content]
        );
        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to create announcement");
        }
        return {
          id: Number(row.id),
          title: String(row.title),
          content: String(row.content),
          created_at: String(row.created_at),
        };
      },
      {
        body: t.Object({
          title: t.String(),
          content: t.String(),
        }),
        response: t.Object({
          id: t.Number(),
          title: t.String(),
          content: t.String(),
          created_at: t.String(),
        }),
        detail: {
          summary: "Create a new announcement",
          tags: ["announcements"],
        },
      }
    )
    .put(
      "/announcements/:id",
      async ({ params, body }) => {
        const announcementId = Number((params as any).id);
        const { title, content } = body as any;

        if (isNaN(announcementId)) {
          throw new Error("Invalid announcement ID");
        }

        const result = await query(
          "UPDATE announcements SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING id, title, content, created_at, updated_at",
          [title, content, announcementId]
        );

        if (result.rowCount === 0) {
          throw new Error("Announcement not found");
        }

        const row = result.rows[0];
        if (!row) {
          throw new Error("Failed to update announcement");
        }
        return {
          id: Number(row.id),
          title: String(row.title),
          content: String(row.content),
          created_at: String(row.created_at),
          updated_at: String(row.updated_at),
        };
      },
      {
        params: t.Object({ id: t.Numeric() }),
        body: t.Object({
          title: t.String(),
          content: t.String(),
        }),
        response: t.Object({
          id: t.Number(),
          title: t.String(),
          content: t.String(),
          created_at: t.String(),
          updated_at: t.String(),
        }),
        detail: {
          summary: "Update an announcement by ID",
          tags: ["announcements"],
        },
      }
    )
    .delete(
      "/announcements/:id",
      async ({ params }) => {
        const announcementId = Number((params as any).id);
        if (isNaN(announcementId)) {
          return { error: "Invalid announcement ID" };
        }

        const result = await query(
          "DELETE FROM announcements WHERE id = $1 RETURNING id",
          [announcementId]
        );

        if (result.rowCount === 0) {
          return { error: "Announcement not found" };
        }

        return { success: true };
      },
      {
        params: t.Object({ id: t.Numeric() }),
        detail: {
          summary: "Delete an announcement by ID",
          tags: ["announcements"],
        },
      }
    );
