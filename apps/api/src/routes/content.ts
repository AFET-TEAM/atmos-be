import { query } from "@/db";
import { Elysia, t } from "elysia";
import { createCrudRoutes } from "./_crudFactory";

export const contentRoutes = () => {
  const app = new Elysia({ name: "routes:content" });

  const techtalks = createCrudRoutes({
    table: "techtalks",
    tag: "content",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "date DESC" },
    create: {
      bodySchema: t.Object({
        user_id: t.Numeric(),
        title: t.String(),
        description: t.Optional(t.String()),
        location: t.Optional(t.String()),
        duration_min: t.Optional(t.Numeric()),
        video_url: t.Optional(t.String()),
        thumbnail_url: t.Optional(t.String()),
        date: t.Optional(t.String()),
      }),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "location",
        "duration_min",
        "video_url",
        "thumbnail_url",
        "date",
      ] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          user_id: t.Numeric(),
          title: t.String(),
          description: t.Optional(t.String()),
          location: t.Optional(t.String()),
          duration_min: t.Optional(t.Numeric()),
          video_url: t.Optional(t.String()),
          thumbnail_url: t.Optional(t.String()),
          date: t.Optional(t.String()),
        })
      ),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "location",
        "duration_min",
        "video_url",
        "thumbnail_url",
        "date",
      ] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ body }) => (body as any)?.user_id ?? 0,
    },
    rbac: { can: async () => true },
  }).get("/lastTechTalks", async () => {
    const res = await query(`
     SELECT id, title, description, date, video_url, thumbnail_url
     FROM techtalks
      WHERE deleted_at IS NULL
      ORDER BY date DESC
      LIMIT 1
   `);

    return res.rows[0];
  });

  const documents = createCrudRoutes({
    table: "documents",
    tag: "content",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "date DESC" },
    create: {
      bodySchema: t.Object({
        user_id: t.Numeric(),
        title: t.String(),
        description: t.Optional(t.String()),
        file_url: t.Optional(t.String()),
        date: t.Optional(t.String()),
      }),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "file_url",
        "date",
      ] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          user_id: t.Numeric(),
          title: t.String(),
          description: t.Optional(t.String()),
          file_url: t.Optional(t.String()),
          date: t.Optional(t.String()),
        })
      ),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "file_url",
        "date",
      ] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ body }) => (body as any)?.user_id ?? 0,
    },
    rbac: { can: async () => true },
  });

  const reports = createCrudRoutes({
    table: "reports",
    tag: "content",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "date DESC" },
    create: {
      bodySchema: t.Object({
        user_id: t.Numeric(),
        title: t.String(),
        file_url: t.Optional(t.String()),
        date: t.Optional(t.String()),
      }),
      bodyKeys: ["user_id", "title", "file_url", "date"] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          user_id: t.Numeric(),
          title: t.String(),
          file_url: t.Optional(t.String()),
          date: t.Optional(t.String()),
        })
      ),
      bodyKeys: ["user_id", "title", "file_url", "date"] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ body }) => (body as any)?.user_id ?? 0,
    },
    rbac: { can: async () => true },
  });

  const ideas = createCrudRoutes({
    table: "ideas",
    tag: "content",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "date DESC" },
    create: {
      bodySchema: t.Object({
        user_id: t.Numeric(),
        title: t.String(),
        description: t.Optional(t.String()),
        file_url: t.Optional(t.String()),
        frontend_count: t.Optional(t.Numeric()),
        backend_count: t.Optional(t.Numeric()),
        idea_assignee_id: t.Optional(t.Numeric()),
        date: t.Optional(t.String()),
      }),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "file_url",
        "frontend_count",
        "backend_count",
        "idea_assignee_id",
        "date",
      ] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          user_id: t.Numeric(),
          title: t.String(),
          description: t.Optional(t.String()),
          file_url: t.Optional(t.String()),
          frontend_count: t.Optional(t.Numeric()),
          backend_count: t.Optional(t.Numeric()),
          idea_assignee_id: t.Optional(t.Numeric()),
          date: t.Optional(t.String()),
        })
      ),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "file_url",
        "frontend_count",
        "backend_count",
        "idea_assignee_id",
        "date",
      ] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ body }) => (body as any)?.user_id ?? 0,
    },
    rbac: { can: async () => true },
  });

  return app.use(techtalks).use(documents).use(reports).use(ideas);
};
