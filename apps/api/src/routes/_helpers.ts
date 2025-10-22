import { Elysia, t } from "elysia";
import { query } from "../db";
import { mapRows, pick, ql, qp } from "../utils";

/** Ortak path param şeması */
export const idParam = t.Object({ id: t.Numeric() });

/** Limit/offset için ortak query şeması */
export const pagination = t.Object({
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

/** Query’den limit/offset üret */
export const parsePagination = (q: Record<string, unknown>) => ({
  limit: Number(q.limit ?? 50),
  offset: Number(q.offset ?? 0),
});

/** Basit CRUD route yardımcıları */
export function listRoute(
  app: Elysia,
  opts: {
    path: string;
    table: string;
    selectCols?: string[];
    where?: string[];
    tag?: string;
  }
) {
  const { path, table, selectCols = ["*"], where = [], tag = table } = opts;
  return app.get(
    path,
    async ({ query: q }) => {
      const { limit, offset } = parsePagination(q as any);
      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const sql = `SELECT ${ql(selectCols)} FROM ${table} ${whereSql}
                   ORDER BY id DESC LIMIT $1 OFFSET $2`;
      const res = await query(sql, [limit, offset]);
      return mapRows(res.rows);
    },
    { query: pagination, detail: { summary: `List ${table}`, tags: [tag] } }
  );
}

export function getRoute(
  app: Elysia,
  opts: { path: string; table: string; selectCols?: string[]; tag?: string }
) {
  const { path, table, selectCols = ["*"], tag = table } = opts;
  return app.get(
    path,
    async ({ params }) => {
      const res = await query(
        `SELECT ${ql(selectCols)} FROM ${table} WHERE id = $1`,
        [Number((params as any).id)]
      );
      if (!res.rows[0]) return new Response("Not Found", { status: 404 });
      return mapRows(res.rows)[0];
    },
    { params: idParam, detail: { summary: `Get ${table} by id`, tags: [tag] } }
  );
}

export function createRoute(
  app: Elysia,
  opts: {
    path: string;
    table: string;
    bodyKeys: string[];
    tag?: string;
    bodySchema?: any;
  }
) {
  const { path, table, bodyKeys, tag = table, bodySchema = t.Any() } = opts;
  return app.post(
    path,
    async ({ body }) => {
      const data = pick(body as any, bodyKeys);
      const { keys, params, values } = qp(data);
      const res = await query(
        `INSERT INTO ${table} (${keys.map((k) => `"${k}"`).join(",")})
         VALUES (${params.join(",")}) RETURNING *`,
        values
      );
      return mapRows(res.rows)[0];
    },
    { body: bodySchema, detail: { summary: `Create ${table}`, tags: [tag] } }
  );
}

export function patchRoute(
  app: Elysia,
  opts: {
    path: string;
    table: string;
    bodyKeys: string[];
    tag?: string;
    bodySchema?: any;
  }
) {
  const { path, table, bodyKeys, tag = table, bodySchema = t.Any() } = opts;
  return app.patch(
    path,
    async ({ params, body }) => {
      const data = pick(body as any, bodyKeys);
      const keys = Object.keys(data);
      if (!keys.length) return new Response("No fields", { status: 400 });
      const sets = keys.map((k, i) => `"${k}" = $${i + 1}`);
      const res = await query(
        `UPDATE ${table} SET ${sets.join(", ")}, updated_at = now()
         WHERE id = $${keys.length + 1} RETURNING *`,
        [...keys.map((k) => (data as any)[k]), Number((params as any).id)]
      );
      if (!res.rows[0]) return new Response("Not Found", { status: 404 });
      return mapRows(res.rows)[0];
    },
    {
      params: idParam,
      body: bodySchema,
      detail: { summary: `Update ${table} (partial)`, tags: [tag] },
    }
  );
}

export function deleteRoute(
  app: Elysia,
  opts: { path: string; table: string; tag?: string }
) {
  const { path, table, tag = table } = opts;
  return app.delete(
    path,
    async ({ params }) => {
      const res = await query(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
        [Number((params as any).id)]
      );
      if (!res.rows[0]) return new Response("Not Found", { status: 404 });
      return { deletedId: Number((params as any).id) };
    },
    {
      params: idParam,
      detail: { summary: `Delete ${table} by id`, tags: [tag] },
    }
  );
}
