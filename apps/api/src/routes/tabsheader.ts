import { t } from "elysia";
import { createCrudRoutes } from "./_crudFactory";
export const TabHeaders = () => {
  const tabHeaders = createCrudRoutes({
    table: "tab_headers",
    tag: "tab_headers",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "id DESC" },
    create: {
      bodySchema: t.Object({
        name: t.String(),
        label: t.String(),
        icon: t.Optional(t.String()),
      }),
      bodyKeys: ["name", "label", "icon"] as const,
    },
    update: {
      bodySchema: t.Object({
        name: t.Optional(t.String()),
        label: t.Optional(t.String()),
        icon: t.Optional(t.String()),
      }),
      bodyKeys: ["name", "label", "icon"] as const,
    },
    rbac: { can: async () => true },
  });

  return tabHeaders;
};
