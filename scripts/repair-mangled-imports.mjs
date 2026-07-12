#!/usr/bin/env node
/**
 * Repair imports mangled by replace-i18n-navigation inserting into multi-line import blocks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

/**
 * Fix pattern:
 *   import {
 *   import Link from "next/link";
 *   import { useRouter } from "next/navigation";
 *     foo,
 *   } from "...";
 */
function repair(source) {
  const re =
    /import\s*\{\s*((?:import\s+[^;]+;\s*)+)([\s\S]*?\})\s*from\s*(["'][^"']+["'])\s*;?/g;

  return source.replace(re, (full, injectedImports, restSpecs, fromMod) => {
    const imports = injectedImports.trim();
    // restSpecs includes trailing `}` — strip it
    const inner = restSpecs.replace(/\}\s*$/, "").trim();
    const named = inner
      ? `import {\n  ${inner
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(",\n  ")}\n} from ${fromMod};`
      : "";
    return `${imports}\n${named}`.trim() + (named ? "" : "");
  });
}

function main() {
  let changed = 0;
  for (const file of walk(ROOT)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    if (rel.startsWith("node_modules/") || rel.startsWith(".next/")) continue;
    const src = fs.readFileSync(file, "utf8");
    if (!/import\s*\{\s*import\s+/.test(src)) continue;
    const next = repair(src);
    if (next !== src) {
      fs.writeFileSync(file, next, "utf8");
      changed++;
      console.log(`repaired ${rel}`);
    }
  }
  console.log(`Repaired ${changed} files`);
}

main();
