#!/usr/bin/env node
/**
 * Convert next-intl redirect({ href, locale }) to next/navigation redirect(href).
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

function findMatchingBrace(src, openIdx) {
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
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractHrefExpr(body) {
  const hrefKey = /href\s*:/.exec(body);
  if (!hrefKey) return null;
  let i = hrefKey.index + hrefKey[0].length;
  while (i < body.length && /\s/.test(body[i])) i++;
  const start = i;
  let depth = 0;
  let inStr = null;
  let escaped = false;
  for (; i < body.length; i++) {
    const ch = body[i];
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
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      continue;
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      if (depth === 0 && ch === "}") break;
      depth--;
      continue;
    }
    if ((ch === "," || ch === "}") && depth === 0) break;
  }
  return body.slice(start, i).trim();
}

function process(source) {
  let result = source;
  let guard = 0;
  while (guard++ < 500) {
    const m = /redirect\s*\(\s*\{/.exec(result);
    if (!m) break;
    const openBrace = m.index + m[0].lastIndexOf("{");
    const closeBrace = findMatchingBrace(result, openBrace);
    if (closeBrace < 0) break;
    const body = result.slice(openBrace + 1, closeBrace);
    const hrefExpr = extractHrefExpr(body);
    if (!hrefExpr) {
      console.warn("Could not parse redirect object:", body.slice(0, 80));
      result =
        result.slice(0, m.index + 8) +
        "/*FIXME*/" +
        result.slice(m.index + 8);
      continue;
    }
    let end = closeBrace + 1;
    while (end < result.length && /\s/.test(result[end])) end++;
    if (result[end] === ")") end++;
    result =
      result.slice(0, m.index) + `redirect(${hrefExpr})` + result.slice(end);
  }
  return result.replace(/redirect\s*\/\*FIXME\*\//g, "redirect");
}

function main() {
  let changed = 0;
  for (const dir of ["app", "components", "features"]) {
    for (const file of walk(path.join(ROOT, dir))) {
      const src = fs.readFileSync(file, "utf8");
      if (!/redirect\s*\(\s*\{/.test(src)) continue;
      const next = process(src);
      if (next !== src) {
        fs.writeFileSync(file, next, "utf8");
        changed++;
        console.log("fixed", path.relative(ROOT, file).replace(/\\/g, "/"));
      }
    }
  }
  console.log(`Fixed redirect() in ${changed} files`);
}

main();
