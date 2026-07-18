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

function extractPluralChoice(choices: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = choices.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return match?.[1];
}

/** Resolve ICU-style `{count, plural, one {# x} other {# y}}` with nested braces. */
function applyIcuPlurals(template: string, params: Params): string {
  const pluralStart = /\{(\w+),\s*plural,\s*/g;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pluralStart.exec(template)) !== null) {
    const countKey = match[1] ?? "count";
    const contentStart = match.index + match[0].length;
    let depth = 1;
    let cursor = contentStart;

    while (cursor < template.length && depth > 0) {
      const char = template[cursor];
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      cursor += 1;
    }

    const choices = template.slice(contentStart, cursor - 1);
    const count = Number(params[countKey] ?? 0);
    const zero = extractPluralChoice(choices, "=0");
    const one = extractPluralChoice(choices, "one");
    const other = extractPluralChoice(choices, "other") ?? String(count);

    let text = other;
    if (count === 0 && zero != null) {
      text = zero;
    } else if (count === 1 && one != null) {
      text = one;
    }

    text = text
      .replaceAll("#", String(count))
      .replaceAll(`{${countKey}}`, String(count));

    result += template.slice(lastIndex, match.index) + text;
    lastIndex = cursor;
    pluralStart.lastIndex = cursor;
  }

  return result + template.slice(lastIndex);
}

function applyParams(template: string, params: Params): string {
  return applyIcuPlurals(template, params).replace(/\{(\w+)\}/g, (_, key: string) =>
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
