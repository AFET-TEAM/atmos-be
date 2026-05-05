import { query } from "@/db";
import { Elysia, t } from "elysia";
import { createCrudRoutes } from "./_crudFactory";
import { mapRows } from "@/utils";

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
        "documents.id",
        "documents.user_id",
        "documents.title",
        "documents.description",
        "documents.file_url",
        "documents.file_name",
        "documents.content",
        "documents.date",
        "documents.created_at",
        "documents.updated_at",
        "documents.deleted_at",
        "users.full_name as owner_name",
        "users.email as owner_email",
      ],
      fromClause: "documents LEFT JOIN users ON users.id = documents.user_id",
      orderBy: "documents.date DESC",
    },
    get: {
      selectCols: [
        "id",
        "user_id",
        "title",
        "description",
        "file_url",
        "file_name",
        "content",
        "date",
        "created_at",
        "updated_at",
        "deleted_at",
      ],
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
      async ({ params }) => {
        const docId = parseInt(params.id);
        if (!docId) {
          return new Response(JSON.stringify({ error: "Invalid document ID" }), { status: 400 });
        }

        const res = await query(
          `SELECT file_data, file_name, title FROM documents WHERE id = $1 AND deleted_at IS NULL`,
          [docId],
        );

        const row = res.rows[0];
        if (!row || !row.file_data) {
          return new Response(JSON.stringify({ error: "File not found" }), { status: 404 });
        }

        const file_name = row.file_name as string | undefined;
        const title = row.title as string;
        const fileName = file_name || `${title}.bin`;
        const encodedFileName = encodeURIComponent(fileName);

        const buffer: Buffer = Buffer.isBuffer(row.file_data)
          ? row.file_data
          : Buffer.from(row.file_data);

        return new Response(buffer, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
            "Content-Length": String(buffer.length),
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
        file_data: t.Optional(t.String()),
        file_name: t.Optional(t.String()),
        frontend_count: t.Optional(t.Numeric()),
        backend_count: t.Optional(t.Numeric()),
        idea_assignee_id: t.Optional(t.Numeric()),
        date: t.Optional(t.String()),
        status: t.Optional(t.String()),
        approved_by: t.Optional(t.Array(t.String())),
        frontend_participants: t.Optional(t.Array(t.String())),
        backend_participants: t.Optional(t.Array(t.String())),
      }),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "file_url",
        "file_data",
        "file_name",
        "frontend_count",
        "backend_count",
        "idea_assignee_id",
        "date",
        "status",
        "approved_by",
        "frontend_participants",
        "backend_participants",
      ] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          user_id: t.Numeric(),
          title: t.String(),
          description: t.Optional(t.String()),
          file_url: t.Optional(t.String()),
          file_data: t.Optional(t.String()),
          file_name: t.Optional(t.String()),
          frontend_count: t.Optional(t.Numeric()),
          backend_count: t.Optional(t.Numeric()),
          idea_assignee_id: t.Optional(t.Numeric()),
          date: t.Optional(t.String()),
          status: t.Optional(t.String()),
          approved_by: t.Optional(t.Array(t.String())),
          frontend_participants: t.Optional(t.Array(t.String())),
          backend_participants: t.Optional(t.Array(t.String())),
        }),
      ),
      bodyKeys: [
        "user_id",
        "title",
        "description",
        "file_url",
        "file_data",
        "file_name",
        "frontend_count",
        "backend_count",
        "idea_assignee_id",
        "date",
        "status",
        "approved_by",
        "frontend_participants",
        "backend_participants",
      ] as const,
    },
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ user }) => user?.id ?? 0,
    },
    rbac: {
      can: async (ctx, action) => {
        const body = (ctx.body ?? {}) as any;
        const userRole = (ctx.user as any)?.role;
        const isAdminOrSupervisor = userRole === "admin" || userRole === "supervisor";
        
        if (action === "create") return true;
        
        // Only admin/supervisor can approve or reject
        if (
          action === "update" &&
          (body?.status === "approved" || body?.status === "rejected")
        ) {
          return isAdminOrSupervisor;
        }
        
        // Only admin/supervisor can delete
        if (action === "delete") {
          return isAdminOrSupervisor;
        }
        
        // For other updates, owner check will be enforced
        return true;
      },
      forbidMessage: "Only admins can change idea status",
    },
    before: {
      create: async (ctx) => {
        const body = ctx.body as any;

        if (!body.status) body.status = "pending";
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
  ).patch(
    "/ideas/:id/join-frontend",
    async ({ params, body }) => {
      const ideaId = parseInt((params as any).id);
      const userId = (body as any).user_id;
      
      if (!ideaId || !userId) {
        return new Response("Missing ideaId or userId", { status: 400 });
      }

      const res = await query(
        `UPDATE ideas 
         SET frontend_participants = COALESCE(frontend_participants, '[]'::jsonb) || $1
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [JSON.stringify([String(userId)]), ideaId],
      );

      if (!res.rows[0]) return new Response("Idea not found", { status: 404 });
      
      const idea = mapRows(res.rows)[0];
      return idea;
    },
    {
      body: t.Object({ user_id: t.String() }),
      detail: {
        summary: "Join idea as frontend developer (no auth required)",
        tags: ["content"],
      },
    },
  ).patch(
    "/ideas/:id/join-backend",
    async ({ params, body }) => {
      const ideaId = parseInt((params as any).id);
      const userId = (body as any).user_id;
      
      if (!ideaId || !userId) {
        return new Response("Missing ideaId or userId", { status: 400 });
      }

      const res = await query(
        `UPDATE ideas 
         SET backend_participants = COALESCE(backend_participants, '[]'::jsonb) || $1
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [JSON.stringify([String(userId)]), ideaId],
      );

      if (!res.rows[0]) return new Response("Idea not found", { status: 404 });
      
      const idea = mapRows(res.rows)[0];
      return idea;
    },
    {
      body: t.Object({ user_id: t.String() }),
      detail: {
        summary: "Join idea as backend developer (no auth required)",
        tags: ["content"],
      },
    },
  );

  return app.use(techtalks).use(documents).use(reports).use(ideas);
};
