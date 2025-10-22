import { Elysia, t } from "elysia";
import { query } from "../db";
import { mapRows, pick, qp } from "../utils";
import { createCrudRoutes } from "./_crudFactory";

export const usersRoutes = () => {
  const users = createCrudRoutes({
    table: "users",
    tag: "users",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "id DESC" },
    create: {
      bodySchema: t.Object({
        email: t.String(),
        full_name: t.String(),
        team: t.Optional(t.String()),
        profession: t.Optional(t.String()),
        profile_picture: t.Optional(t.String()),
        address: t.Optional(t.String()),
        connection: t.Optional(t.Boolean()),
        user_status_id: t.Optional(t.Numeric()),
      }),
      bodyKeys: [
        "email",
        "full_name",
        "team",
        "profession",
        "profile_picture",
        "address",
        "connection",
        "user_status_id",
      ] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          email: t.String(),
          full_name: t.String(),
          team: t.Optional(t.String()),
          profession: t.Optional(t.String()),
          profile_picture: t.Optional(t.String()),
          address: t.Optional(t.String()),
          connection: t.Optional(t.Boolean()),
          user_status_id: t.Optional(t.Numeric()),
        })
      ),
      bodyKeys: [
        "email",
        "full_name",
        "team",
        "profession",
        "profile_picture",
        "address",
        "connection",
        "user_status_id",
      ] as const,
      touchUpdatedAt: true,
    },
    // Kendi kaydını güncellesin/silsin
    ownerCheck: {
      ownerField: "id",
      // Auth ekleyince ctx.user?.id kullanacağız.
      // Şimdilik "herkes kendi :id’sini" kuralı için params’dan id alıyoruz,
      // ama prod’da mutlaka user.id kullanın:
      // getUserId: ({ user }) => user?.id ?? 0,
      getUserId: ({ params }) => Number((params as any)?.id ?? 0),
    },
    rbac: { can: async () => true },
  });

  // /users/:id/about (1-1)
  const plugin = new Elysia({ name: "routes:users:about" })
    .get(
      "/users/:id/about",
      async ({ params }) => {
        const res = await query("SELECT * FROM about_me WHERE user_id = $1", [
          Number((params as any).id),
        ]);
        return res.rows[0]
          ? mapRows(res.rows)[0]
          : new Response("Not Found", { status: 404 });
      },
      {
        params: t.Object({ id: t.Numeric() }),
        detail: { summary: "Get about_me by user id", tags: ["about_me"] },
      }
    )
    .put(
      "/users/:id/about",
      async ({ params, body }) => {
        const userId = Number((params as any).id);
        const data = pick(body as any, ["title", "description"]);
        const { keys, params: ps, values } = qp({ ...data, user_id: userId });
        const conflict = keys.map((k) => `"${k}" = EXCLUDED."${k}"`).join(", ");
        const res = await query(
          `INSERT INTO about_me (${keys.map((k) => `"${k}"`).join(",")})
           VALUES (${ps.join(",")})
           ON CONFLICT (user_id) DO UPDATE SET ${conflict} RETURNING *`,
          values
        );
        return mapRows(res.rows)[0];
      },
      {
        params: t.Object({ id: t.Numeric() }),
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
        }),
        detail: { summary: "Upsert about_me for user", tags: ["about_me"] },
      }
    );

  return new Elysia({ name: "routes:users:all" }).use(users).use(plugin);
};
