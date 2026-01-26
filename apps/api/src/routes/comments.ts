import { t } from "elysia";
import { query } from "../db";
import { mapRows } from "../utils";
import { createCrudRoutes } from "./_crudFactory";

export const commentsRoutes = () => {
  const base = createCrudRoutes({
    table: "comments",
    tag: "comments",
    softDelete: { enabled: true, column: "deleted_at" },

    list: {
      orderBy: "created_at DESC",
      querySchema: t.Object({
        target_type: t.Optional(t.String()),
        target_id: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
        include_deleted: t.Optional(t.Boolean()),
      }),
      buildFilters: (q) => {
        const whereFragments: string[] = [];
        const paramsHead: any[] = [];
        if (q.target_type) {
          paramsHead.push(String(q.target_type));
          whereFragments.push(`target_type = $${paramsHead.length}`);
        }
        if (q.target_id) {
          paramsHead.push(Number(q.target_id as string));
          whereFragments.push(`target_id = $${paramsHead.length}`);
        }
        return { whereFragments, paramsHead };
      },
    },

    get: { selectCols: ["*"] },

    create: {
      bodySchema: t.Object({
        target_type: t.String(),
        target_id: t.Numeric(),
        text: t.String(),
        parent_id: t.Optional(t.Numeric()),
      }),
      bodyKeys: [
        "user_id",
        "target_type",
        "target_id",
        "text",
        "parent_id",
      ] as const,
    },

    update: {
      bodySchema: t.Object({ text: t.String() }),
      bodyKeys: ["text"] as const,
      touchUpdatedAt: true,
    },

    // Owner: kayıt user_id'si ile eşleşmeli
    ownerCheck: {
      ownerField: "user_id",
      getUserId: ({ user }) => user?.id ?? 0,
    },

    // Basit RBAC: admin her şeyi, supervisor create/update/delete, user create+own update/delete
    rbac: {
      can: async ({ user }, action) => {
        if (!user) return action === "list" || action === "get";
        if (user.role === "admin") return true;
        if (user.role === "supervisor")
          return action !== "delete" ? true : true;
        if (user.role === "user")
          return (
            action === "list" ||
            action === "get" ||
            action === "create" ||
            action === "update" ||
            action === "delete"
          );
        return false;
      },
      forbidMessage: "You don't have permission",
    },

    // Küçük örnek hook
    before: {
      create: ({ user, body }) => {
        if (!user) throw new Response("Unauthorized", { status: 401 });
        // Body'deki user_id'yi oturumdan zorunlu kılmak istersen:
        (body as any).user_id = user.id;
      },
    },
  });

  // Override list to include user info
  base.get("/comments", async ({ query: q }) => {
    const target_type = q.target_type as string | undefined;
    const target_id = q.target_id ? Number(q.target_id) : undefined;

    const whereFragments: string[] = ["c.deleted_at IS NULL"];
    const params: any[] = [];

    if (target_type) {
      params.push(target_type);
      whereFragments.push(`c.target_type = $${params.length}`);
    }
    if (target_id) {
      params.push(target_id);
      whereFragments.push(`c.target_id = $${params.length}`);
    }

    const whereSql = whereFragments.join(" AND ");

    const sql = `
      SELECT
        c.id,
        c.user_id,
        c.target_type,
        c.target_id,
        c.text,
        c.parent_id,
        c.created_at,
        c.updated_at,
        u.full_name as user_name,
        u.profile_picture as user_avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE ${whereSql}
      ORDER BY c.created_at DESC
    `;

    const res = await query(sql, params);
    return mapRows(res.rows);
  });

  return base;
};
