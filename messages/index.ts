import en, { type Messages } from "@/messages/en";

export type { Messages };
export const copy = en;
export const messages = en;

type Params = Record<string, string | number | boolean | null | undefined>;
type MessageTree = Record<string, unknown>;

function getNested(obj: unknown, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function applyParams(template: string, params: Params): string {
  return template
    .replace(
      /\{(\w+),\s*plural,\s*([^}]+)\}/g,
      (_, countKey: string, choices: string) => {
        const count = Number(params[countKey] ?? 0);
        const zero = choices.match(/=0\s*\{([^}]*)\}/)?.[1];
        const other = choices.match(/other\s*\{([^}]*)\}/)?.[1] ?? String(count);
        const text = count === 0 && zero != null ? zero : other;
        return text.replaceAll(`{${countKey}}`, String(count));
      },
    )
    .replace(/\{(\w+)\}/g, (_, key: string) =>
      params[key] != null ? String(params[key]) : `{${key}}`,
    );
}

export type TFunction = ((key: string, params?: Params) => string) & {
  raw: (key: string) => unknown;
};

function attachRaw(
  fn: (key: string, params?: Params) => string,
  resolveRaw: (key: string) => unknown,
): TFunction {
  const t = fn as TFunction;
  t.raw = resolveRaw;
  return t;
}

/**
 * Resolve English copy.
 * - `createT("admin")("nav.dashboard")`
 * - `createT(copy.admin.nav)("dashboard")`
 */
export function createT(
  namespaceOrBag: string | MessageTree = "",
): TFunction {
  if (typeof namespaceOrBag === "object" && namespaceOrBag !== null) {
    return attachRaw(
      (key: string, params?: Params): string => {
        const value = getNested(namespaceOrBag, key);
        const raw = typeof value === "string" ? value : key;
        return params ? applyParams(raw, params) : raw;
      },
      (key: string) => getNested(namespaceOrBag, key),
    );
  }

  const namespace = namespaceOrBag;
  return attachRaw(
    (key: string, params?: Params): string => {
      const path = namespace ? `${namespace}.${key}` : key;
      const value = getNested(en, path);
      const raw = typeof value === "string" ? value : path;
      return params ? applyParams(raw, params) : raw;
    },
    (key: string) => {
      const path = namespace ? `${namespace}.${key}` : key;
      return getNested(en, path);
    },
  );
}

export default en;
