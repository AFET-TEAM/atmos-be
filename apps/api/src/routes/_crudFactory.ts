import type { AuthUser } from "@/types/auth";
import { Elysia, t } from "elysia";
import { query } from "../db";
import { mapRows, pick, ql, qp } from "../utils";

/** Ortak şemalar */
export const idParam = t.Object({ id: t.Numeric() });
export const pagination = t.Object({
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
  include_deleted: t.Optional(t.Boolean()), // soft-delete görünürlüğü
});

const parsePagination = (q: Record<string, unknown>) => ({
  limit: Number(q.limit ?? 50),
  offset: Number(q.offset ?? 0),
  includeDeleted: q.include_deleted === true || q.include_deleted === "true",
});

/** CRUD aksiyonları */
export type CrudAction = "list" | "get" | "create" | "update" | "delete";

/** Hook bağlamı */
type HookCtx = {
  table: string;
  basePath: string;
  tag: string;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  body: unknown;
  user?: AuthUser;
  elysia: Elysia;
};

export type CrudFactoryOptions = {
  table: string;
  basePath?: string;
  tag?: string;

  list?: {
    selectCols?: string[];
    where?: string[];
    orderBy?: string;
    buildFilters?: (q: Record<string, unknown>) => {
      whereFragments: string[];
      paramsHead: any[];
    };
  };

  get?: { selectCols?: string[] };

  create: {
    bodySchema: any;
    bodyKeys: readonly string[];
  };

  update?: {
    bodySchema: any;
    bodyKeys: readonly string[];
    touchUpdatedAt?: boolean;
  };

  softDelete?: {
    enabled: boolean;
    column?: string;
  };

  ownerCheck?: {
    ownerField: string;
    getUserId: (ctx: HookCtx) => number | string;
  };

  /** RBAC kontrolü */
  rbac?: {
    can: (
      ctx: HookCtx,
      action: CrudAction,
      table: string,
      resource?: { id?: number | string }
    ) => boolean | Promise<boolean>;
    forbidMessage?: string;
  };

  /** Before/After hooks */
  before?: Partial<Record<CrudAction, (ctx: HookCtx) => Promise<void> | void>>;
  after?: Partial<
    Record<CrudAction, (ctx: HookCtx, result: any) => Promise<any> | any>
  >;

  /** Ekstra route eklemek için */
  extend?: (
    plugin: Elysia,
    ctx: { table: string; basePath: string; tag: string }
  ) => void;
};

const forbidden = (msg = "Forbidden") => new Response(msg, { status: 403 });
const notFound = () => new Response("Not Found", { status: 404 });
const badReq = (msg = "Bad Request") => new Response(msg, { status: 400 });

