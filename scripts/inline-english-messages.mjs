#!/usr/bin/env node
/**
 * Inline next-intl English message strings into app/, components/, features/.
 * Conservative: skips files with dynamic keys, t.raw/t.rich, complex ICU,
 * or translators passed as values.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MESSAGES_PATH = path.join(ROOT, "i18n", "messages", "en.json");
const REPORT_PATH = path.join(ROOT, "scripts", "inline-english-report.txt");
const SCAN_DIRS = ["app", "components", "features"];

const messages = JSON.parse(fs.readFileSync(MESSAGES_PATH, "utf8"));

const changedFiles = [];
const skippedFiles = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function getMessage(namespace, key) {
  const parts = [
    ...namespace.split(".").filter(Boolean),
    ...key.split(".").filter(Boolean),
  ];
  let cur = messages;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object" || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

function isComplexIcu(message) {
  return /,\s*(plural|select|selectordinal)\s*,/.test(message);
}

function escapeForTemplateLiteral(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function toJsStringLiteral(str) {
  return JSON.stringify(str);
}

function parseValuesObject(src) {
  const body = src.trim();
  if (!body.startsWith("{") || !body.endsWith("}")) return null;
  const inner = body.slice(1, -1).trim();
  if (!inner) return new Map();

  const map = new Map();
  let i = 0;
  while (i < inner.length) {
    while (i < inner.length && /[\s,]/.test(inner[i])) i++;
    if (i >= inner.length) break;

    const keyMatch = /^([A-Za-z_$][\w$]*)/.exec(inner.slice(i));
    if (!keyMatch) return null;
    const key = keyMatch[1];
    i += key.length;

    while (i < inner.length && /\s/.test(inner[i])) i++;

    if (inner[i] === ":") {
      i++;
      while (i < inner.length && /\s/.test(inner[i])) i++;
      const start = i;
      let depth = 0;
      let inStr = null;
      let escaped = false;
      while (i < inner.length) {
        const ch = inner[i];
        if (inStr) {
          if (escaped) escaped = false;
          else if (ch === "\\") escaped = true;
          else if (ch === inStr) inStr = null;
          i++;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          inStr = ch;
          i++;
          continue;
        }
        if (ch === "(" || ch === "[" || ch === "{") {
          depth++;
          i++;
          continue;
        }
        if (ch === ")" || ch === "]" || ch === "}") {
          if (depth === 0 && ch === "}") break;
          depth--;
          i++;
          continue;
        }
        if (ch === "," && depth === 0) break;
        i++;
      }
      const expr = inner.slice(start, i).trim();
      if (!expr) return null;
      map.set(key, expr);
    } else {
      map.set(key, key);
    }
  }
  return map;
}

function convertMessageWithValues(message, valuesMap) {
  if (isComplexIcu(message)) return null;

  const placeholders = [...message.matchAll(/\{([A-Za-z_$][\w$]*)\}/g)].map(
    (m) => m[1],
  );
  if (placeholders.length === 0) return toJsStringLiteral(message);

  for (const ph of placeholders) {
    if (!valuesMap.has(ph)) return null;
  }

  let result = "";
  let last = 0;
  const re = /\{([A-Za-z_$][\w$]*)\}/g;
  let match;
  while ((match = re.exec(message)) !== null) {
    result += escapeForTemplateLiteral(message.slice(last, match.index));
    result += `\${${valuesMap.get(match[1])}}`;
    last = match.index + match[0].length;
  }
  result += escapeForTemplateLiteral(message.slice(last));
  return `\`${result}\``;
}

function findMatchingParen(src, openIdx) {
  let depth = 0;
  let inStr = null;
  let escaped = false;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      if (depth === 0 && ch === ")") return i;
      if (depth < 0) return -1;
    }
  }
  return -1;
}

function findArrayClose(src, arrayOpen, limit) {
  let depth = 0;
  let inStr = null;
  let escaped = false;
  for (let i = arrayOpen; i < limit; i++) {
    const ch = src[i];
    if (inStr) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "[" || ch === "(" || ch === "{") depth++;
    else if (ch === "]" || ch === ")" || ch === "}") {
      depth--;
      if (depth === 0 && ch === "]") return i;
    }
  }
  return -1;
}

function splitTopLevelArgs(body) {
  const entries = [];
  let start = 0;
  let d = 0;
  let s = null;
  let esc = false;
  for (let i = 0; i <= body.length; i++) {
    const ch = i < body.length ? body[i] : ",";
    if (s) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === s) s = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      s = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") d++;
    else if (ch === ")" || ch === "]" || ch === "}") d--;
    else if (ch === "," && d === 0) {
      entries.push(body.slice(start, i).trim());
      start = i + 1;
    }
  }
  return entries;
}

function findTranslatorBindings(source) {
  const bindings = [];
  const declRe =
    /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(getTranslations|useTranslations)\s*\(/g;
  let m;
  while ((m = declRe.exec(source)) !== null) {
    const name = m[1];
    const openParen = m.index + m[0].length - 1;
    const closeParen = findMatchingParen(source, openParen);
    if (closeParen < 0) continue;
    const args = source.slice(openParen + 1, closeParen).trim();
    let namespace = null;
    const strArg = /^["']([^"']+)["']$/.exec(args);
    if (strArg) namespace = strArg[1];
    else {
      const objNs = /namespace\s*:\s*["']([^"']+)["']/.exec(args);
      if (objNs) namespace = objNs[1];
    }
    if (!namespace) continue;

    let declEnd = closeParen + 1;
    if (source[declEnd] === ";") declEnd++;
    const nl = /^\s*\n/.exec(source.slice(declEnd));
    if (nl) declEnd += nl[0].length;

    bindings.push({
      name,
      namespace,
      declStart: m.index,
      declEnd,
      kind: m[2],
    });
  }
  return bindings;
}

function findPromiseAllTranslators(source) {
  const results = [];
  const re = /(?:const|let)\s*\[([^\]]+)\]\s*=\s*await\s+Promise\.all\s*\(/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const names = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const openParen = m.index + m[0].length - 1;
    const closeParen = findMatchingParen(source, openParen);
    if (closeParen < 0) continue;
    const arrayOpen = source.indexOf("[", openParen);
    if (arrayOpen < 0 || arrayOpen > closeParen) continue;
    const arrEnd = findArrayClose(source, arrayOpen, closeParen);
    if (arrEnd < 0) continue;

    const entries = splitTopLevelArgs(source.slice(arrayOpen + 1, arrEnd));
    if (entries.length !== names.length) continue;

    let fullEnd = closeParen + 1;
    if (source[fullEnd] === ";") fullEnd++;
    const nl = /^\s*\n/.exec(source.slice(fullEnd));
    if (nl) fullEnd += nl[0].length;

    for (let i = 0; i < entries.length; i++) {
      const gt = /^getTranslations\s*\(\s*["']([^"']+)["']\s*\)$/.exec(
        entries[i],
      );
      const gtObj =
        /^getTranslations\s*\(\s*\{[\s\S]*namespace\s*:\s*["']([^"']+)["'][\s\S]*\}\s*\)$/.exec(
          entries[i],
        );
      const ns = gt?.[1] ?? gtObj?.[1];
      if (ns) {
        results.push({
          name: names[i],
          namespace: ns,
          entryIndex: i,
          names,
          entries,
          fullStart: m.index,
          fullEnd,
        });
      }
    }
  }
  return results;
}

function findCallsForTranslator(source, name) {
  const calls = [];
  // Avoid matching Tailwind classes: require start that is not after '-'
  const re = new RegExp(`(?<![\\w$-])${name}\\s*(?:\\.|\\()`, "g");
  let m;
  while ((m = re.exec(source)) !== null) {
    const nameStart = m.index;
    const afterName = nameStart + name.length;
    const rest = source.slice(afterName).replace(/^\s*/, "");
    const wsLen = source.slice(afterName).length - rest.length;

    if (rest.startsWith(".")) {
      const method = /^\.(\w+)\s*\(/.exec(rest);
      if (!method) {
        calls.push({
          type: "complex",
          index: nameStart,
          reason: `${name} member access`,
        });
        continue;
      }
      calls.push({
        type: "complex",
        index: nameStart,
        reason: `${name}.${method[1]}(...)`,
      });
      continue;
    }

    if (!rest.startsWith("(")) continue;

    const openParen = afterName + wsLen;
    const closeParen = findMatchingParen(source, openParen);
    if (closeParen < 0) {
      calls.push({
        type: "complex",
        index: nameStart,
        reason: "unbalanced call",
      });
      continue;
    }

    const argsSrc = source.slice(openParen + 1, closeParen).trim();
    const keyMatch = /^["']([^"']+)["']\s*(?:,\s*([\s\S]+))?$/.exec(argsSrc);
    if (!keyMatch) {
      calls.push({
        type: "complex",
        index: nameStart,
        reason: `dynamic key: ${name}(${argsSrc.slice(0, 40)}...)`,
      });
      continue;
    }

    calls.push({
      type: "call",
      index: nameStart,
      end: closeParen + 1,
      key: keyMatch[1],
      valuesSrc: keyMatch[2]?.trim() || null,
    });
  }
  return calls;
}

