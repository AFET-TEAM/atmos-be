import {
  Pool,
  type PoolClient,
  type QueryConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";

/** Yavaş sorgu eşiği (ms). Varsayılan: 200ms */
const SLOW_MS = Number(process.env.SQL_SLOW_MS ?? 200);

/** pg bağlantı ayarları (prod için opsiyonel SSL, statement_timeout vb.) */
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 10_000,
  application_name: process.env.DB_APPNAME ?? "app",
  statement_timeout: process.env.DB_STATEMENT_TIMEOUT
    ? Number(process.env.DB_STATEMENT_TIMEOUT)
    : undefined,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
} as const;

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

/**
 * Tekil (singleton) Pool döndürür.
 * Hot-reload sırasında birden fazla bağlantı havuzu oluşmasını engeller.
 */
export const getPool = (): Pool => {
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = new Pool(config);
  }
  return globalThis.__pgPool;
};

/**
 * Parametreli SQL builder (tagged template).
 * Kullanım: sql`select * from users where id = ${id}`
 * Güvenli şekilde $1, $2 ... değerlerini üretir.
 */
export const sql = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): QueryConfig => {
  const text = strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ""),
    "",
  );
  return { text, values };
};

/**
 * Log için SQL metnini tek satıra indirip kısaltır.
 * Gürültülü logların önüne geçer.
 */
const preview = (text: string, max = 180) =>
  text.replace(/\s+/g, " ").slice(0, max);

/**
 * Yüksek çözünürlüklü süre ölçümü (ms).
 * Date.now yerine hrtime kullanır (daha stabil).
 */
const nowMs = (): number => Number(process.hrtime.bigint()) / 1e6;

type QueryInput = string | QueryConfig;
type Params = ReadonlyArray<unknown>;

/**
 * Temel sorgu çalıştırıcısı.
 * - QueryConfig veya düz string alır.
 * - AbortSignal destekler (uzun süren sorguları iptal edebilmek için).
 * - Yavaş sorguları (SLOW_MS üstü) uyarı olarak loglar.
 */
export const query = async <T extends QueryResultRow = QueryResultRow>(
  q: QueryInput,
  params?: Params,
  options?: { signal?: AbortSignal },
): Promise<QueryResult<T>> => {
  const pool = getPool();
  const start = nowMs();
  try {
    const values = params ? Array.from(params) : [];

    const cfg: QueryConfig =
      typeof q === "string"
        ? { text: q, values }
        : {
            ...q,
            ...(q.values ? { values: Array.from(q.values as any[]) } : {}),
          };

    (cfg as any).signal = options?.signal;

    return await pool.query<T>(cfg);
  } finally {
    const ms = nowMs() - start;
    const text = typeof q === "string" ? q : (q.text ?? "");
    if (ms > SLOW_MS)
      console.warn(
        `SQL slow (${ms.toFixed(1)}ms):`,
        text.replace(/\s+/g, " ").slice(0, 180),
      );
  }
};

/**
 * Tek satır beklenen sorgular için yardımcı.
 * - 0 satır: null döner
 * - 1 satır: satırı döner
 * - >1 satır: hata fırlatır (beklenmeyen çoğulluk)
 */
export const queryOne = async <T extends QueryResultRow = QueryResultRow>(
  q: QueryInput,
  params?: Params,
  options?: { signal?: AbortSignal },
): Promise<T | null> => {
  const { rows } = await query<T>(q, params, options);
  if (rows.length === 0) return null;
  if (rows.length > 1) {
    const text = typeof q === "string" ? q : (q.text ?? "");
    throw new Error(
      `queryOne expected 0–1 rows, got ${rows.length}. SQL: ${preview(text)}`,
    );
  }
  return rows[0]!;
};

/**
 * Transaction yardımcı fonksiyonu.
 * - İçeride size `bound query` (client.query'e bağlı) ve `client` verilir.
 * - Otomatik BEGIN/COMMIT/ROLLBACK yönetir.
 */
export const tx = async <R>(
  fn: (
    q: <T extends QueryResultRow = QueryResultRow>(
      q: QueryInput,
      params?: Params,
    ) => Promise<QueryResult<T>>,
    client: PoolClient,
  ) => Promise<R>,
): Promise<R> => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    /** Bu query, client'a bağlıdır; aynı transaction içinde kalır. */
    const bound = <T extends QueryResultRow = QueryResultRow>(
      q: QueryInput,
      params?: Params,
    ) => {
      const values = params ? Array.from(params) : [];
      const cfg: QueryConfig =
        typeof q === "string"
          ? { text: q, values }
          : {
              ...q,
              ...(q.values ? { values: Array.from(q.values as any[]) } : {}),
            };
      return client.query<T>(cfg);
    };

    const result = await fn(bound, client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw e;
  } finally {
    client.release();
  }
};

/**
 * Havuzu zarifçe kapatır.
 * - Testler veya graceful shutdown senaryoları için idealdir.
 */
export const closePool = async (): Promise<void> => {
  if (globalThis.__pgPool) {
    await globalThis.__pgPool.end();
    globalThis.__pgPool = undefined;
  }
};
