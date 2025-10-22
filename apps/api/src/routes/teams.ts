import { Elysia, t } from "elysia";
import { query } from "../db";
import { mapRows } from "../utils";
import { createCrudRoutes } from "./_crudFactory";

export const teamsRoutes = () => {
  const teams = createCrudRoutes({
    table: "teams",
    tag: "teams",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "id DESC" },
    create: {
      bodySchema: t.Object({ name: t.String() }),
      bodyKeys: ["name"] as const,
    },
    update: {
      bodySchema: t.Object({ name: t.String() }),
      bodyKeys: ["name"] as const,
    },
    rbac: { can: async () => true },
  });

  const memberships = createCrudRoutes({
    table: "team_memberships",
    tag: "teams",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "id DESC" },
    create: {
      bodySchema: t.Object({
        team_id: t.Numeric(),
        user_id: t.Numeric(),
        role: t.Optional(t.String()),
        joined_at: t.Optional(t.String()),
        left_at: t.Optional(t.String()),
      }),
      bodyKeys: ["team_id", "user_id", "role", "joined_at", "left_at"] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          team_id: t.Numeric(),
          user_id: t.Numeric(),
          role: t.Optional(t.String()),
          joined_at: t.Optional(t.String()),
          left_at: t.Optional(t.String()),
        })
      ),
      bodyKeys: ["team_id", "user_id", "role", "joined_at", "left_at"] as const,
    },
    rbac: { can: async () => true },
  });

  // /teams/:id/members (JOIN)
  const members = new Elysia({ name: "routes:teams:members" }).get(
    "/teams/:id/members",
    async ({ params, query: q }) => {
      const limit = Number((q as any).limit ?? 50);
      const offset = Number((q as any).offset ?? 0);
      const res = await query(
        `SELECT tm.*, u.full_name, u.email
         FROM team_memberships tm
         JOIN users u ON u.id = tm.user_id
         WHERE tm.team_id = $1
         ORDER BY tm.id DESC
         LIMIT $2 OFFSET $3`,
        [Number((params as any).id), limit, offset]
      );
      return mapRows(res.rows);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
      detail: { summary: "List team members", tags: ["teams"] },
    }
  );

  return new Elysia({ name: "routes:teams:all" })
    .use(teams)
    .use(memberships)
    .use(members);
};
