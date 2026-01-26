import { t } from "elysia";
import { query } from "../db";
import { mapRows } from "../utils";
import { createCrudRoutes } from "./_crudFactory";

export const likesRoutes = () => {
  const base = createCrudRoutes({
    table: "likes",
    tag: "likes",
    softDelete: { enabled: false },

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

    create: {
      bodySchema: t.Object({
        user_id: t.Numeric(),
        target_type: t.String(),
        target_id: t.Numeric(),
      }),
      bodyKeys: ["user_id", "target_type", "target_id"] as const,
    },

    update: undefined,
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

    // Ekstra: toggle endpoint'i extend ile ekleyelim
    extend: (r, { basePath }) => {
      r.post(
        `${basePath}/toggle`,
        async ({ body, user }) => {
          if (!user) return new Response("Unauthorized", { status: 401 });
          const { target_type, target_id } = body as any;
          const user_id = user.id;
          try {
            const ins = await query(
              `INSERT INTO likes (user_id, target_type, target_id)
               VALUES ($1,$2,$3)
               ON CONFLICT (user_id, target_type, target_id)
               DO NOTHING RETURNING *`,
              [user_id, target_type, target_id],
            );
            if (ins.rows[0])
              return { action: "liked", ...mapRows(ins.rows)[0] };
            const del = await query(
              `DELETE FROM likes WHERE user_id=$1 AND target_type=$2 AND target_id=$3 RETURNING id`,
              [user_id, target_type, target_id],
            );
            return { action: "unliked", ...del.rows[0] };
          } catch {
            return new Response("Bad Request", { status: 400 });
          }
        },
        {
          body: t.Object({
            target_type: t.String(),
            target_id: t.Numeric(),
          }),
          detail: { summary: "Toggle like", tags: ["likes"] },
        },
      );
    },
  });

  return base;
};
