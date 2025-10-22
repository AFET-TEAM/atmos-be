import { Elysia, t } from "elysia";
import { query } from "../db";
import { mapRows } from "../utils";
import { createCrudRoutes } from "./_crudFactory";

export const meetingsRoutes = () => {
  const meetings = createCrudRoutes({
    table: "meetings",
    tag: "meetings",
    softDelete: { enabled: true, column: "deleted_at" },
    list: { orderBy: "starts_at DESC" },
    create: {
      bodySchema: t.Object({
        title: t.String(),
        starts_at: t.String(),
        ends_at: t.String(),
        created_by: t.Optional(t.Numeric()),
      }),
      bodyKeys: ["title", "starts_at", "ends_at", "created_by"] as const,
    },
    update: {
      bodySchema: t.Partial(
        t.Object({
          title: t.String(),
          starts_at: t.String(),
          ends_at: t.String(),
          created_by: t.Optional(t.Numeric()),
        })
      ),
      bodyKeys: ["title", "starts_at", "ends_at", "created_by"] as const,
    },
    ownerCheck: {
      ownerField: "created_by",
      getUserId: ({ body }) => (body as any)?.created_by ?? 0,
    },
    rbac: { can: async () => true },
  });

  // attendees alt route’ları
  const attendees = new Elysia({ name: "routes:meetings:attendees" })
    .get(
      "/meetings/:id/attendees",
      async ({ params }) => {
        const res = await query(
          `SELECT ma.*, u.full_name, u.email
           FROM meeting_attendees ma
           JOIN users u ON u.id = ma.user_id
           WHERE ma.meeting_id = $1
           ORDER BY u.full_name`,
          [Number((params as any).id)]
        );
        return mapRows(res.rows);
      },
      {
        params: t.Object({ id: t.Numeric() }),
        detail: { summary: "List meeting attendees", tags: ["meetings"] },
      }
    )
    .post(
      "/meetings/:id/attendees",
      async ({ params, body }) => {
        const res = await query(
          `INSERT INTO meeting_attendees (meeting_id, user_id)
           VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING *`,
          [Number((params as any).id), Number((body as any).user_id)]
        );
        return res.rows[0] ? mapRows(res.rows)[0] : { ok: true };
      },
      {
        params: t.Object({ id: t.Numeric() }),
        body: t.Object({ user_id: t.Numeric() }),
        detail: { summary: "Add attendee", tags: ["meetings"] },
      }
    )
    .delete(
      "/meetings/:id/attendees/:userId",
      async ({ params }) => {
        const { id, userId } = params as any;
        await query(
          `DELETE FROM meeting_attendees WHERE meeting_id = $1 AND user_id = $2`,
          [Number(id), Number(userId)]
        );
        return { ok: true };
      },
      {
        params: t.Object({ id: t.Numeric(), userId: t.Numeric() }),
        detail: { summary: "Remove attendee", tags: ["meetings"] },
      }
    );

  return new Elysia({ name: "routes:meetings:all" })
    .use(meetings)
    .use(attendees);
};
