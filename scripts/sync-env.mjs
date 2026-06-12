import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envLocalPath = resolve(root, ".env.local");
const envPath = resolve(root, ".env");

if (!existsSync(envLocalPath)) {
  console.warn("[sync-env] .env.local not found. Skipping.");
  process.exit(0);
}

copyFileSync(envLocalPath, envPath);
console.log("[sync-env] Copied .env.local to .env for Prisma CLI.");
