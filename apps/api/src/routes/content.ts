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
        title: t.String(),
        description: t.Optional(t.String()),
        location: t.Optional(t.String()),
        duration_min: t.Optional(t.Numeric()),
        video_url: t.Optional(t.String()),
        thumbnail_url: t.Optional(t.String()),
        teams_room_url: t.Optional(t.String()),
        date: t.Optional(t.String()),
        time: t.Optional(t.String()),
        status: t.Optional(t.Boolean()),
      }),
      bodyKeys: [
        "title",
        "description",
        "location",
        "duration_min",
        "video_url",
        "thumbnail_url",
        "teams_room_url",
        "date",
        "time",
        "status",
      ] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          title: t.String(),
          description: t.Optional(t.String()),
          location: t.Optional(t.String()),
          duration_min: t.Optional(t.Numeric()),
          video_url: t.Optional(t.String()),
          thumbnail_url: t.Optional(t.String()),
          teams_room_url: t.Optional(t.String()),
          date: t.Optional(t.String()),
          time: t.Optional(t.String()),
          status: t.Optional(t.Boolean()),
        }),
      ),
      bodyKeys: [
        "title",
        "description",
        "location",
        "duration_min",
        "video_url",
        "thumbnail_url",
        "teams_room_url",
        "date",
        "time",
        "status",
      ] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ user }) => user?.id ?? 0,
    },
    rbac: { can: async () => true },
    before: {
      create: ({ user, body }) => {
        if (!user) throw new Response("Unauthorized", { status: 401 });
        (body as any).user_id = user.id;
      },
    },
  })
    .get(
      "/lastTechTalks",
      async () => {
        const res = await query(`
    SELECT
      t.id,
      u.full_name AS owner,
      t.title,
      t.description,
      t.date,
      t.video_url,
      t.thumbnail_url,
      t.teams_room_url,
      t.location,
      t.duration_min,
      t.status
    FROM techtalks t
    LEFT JOIN users u ON u.id = t.user_id
    WHERE t.deleted_at IS NULL AND t.date IS NOT NULL
    ORDER BY ABS(EXTRACT(EPOCH FROM (t.date::TIMESTAMPTZ - NOW())))
    LIMIT 3
  `);
        return { data: res.rows };
      },
      {
        detail: {
          summary: "get last tech talks",
          tags: ["content"],
        },
      },
    )
    .get(
      "/techtalks/:id",
      async ({ params }) => {
        const userId = parseInt(params.id);
        if (!userId) return { error: "Invalid user ID", data: [] };

        const res = await query(
          `SELECT id, title, description, date, video_url, thumbnail_url, location, duration_min, status
           FROM techtalks WHERE user_id = $1 AND deleted_at IS NULL ORDER BY date DESC`,
          [userId],
        );
        return { data: res.rows };
      },
      {
        detail: {
          summary: "get user's tech talks",
          tags: ["content"],
        },
      },
    );

  const documents = createCrudRoutes({
    table: "documents",
    tag: "content",
    softDelete: { enabled: true, column: "deleted_at" },
    list: {
      selectCols: [
        "documents.*",
        "users.full_name as owner_name",
        "users.email as owner_email",
      ],
      fromClause: "documents LEFT JOIN users ON users.id = documents.user_id",
      orderBy: "documents.date DESC",
    },
    create: {
      bodySchema: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        file_url: t.Optional(t.String()),
        file_data: t.Optional(t.String()),
        file_name: t.Optional(t.String()),
        content: t.Optional(t.String()),
        date: t.Optional(t.String()),
      }),
      bodyKeys: [
        "title",
        "description",
        "file_url",
        "file_data",
        "file_name",
        "date",
        "content",
      ] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          title: t.String(),
          description: t.Optional(t.String()),
          file_url: t.Optional(t.String()),
          file_data: t.Optional(t.String()),
          file_name: t.Optional(t.String()),
          date: t.Optional(t.String()),
          content: t.Optional(t.String()),
        }),
      ),
      bodyKeys: [
        "title",
        "description",
        "file_url",
        "file_data",
        "file_name",
        "content",
        "date",
      ] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ user }) => user?.id ?? 0,
    },
    rbac: {
      can: async (ctx) => {
        if (ctx.user?.role === "admin") return true;
        return true;
      },
    },
    before: {
      create: async (ctx) => {
        if (!ctx.user) throw new Response("Unauthorized", { status: 401 });
        const body = ctx.body as any;
        body.user_id = ctx.user.id;

        if (body.file_data) {
          const buffer = Buffer.from(body.file_data, "base64");
          body.file_data = buffer;
        }
      },
      update: async (ctx) => {
        const body = ctx.body as any;
        if (body.file_data) {
          const buffer = Buffer.from(body.file_data, "base64");
          body.file_data = buffer;
        }
      },
    },
  })
    .get(
      "/documents/:id",
      async ({ params }) => {
        const userId = parseInt(params.id);
        if (!userId) return { error: "Invalid user ID", data: [] };

        const res = await query(
          `SELECT id, title, description, file_url, date, content
         FROM documents WHERE user_id = $1 AND deleted_at IS NULL ORDER BY date DESC`,
          [userId],
        );
        return { data: res.rows };
      },
      {
        detail: {
          summary: "get user's documents",
          tags: ["content"],
        },
      },
    )
    .get(
      "/documents/:id/download",
      async ({ params, set }) => {
        const docId = parseInt(params.id);
        if (!docId) {
          set.status = 400;
          return { error: "Invalid document ID" };
        }

        const res = await query(
          `SELECT file_data, file_name, title FROM documents WHERE id = $1 AND deleted_at IS NULL`,
          [docId],
        );

        const row = res.rows[0];
        if (!row || !row.file_data) {
          set.status = 404;
          return { error: "File not found" };
        }

        const file_data = row.file_data;
        const file_name = row.file_name as string | undefined;
        const title = row.title as string;
        const fileName = file_name || `${title}.bin`;

        set.headers["Content-Type"] = "application/octet-stream";
        set.headers["Content-Disposition"] =
          `attachment; filename="${fileName}"`;

        return new Response(file_data, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${fileName}"`,
          },
        });
      },
      {
        detail: {
          summary: "Download document file",
          tags: ["content"],
        },
      },
    );

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
        }),
      ),
      bodyKeys: ["user_id", "title", "file_url", "date"] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ body }) => (body as any)?.user_id ?? 0,
    },
    rbac: { can: async () => true },
  }).get(
    "/reports/:id",
    async ({ params }) => {
      const userId = parseInt(params.id);
      if (!userId) return { error: "Invalid user ID", data: [] };

      const res = await query(
        `SELECT id, title, file_url, date
         FROM reports WHERE user_id = $1 AND deleted_at IS NULL ORDER BY date DESC`,
        [userId],
      );
      return { data: res.rows };
    },
    {
      detail: {
        summary: "get user's reports",
        tags: ["content"],
      },
    },
  );

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
        }),
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
  }).get(
    "/ideas/:id",
    async ({ params }) => {
      const userId = parseInt(params.id);
      if (!userId) return { error: "Invalid user ID", data: [] };

      const res = await query(
        `SELECT id, title, description, file_url, frontend_count, backend_count, idea_assignee_id, date
         FROM ideas WHERE user_id = $1 AND deleted_at IS NULL ORDER BY date DESC`,
        [userId],
      );
      return { data: res.rows };
    },
    {
      detail: {
        summary: "get user's ideas",
        tags: ["content"],
      },
    },
  );

  return app.use(techtalks).use(documents).use(reports).use(ideas);
};