function isJsIdentifierAt(source, index, name) {
  const before = index > 0 ? source[index - 1] : "";
  const after = source[index + name.length] || "";
  if (/[A-Za-z0-9_$]/.test(before) || /[A-Za-z0-9_$]/.test(after)) return false;
  if (before === "-" || before === ":" || before === "/" || before === ".") {
    return false;
  }
  return true;
}

function resolveNamespaceForCall(bindings, promiseBindings, name, callIndex) {
  let best = null;
  let bestPos = -1;
  for (const b of bindings) {
    if (b.name !== name) continue;
    if (b.declStart < callIndex && b.declStart >= bestPos) {
      best = b.namespace;
      bestPos = b.declStart;
    }
  }
  for (const b of promiseBindings) {
    if (b.name !== name) continue;
    if (b.fullStart < callIndex && b.fullStart >= bestPos) {
      best = b.namespace;
      bestPos = b.fullStart;
    }
  }
  return best;
}

function removeImportSpecifiers(source, modules, namesToRemove) {
  let result = source;
  for (const mod of modules) {
    const importRe = new RegExp(
      `import\\s*\\{([^}]*)\\}\\s*from\\s*["']${mod}["']\\s*;?\\s*\\n?`,
      "g",
    );
    result = result.replace(importRe, (full, specs) => {
      const parts = specs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => {
          const id = s.split(/\s+as\s+/).pop().trim();
          return !namesToRemove.has(id);
        })
        .filter((s) => {
          const id = s.split(/\s+as\s+/).pop().trim();
          return new RegExp(`\\b${id}\\b`).test(result.replace(full, ""));
        });
      if (parts.length === 0) return "";
      return `import { ${parts.join(", ")} } from "${mod}";\n`;
    });
  }
  return result;
}