export const createCrudRoutes = (opts: CrudFactoryOptions) => {
  const table = opts.table;
  const basePath = opts.basePath ?? `/${table}`;
  const tag = opts.tag ?? table;

  const listCfg = {
    selectCols: ["*"],
    where: [] as string[],
    orderBy: "id DESC",
    ...opts.list,
  };
  const getCfg = { selectCols: ["*"], ...opts.get };
  const updCfg = {
    touchUpdatedAt: true,
    ...(opts.update ?? { bodySchema: t.Object({}), bodyKeys: [] }),
  };
  const soft = {
    enabled: false,
    column: "deleted_at",
    ...(opts.softDelete ?? {}),
  };

  const r = new Elysia({ name: `routes:${table}` });

  const buildHookCtx = (
    elysia: Elysia,
    params: any,
    queryObj: any,
    body: any,
    user?: AuthUser
  ): HookCtx => ({
    table,
    basePath,
    tag,
    params,
    query: queryObj,
    body,
    user,
    elysia,
  });

  const checkRbac = async (
    ctx: HookCtx,
    action: CrudAction,
    resource?: { id?: number | string }
  ) => {
    if (!opts.rbac?.can) return true;
    return !!(await opts.rbac.can(ctx, action, table, resource));
  };

  const ensureOwner = async (id: number | string, user?: AuthUser) => {
    if (!opts.ownerCheck) return true;
    // Admin her zaman owner kontrolünü bypass eder
    if (user?.role === "admin") return true;

    const { ownerField } = opts.ownerCheck;
    const res = await query<{ [k: string]: any }>(
      `SELECT ${ownerField} FROM ${table} WHERE id=$1`,
      [id]
    );
    const row = res.rows[0];
    if (!row) return false;
    const hookCtx = buildHookCtx(r, { id }, {}, undefined, user);
    const currentUserId = opts.ownerCheck.getUserId(hookCtx);
    return String(row[ownerField]) === String(currentUserId);
  };

  /** GET / : list */
  r.get(
    basePath,
    async (ctx) => {
      const { query: q } = ctx;
      const hookCtx = buildHookCtx(
        r,
        {},
        ctx.query,
        undefined,
        (ctx as any).user
      );
      if (!(await checkRbac(hookCtx, "list")))
        return forbidden(opts.rbac?.forbidMessage);

      await opts.before?.list?.(hookCtx);

      const { limit, offset, includeDeleted } = parsePagination(q as any);
      const dynamic = listCfg.buildFilters?.(q as any) ?? {
        whereFragments: [] as string[],
        paramsHead: [] as any[],
      };

      const whereParts = [...(listCfg.where ?? []), ...dynamic.whereFragments];
      if (soft.enabled && !includeDeleted)
        whereParts.push(`${soft.column} IS NULL`);

      const whereSql = whereParts.length
        ? `WHERE ${whereParts.join(" AND ")}`
        : "";
      const params = [...dynamic.paramsHead, limit, offset];

      const sql = `SELECT ${ql(listCfg.selectCols!)}
                   FROM ${table}
                   ${whereSql}
                   ORDER BY ${listCfg.orderBy}
                   LIMIT $${params.length - 1} OFFSET $${params.length}`;

      const res = await query(sql, params);
      const data = mapRows(res.rows);
      const out = (await opts.after?.list?.(hookCtx, data)) ?? data;
      return out;
    },
    { query: pagination, detail: { summary: `List ${table}`, tags: [tag] } }
  );

  /** GET /:id */
  r.get(
    `${basePath}/:id`,
    async (ctx) => {
      const { params, query: q } = ctx;
      const id = Number((params as any).id);
      const hookCtx = buildHookCtx(r, params, q, undefined, (ctx as any).user);
      if (!(await checkRbac(hookCtx, "get", { id })))
        return forbidden(opts.rbac?.forbidMessage);

      await opts.before?.get?.(hookCtx);

      const whereSoft =
        soft.enabled && !(q as any).include_deleted
          ? `AND ${soft.column} IS NULL`
          : "";
      const res = await query(
        `SELECT ${ql(
          getCfg.selectCols!
        )} FROM ${table} WHERE id = $1 ${whereSoft}`,
        [id]
      );
      if (!res.rows[0]) return notFound();
      const data = mapRows(res.rows)[0];
      const out = (await opts.after?.get?.(hookCtx, data)) ?? data;
      return out;
    },
    { params: idParam, detail: { summary: `Get ${table} by id`, tags: [tag] } }
  );

  /** POST / : create */
  r.post(
    basePath,
    async (ctx) => {
      const { body } = ctx;
      const hookCtx = buildHookCtx(r, {}, {}, ctx.body, (ctx as any).user);
      if (!(await checkRbac(hookCtx, "create")))
        return forbidden(opts.rbac?.forbidMessage);

      await opts.before?.create?.(hookCtx);

      const data = pick(body as any, opts.create.bodyKeys);
      const { keys, params, values } = qp(data);
      const res = await query(
        `INSERT INTO ${table} (${keys.map((k) => `"${k}"`).join(",")})
         VALUES (${params.join(",")}) RETURNING *`,
        values
      );
      const created = mapRows(res.rows)[0];
      const out = (await opts.after?.create?.(hookCtx, created)) ?? created;
      return out;
    },
    {
      body: opts.create.bodySchema,
      detail: { summary: `Create ${table}`, tags: [tag] },
    }
  );

  /** PATCH /:id : update */
  if (opts.update) {
    r.patch(
      `${basePath}/:id`,
      async (ctx) => {
        const { params, body } = ctx;
        const id = Number((params as any).id);
        const hookCtx = buildHookCtx(
          r,
          ctx.params,
          {},
          ctx.body,
          (ctx as any).user
        );

        if (!(await checkRbac(hookCtx, "update", { id })))
          return forbidden(opts.rbac?.forbidMessage);
        if (!(await ensureOwner(id, (ctx as any).user)))
          return forbidden("Only owner can update this resource");

        await opts.before?.update?.(hookCtx);

        const data = pick(body as any, opts.update!.bodyKeys);
        const keys = Object.keys(data);
        if (!keys.length) return badReq("No fields");

        const sets = keys.map((k, i) => `"${k}" = $${i + 1}`);
        if (updCfg.touchUpdatedAt) sets.push(`updated_at = now()`);

        const softGuard = soft.enabled ? `AND (${soft.column} IS NULL)` : "";

        const res = await query(
          `UPDATE ${table} SET ${sets.join(", ")}
           WHERE id = $${keys.length + 1} ${softGuard}
           RETURNING *`,
          [...keys.map((k) => (data as any)[k]), id]
        );
        if (!res.rows[0]) return notFound();

        const updated = mapRows(res.rows)[0];
        const out = (await opts.after?.update?.(hookCtx, updated)) ?? updated;
        return out;
      },
      {
        params: idParam,
        body: opts.update.bodySchema,
        detail: { summary: `Update ${table} (partial)`, tags: [tag] },
      }
    );
  }

  /** DELETE /:id (hard/soft) */
  r.delete(
    `${basePath}/:id`,
    async (ctx) => {
      const { params } = ctx;
      const id = Number((params as any).id);
      const hookCtx = buildHookCtx(
        r,
        ctx.params,
        {},
        undefined,
        (ctx as any).user
      );

      if (!(await checkRbac(hookCtx, "delete", { id })))
        return forbidden(opts.rbac?.forbidMessage);
      if (!(await ensureOwner(id, (ctx as any).user)))
        return forbidden("Only owner can delete this resource");

      await opts.before?.delete?.(hookCtx);

      if (soft.enabled) {
        const res = await query(
          `UPDATE ${table} SET ${soft.column} = now() WHERE id=$1 AND ${soft.column} IS NULL RETURNING id`,
          [id]
        );
        if (!res.rows[0]) return notFound();
        const out = (await opts.after?.delete?.(hookCtx, {
          deletedId: id,
          soft: true,
        })) ?? { deletedId: id, soft: true };
        return out;
      } else {
        const res = await query(
          `DELETE FROM ${table} WHERE id=$1 RETURNING id`,
          [id]
        );
        if (!res.rows[0]) return notFound();
        const out = (await opts.after?.delete?.(hookCtx, {
          deletedId: id,
          soft: false,
        })) ?? { deletedId: id, soft: false };
        return out;
      }
    },
    {
      params: idParam,
      detail: { summary: `Delete ${table} by id`, tags: [tag] },
    }
  );

  opts.extend?.(r, { table, basePath, tag });
  return r;
};
