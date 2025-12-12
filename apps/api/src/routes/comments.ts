import { t } from "elysia";
import { createCrudRoutes } from "./_crudFactory";

export const commentsRoutes = () =>
  createCrudRoutes({
    table: "comments",
    tag: "comments",
    softDelete: { enabled: true, column: "deleted_at" },

    list: {
      orderBy: "created_at DESC",
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
        user_id: t.Numeric(),
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
