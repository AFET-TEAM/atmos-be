import { Elysia, t } from "elysia";
import { query } from "../db";
import { mapRows, pick, qp } from "../utils";
import { createCrudRoutes } from "./_crudFactory";

export const usersRoutes = () => {
  const users = createCrudRoutes({
    table: "users",
    tag: "users",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "id DESC", where: ["users.is_active IS TRUE"] },
    create: {
      bodySchema: t.Object({
        email: t.String(),
        full_name: t.String(),
        team: t.Optional(t.String()),
        profession: t.Optional(t.String()),
        profile_picture: t.Optional(t.String()),
        address: t.Optional(t.String()),
        user_department: t.Optional(t.Numeric()),
        department_label: t.Optional(t.String()),
        directorate: t.Optional(t.Numeric()),
        directorate_label: t.Optional(t.String()),
        team_label: t.Optional(t.String()),
        connection: t.Optional(t.Boolean()),
        user_status_id: t.Optional(t.Numeric()),
        role: t.Optional(t.String()),
        gender: t.Optional(t.String()),
        job: t.Optional(t.String()),
        jobValue: t.Optional(t.String()),
      }),
      bodyKeys: [
        "email",
        "full_name",
        "team",
        "team_label",
        "profession",
        "profile_picture",
        "address",
        "connection",
        "user_status_id",
        "user_department",
        "department_label",
        "directorate",
        "directorate_label",
        "role",
        "gender",
        "job",
        "jobValue",
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
          user_department: t.Optional(t.Numeric()),
          department_label: t.Optional(t.String()),
          directorate: t.Optional(t.Numeric()),
          directorate_label: t.Optional(t.String()),
          team_label: t.Optional(t.String()),
          connection: t.Optional(t.Boolean()),
          user_status_id: t.Optional(t.Numeric()),
          role: t.Optional(t.String()),
          gender: t.Optional(t.String()),
          job: t.Optional(t.String()),
          jobValue: t.Optional(t.String()),
        }),
      ),
      bodyKeys: [
        "email",
        "full_name",
        "team",
        "team_label",
        "profession",
        "profile_picture",
        "address",
        "connection",
        "user_status_id",
        "user_department",
        "department_label",
        "directorate",
        "directorate_label",
        "role",
        "is_active",
        "gender",
        "job",
        "jobValue",
      ] as const,
      touchUpdatedAt: true,
    },
    ownerCheck: {
      ownerField: "id",
      getUserId: ({ params }: { params: any }) =>
        Number((params as any)?.id ?? 0),
    },
    rbac: {
      can: async (ctx, action) => {
        const body = (ctx.body ?? {}) as any;
        if (
          (action === "create" || action === "update") &&
          body?.role === "supervisor"
        ) {
          if ((ctx.user as any)?.role === "admin") return false;
        }
        return true;
      },
      forbidMessage: "Not allowed to assign supervisor role",
    },
  });

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
      },
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
          values,
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
      },
    );

  return new Elysia({ name: "routes:users:all" }).use(users).use(plugin);
};