function cleanupLocaleOnlyUsedForTranslations(source) {
  const localeDeclRe =
    /(?:const|let)\s+locale\s*=\s*await\s+getCurrentLocale\s*\(\s*\)\s*;?\s*\n?/g;
  const decls = [...source.matchAll(localeDeclRe)];
  let result = source;

  for (const d of [...decls].reverse()) {
    const without =
      result.slice(0, d.index) + result.slice(d.index + d[0].length);
    const codeWithoutImports = without.replace(
      /^import\s+.*?from\s+["'][^"']+["']\s*;?\s*$/gm,
      "",
    );
    const remaining = (codeWithoutImports.match(/\blocale\b/g) || []).length;
    if (remaining === 0) result = without;
  }

  const withoutImport = result.replace(
    /import\s*\{[^}]*getCurrentLocale[^}]*\}\s*from\s*["']@\/server\/i18n\/get-locale["']\s*;?/g,
    "",
  );
  if (!/\bgetCurrentLocale\b/.test(withoutImport)) {
    result = result.replace(
      /import\s*\{([^}]*)\}\s*from\s*["']@\/server\/i18n\/get-locale["']\s*;?\s*\n?/,
      (full, specs) => {
        const parts = specs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((s) => {
            const id = s.split(/\s+as\s+/).pop().trim();
            return id !== "getCurrentLocale";
          });
        if (parts.length === 0) return "";
        return `import { ${parts.join(", ")} } from "@/server/i18n/get-locale";\n`;
      },
    );
  }

  return result;
}

function unwrapNextIntlProvider(source, relPath) {
  // Keep providers in root layouts / not-found while skipped children still need them.
  if (
    relPath === "app/[locale]/layout.tsx" ||
    relPath === "app/not-found.tsx" ||
    /\/layout\.tsx$/.test(relPath)
  ) {
    return source;
  }

  let result = source;
  result = result.replace(/<NextIntlClientProvider\b[^>]*>\s*/g, "");
  result = result.replace(/\s*<\/NextIntlClientProvider>/g, "");
  result = result.replace(
    /(?:const|let)\s+messages\s*=\s*await\s+getMessages\s*\(\s*\)\s*;?\s*\n?/g,
    "",
  );
  result = result.replace(
    /(?:const|let)\s+messages\s*=\s*await\s+loadMessages\s*\([^)]*\)\s*;?\s*\n?/g,
    "",
  );
  if (
    !/\bloadMessages\b/.test(
      result.replace(/async function loadMessages[\s\S]*?\n\}/g, ""),
    )
  ) {
    result = result.replace(
      /async function loadMessages\([^)]*\)\s*\{[\s\S]*?\n\}\s*\n?/g,
      "",
    );
  }
  return result;
}

