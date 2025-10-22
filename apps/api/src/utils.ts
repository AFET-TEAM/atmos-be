/** --- Tip yardımcıları: snake_case -> camelCase key tipi */

type SnakeToCamel<S extends string> = S extends `${infer H}_${infer T}`
  ? `${H}${Capitalize<SnakeToCamel<T>>}`
  : S;

export type CamelKeys<T> = {
  [K in keyof T as K extends string ? SnakeToCamel<K> : K]: T[K];
};

/**
 * Bir satırın key'lerini snake_case'den camelCase'e çevirir.
 * Runtime dönüşümle uyumlu TypeScript key tiplerini de yansıtır.
 */
export const toCamel = <T extends Record<string, unknown>>(
  row: T
): CamelKeys<T> => {
  const out: Record<string, unknown> = {};
  for (const k in row) {
    const v = row[k];
    const ck = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[ck] = v;
  }
  return out as CamelKeys<T>;
};

/** Satır dizisini camelCase'e mapler. */
export const mapRows = <T extends Record<string, unknown>>(
  rows: T[]
): CamelKeys<T>[] => rows.map(toCamel);

/** --- Domain tipleri */
export type ContentType =
  | "techtalk"
  | "document"
  | "report"
  | "idea"
  | "meeting";

/**
 * Kolon listesini SQL SELECT için birleştirir.
 * Basit senaryoda direkt join; opsiyonel olarak basit identifier quoting destekler.
 */
export const ql = (
  cols: readonly string[],
  opts?: { quote?: boolean }
): string => {
  if (!opts?.quote) return cols.join(", ");
  return cols.map((c) => qIdent(c)).join(", ");
};

/** Basit identifier quote: '*' ya da ifade (parantez/boşluk) ise dokunma. */
const qIdent = (name: string): string => {
  if (
    name === "*" ||
    /[\s()]/.test(name) ||
    /^".*"$/.test(name) // zaten quoted
  )
    return name;
  // yalnızca "basit" identifier'ları quote et
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? `"${name}"` : name;
};

/**
 * Objeyi INSERT/UPDATE için parametre setine çevirir.
 * Undefined değerleri (opsiyonel alanlar) varsayılan olarak dışlar.
 */
export const qp = (
  obj: Record<string, unknown>,
  opts?: { includeUndefined?: boolean }
): { keys: string[]; params: string[]; values: any[] } => {
  const includeUndef = !!opts?.includeUndefined;
  const entries = Object.entries(obj).filter(
    ([, v]) => includeUndef || v !== undefined
  );

  const keys = entries.map(([k]) => k);
  const params = entries.map((_, i) => `$${i + 1}`);
  const values = entries.map(([, v]) => v as any);
  return { keys, params, values };
};

/**
 * Objeden belirtilen anahtarları (undefined olanları atlayarak) seçer.
 * keys parametresini `as const` kullanırsan tipler korunur.
 */
export const pick = <T extends object, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K
): Partial<Pick<T, K[number]>> => {
  const r: Partial<Pick<T, K[number]>> = {};
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined) (r as any)[k] = v;
  }
  return r;
};
