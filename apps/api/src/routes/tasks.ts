import { t } from "elysia";
import { createCrudRoutes } from "./_crudFactory";

export const tasksRoutes = () => {
  const RelatedType = t.Union([
    t.Literal("techtalk"),
    t.Literal("document"),
    t.Literal("report"),
    t.Literal("idea"),
    t.Literal("meeting"),
  ]);

  return createCrudRoutes({
    table: "tasks",
    tag: "tasks",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "id DESC" },
    create: {
      bodySchema: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        created_by: t.Optional(t.Numeric()),
        assigned_to: t.Optional(t.Numeric()),
        due_date: t.Optional(t.String()),
        task_status_id: t.Optional(t.Numeric()),
        related_type: t.Optional(RelatedType),
        related_id: t.Optional(t.Numeric()),
      }),
      bodyKeys: [
        "title",
        "description",
        "created_by",
        "assigned_to",
        "due_date",
        "task_status_id",
        "related_type",
        "related_id",
      ] as const,
    },

    update: {
      bodySchema: t.Partial(
        t.Object({
          title: t.String(),
          description: t.Optional(t.String()),
          // created_by BİLEREK YOK: sahibi değişmesin
          assigned_to: t.Optional(t.Numeric()),
          due_date: t.Optional(t.String()),
          task_status_id: t.Optional(t.Numeric()),
          related_type: t.Optional(RelatedType),
          related_id: t.Optional(t.Numeric()),
        })
      ),
      bodyKeys: [
        "title",
        "description",
        "assigned_to",
        "due_date",
        "task_status_id",
        "related_type",
        "related_id",
      ] as const,
      touchUpdatedAt: true,
    },

    ownerCheck: {
      ownerField: "created_by",
      // Auth plugin'in eklediği gerçek kullanıcıyı kullan
      getUserId: ({ user }) => user?.id ?? 0,
    },

    // Şimdilik tüm aksiyonlara izin ver (RBAC'i sonra sıkılaştırırız)
    rbac: { can: async () => true },
  });
};