function rewritePromiseAll(next, translatorNames) {
  const re = /(?:const|let)\s*\[([^\]]+)\]\s*=\s*await\s+Promise\.all\s*\(/g;
  const edits = [];
  let m;
  while ((m = re.exec(next)) !== null) {
    const names = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const openParen = m.index + m[0].length - 1;
    const closeParen = findMatchingParen(next, openParen);
    if (closeParen < 0) continue;
    const arrayOpen = next.indexOf("[", openParen);
    const arrEnd = findArrayClose(next, arrayOpen, closeParen);
    if (arrEnd < 0) continue;

    const entries = splitTopLevelArgs(next.slice(arrayOpen + 1, arrEnd));
    if (entries.length !== names.length) continue;

    const keepNames = [];
    const keepEntries = [];
    let removedAny = false;
    for (let i = 0; i < entries.length; i++) {
      const isGt =
        /^getTranslations\s*\(/.test(entries[i]) &&
        translatorNames.has(names[i]);
      if (isGt) {
        removedAny = true;
        continue;
      }
      keepNames.push(names[i]);
      keepEntries.push(entries[i]);
    }
    if (!removedAny) continue;

    let fullEnd = closeParen + 1;
    if (next[fullEnd] === ";") fullEnd++;
    const nl = /^\s*\n/.exec(next.slice(fullEnd));
    if (nl) fullEnd += nl[0].length;

    if (keepNames.length === 0) {
      edits.push({ start: m.index, end: fullEnd, text: "" });
    } else {
      const indentMatch = /\n(\s*)/.exec(
        next.slice(arrayOpen, Math.min(arrayOpen + 80, arrEnd)),
      );
      const indent = indentMatch ? indentMatch[1] : "  ";
      const closingIndent = indent.length >= 2 ? indent.slice(0, -2) : "";
      const newDecl = `const [${keepNames.join(", ")}] = await Promise.all([\n${keepEntries
        .map((e) => `${indent}${e}`)
        .join(",\n")}\n${closingIndent}]);\n`;
      edits.push({ start: m.index, end: fullEnd, text: newDecl });
    }
  }
  edits.sort((a, b) => b.start - a.start);
  let result = next;
  for (const e of edits) {
    result = result.slice(0, e.start) + e.text + result.slice(e.end);
  }
  return result;
}

function processFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const source = fs.readFileSync(filePath, "utf8");
  const original = source;

  const usesNextIntl =
    /from\s*["']next-intl(?:\/server)?["']/.test(source) ||
    /\bgetTranslations\b|\buseTranslations\b|\bsetRequestLocale\b|\bNextIntlClientProvider\b|\bgetMessages\b/.test(
      source,
    );

  if (!usesNextIntl) return;

  const bindings = findTranslatorBindings(source);
  const promiseBindings = findPromiseAllTranslators(source);
  const translatorNames = new Set([
    ...bindings.map((b) => b.name),
    ...promiseBindings.map((b) => b.name),
  ]);

  const NEXT_INTL_REMOVE = new Set([
    "getTranslations",
    "useTranslations",
    "setRequestLocale",
    "NextIntlClientProvider",
    "getMessages",
  ]);

  if (translatorNames.size === 0) {
    // Only strip setRequestLocale — do not remove getTranslations imports
    // when bindings were not detected (e.g. unusual Promise.all shapes).
    let next = source;
    next = next.replace(/^\s*setRequestLocale\s*\([^)]*\)\s*;?\s*\n?/gm, "");
    next = unwrapNextIntlProvider(next, rel);
    next = removeImportSpecifiers(
      next,
      ["next-intl", "next-intl/server"],
      new Set(["setRequestLocale"]),
    );
    next = cleanupLocaleOnlyUsedForTranslations(next);
    next = next.replace(/\n{3,}/g, "\n\n");
    if (next !== original) {
      fs.writeFileSync(filePath, next, "utf8");
      changedFiles.push(rel);
    }
    return;
  }

  const allCalls = [];
  for (const name of translatorNames) {
    const calls = findCallsForTranslator(source, name);
    for (const c of calls) {
      if (c.type === "complex") {
        skippedFiles.push({ file: rel, reason: c.reason });
        return;
      }
      const namespace = resolveNamespaceForCall(
        bindings,
        promiseBindings,
        name,
        c.index,
      );
      if (!namespace) {
        skippedFiles.push({
          file: rel,
          reason: `no namespace binding for ${name}() call`,
        });
        return;
      }
      allCalls.push({ ...c, name, namespace });
    }
  }

  for (const name of translatorNames) {
    let idx = 0;
    while (idx < source.length) {
      const found = source.indexOf(name, idx);
      if (found < 0) break;
      idx = found + name.length;
      if (!isJsIdentifierAt(source, found, name)) continue;

      if (bindings.some((b) => found >= b.declStart && found < b.declEnd)) {
        continue;
      }
      if (allCalls.some((c) => found >= c.index && found < c.end)) continue;
      if (
        promiseBindings.some(
          (b) =>
            b.name === name && found >= b.fullStart && found < b.fullEnd,
        )
      ) {
        continue;
      }

      const lineStart = source.lastIndexOf("\n", found) + 1;
      const lineEnd = source.indexOf("\n", found);
      const line = source.slice(lineStart, lineEnd < 0 ? undefined : lineEnd);
      if (/^\s*import\b/.test(line) || /^\s*\/\//.test(line)) continue;

      skippedFiles.push({
        file: rel,
        reason: `translator '${name}' used outside simple t("key") calls`,
      });
      return;
    }
  }

  const replacements = [];
  for (const call of allCalls) {
    const message = getMessage(call.namespace, call.key);
    if (message == null) {
      skippedFiles.push({
        file: rel,
        reason: `missing message ${call.namespace}.${call.key}`,
      });
      return;
    }
    if (isComplexIcu(message)) {
      skippedFiles.push({
        file: rel,
        reason: `complex ICU at ${call.namespace}.${call.key}`,
      });
      return;
    }

    let replacement;
    if (!call.valuesSrc) {
      replacement = toJsStringLiteral(message);
    } else {
      const valuesMap = parseValuesObject(call.valuesSrc);
      if (!valuesMap) {
        skippedFiles.push({
          file: rel,
          reason: `complex values object for ${call.namespace}.${call.key}`,
        });
        return;
      }
      replacement = convertMessageWithValues(message, valuesMap);
      if (!replacement) {
        skippedFiles.push({
          file: rel,
          reason: `could not convert placeholders for ${call.namespace}.${call.key}`,
        });
        return;
      }
    }
    replacements.push({ start: call.index, end: call.end, text: replacement });
  }

  replacements.sort((a, b) => b.start - a.start);
  let next = source;
  for (const r of replacements) {
    next = next.slice(0, r.start) + r.text + next.slice(r.end);
  }

  const bindingsAfter = findTranslatorBindings(next);
  for (const b of bindingsAfter.reverse()) {
    if (translatorNames.has(b.name)) {
      next = next.slice(0, b.declStart) + next.slice(b.declEnd);
    }
  }

  next = rewritePromiseAll(next, translatorNames);
  next = next.replace(/^\s*setRequestLocale\s*\([^)]*\)\s*;?\s*\n?/gm, "");
  next = unwrapNextIntlProvider(next, rel);
  next = removeImportSpecifiers(next, ["next-intl", "next-intl/server"], NEXT_INTL_REMOVE);

  if (/\bgetTranslations\b|\buseTranslations\b/.test(next)) {
    skippedFiles.push({
      file: rel,
      reason: "getTranslations/useTranslations still present after rewrite",
    });
    return;
  }

  next = cleanupLocaleOnlyUsedForTranslations(next);
  next = next.replace(/\n{3,}/g, "\n\n");

  if (next !== original) {
    fs.writeFileSync(filePath, next, "utf8");
    changedFiles.push(rel);
  }
}

function main() {
  changedFiles.length = 0;
  skippedFiles.length = 0;

  const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
  for (const file of files) {
    try {
      processFile(file);
    } catch (err) {
      const rel = path.relative(ROOT, file).replace(/\\/g, "/");
      skippedFiles.push({
        file: rel,
        reason: `error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const uniqueSkipped = [];
  const seen = new Set();
  for (const s of skippedFiles) {
    const key = `${s.file}::${s.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueSkipped.push(s);
  }

  const report = [
    `Inline English messages report`,
    `Generated: ${new Date().toISOString()}`,
    ``,
    `Changed files (${changedFiles.length}):`,
    ...changedFiles.map((f) => `  ${f}`),
    ``,
    `Skipped files (${uniqueSkipped.length}):`,
    ...uniqueSkipped.map((s) => `  ${s.file} — ${s.reason}`),
    ``,
  ].join("\n");

  fs.writeFileSync(REPORT_PATH, report, "utf8");
  console.log(`Changed: ${changedFiles.length}`);
  console.log(`Skipped: ${uniqueSkipped.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main();
