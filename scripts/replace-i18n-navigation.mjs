#!/usr/bin/env node
/**
 * Replace @/i18n/navigation imports with next/link and next/navigation.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const LINK_NAMES = new Set(["Link"]);
const NAV_NAMES = new Set([
  "redirect",
  "usePathname",
  "useRouter",
  "getPathname",
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function parseSpecifiers(specs) {
  return specs
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const parts = s.split(/\s+as\s+/);
      return {
        imported: parts[0].trim(),
        local: (parts[1] ?? parts[0]).trim(),
        raw: s,
      };
    });
}

/** End index after the last complete import statement (handles multi-line). */
function findImportInsertPosition(source) {
  let i = 0;
  let lastEnd = 0;
  while (i < source.length) {
    // Skip shebang / "use client" / comments / blank lines at top
    if (i === lastEnd || i === 0) {
      // continue scanning
    }

    // Skip leading directive/comments before imports when searching from start
    const slice = source.slice(i);
    const dir = /^(?:["']use (?:client|server)["'];\s*)/.exec(slice);
    if (dir && (i === 0 || /^\s*$/.test(source.slice(0, i)))) {
      i += dir[0].length;
      lastEnd = i;
      continue;
    }

    const ws = /^\s+/.exec(slice);
    if (ws && i === lastEnd) {
      i += ws[0].length;
      continue;
    }

    if (!slice.startsWith("import")) {
      // allow blank lines between imports
      if (/^\s*\n/.test(slice) && lastEnd > 0) {
        i += /^\s*\n/.exec(slice)[0].length;
        continue;
      }
      break;
    }

    // Parse one import statement to its terminating semicolon
    let j = i + "import".length;
    let inStr = null;
    let escaped = false;
    let depth = 0; // braces/brackets/parens
    while (j < source.length) {
      const ch = source[j];
      if (inStr) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === inStr) inStr = null;
        j++;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
        j++;
        continue;
      }
      if (ch === "{" || ch === "(" || ch === "[") {
        depth++;
        j++;
        continue;
      }
      if (ch === "}" || ch === ")" || ch === "]") {
        depth--;
        j++;
        continue;
      }
      if (ch === ";" && depth === 0) {
        j++;
        lastEnd = j;
        i = j;
        break;
      }
      j++;
    }
    if (j >= source.length && lastEnd === i) {
      // no semicolon found
      break;
    }
  }
  return lastEnd;
}

function hasDefaultLinkImport(source, localName) {
  return new RegExp(
    `import\\s+${localName}\\s+from\\s*["']next/link["']`,
  ).test(source);
}

function hasNamedNavImport(source, localName) {
  const re = /import\s*\{([^}]*)\}\s*from\s*["']next\/navigation["']/;
  const m = re.exec(source);
  if (!m) return false;
  return parseSpecifiers(m[1]).some((s) => s.local === localName);
}

function ensureDefaultLinkImport(source, localName = "Link") {
  if (hasDefaultLinkImport(source, localName)) return source;
  const insertAt = findImportInsertPosition(source);
  const line = `import ${localName} from "next/link";\n`;
  return source.slice(0, insertAt) + (insertAt && !source.slice(insertAt - 1, insertAt).match(/\n/) ? "\n" : "") + line + source.slice(insertAt);
}

function mergeNamedImport(source, modulePath, rawSpecs) {
  if (rawSpecs.length === 0) return source;
  const re = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*["']${modulePath.replace("/", "\\/")}["']\\s*;?`,
  );
  const match = re.exec(source);
  if (match) {
    const existing = parseSpecifiers(match[1]);
    const locals = new Set(existing.map((s) => s.local));
    const merged = [...existing.map((s) => s.raw)];
    for (const raw of rawSpecs) {
      const local = raw.split(/\s+as\s+/).pop().trim();
      if (!locals.has(local)) {
        merged.push(raw);
        locals.add(local);
      }
    }
    return (
      source.slice(0, match.index) +
      `import { ${merged.join(", ")} } from "${modulePath}";` +
      source.slice(match.index + match[0].length)
    );
  }

  const insertAt = findImportInsertPosition(source);
  const line = `import { ${rawSpecs.join(", ")} } from "${modulePath}";\n`;
  return source.slice(0, insertAt) + line + source.slice(insertAt);
}

function processFile(filePath) {
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;

  const importRe =
    /import\s*\{([^}]*)\}\s*from\s*["']@\/i18n\/navigation["']\s*;?\s*\n?/g;

  const matches = [...source.matchAll(importRe)];
  if (matches.length === 0) return false;

  const linkLocals = [];
  const navLocals = [];

  source = source.replace(importRe, (full, specs) => {
    for (const spec of parseSpecifiers(specs)) {
      if (LINK_NAMES.has(spec.imported)) {
        linkLocals.push(spec.local);
      } else if (NAV_NAMES.has(spec.imported)) {
        navLocals.push(spec);
      } else {
        console.warn(
          `Unknown specifier ${spec.imported} in ${path.relative(ROOT, filePath)}`,
        );
      }
    }
    return "";
  });

  for (const local of [...new Set(linkLocals)]) {
    source = ensureDefaultLinkImport(source, local);
  }

  if (navLocals.length > 0) {
    const names = [...new Set(navLocals.map((s) => s.raw))];
    // Filter ones already present
    const needed = names.filter((raw) => {
      const local = raw.split(/\s+as\s+/).pop().trim();
      return !hasNamedNavImport(source, local);
    });
    if (needed.length > 0) {
      source = mergeNamedImport(source, "next/navigation", needed);
    }
  }

  source = source.replace(/\n{3,}/g, "\n\n");

  if (source !== original) {
    fs.writeFileSync(filePath, source, "utf8");
    return true;
  }
  return false;
}

function main() {
  const files = walk(ROOT).filter((f) => {
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    return (
      !rel.startsWith("node_modules/") &&
      !rel.startsWith(".next/") &&
      rel !== "i18n/navigation.ts"
    );
  });

  let changed = 0;
  const changedList = [];
  for (const file of files) {
    try {
      if (processFile(file)) {
        changed++;
        changedList.push(path.relative(ROOT, file).replace(/\\/g, "/"));
      }
    } catch (err) {
      console.error(
        `Failed ${path.relative(ROOT, file)}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log(`replace-i18n-navigation: changed ${changed} files`);
  for (const f of changedList) console.log(`  ${f}`);
}

main();
