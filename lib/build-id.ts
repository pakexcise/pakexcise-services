import "server-only";

import { execSync } from "node:child_process";

export function resolveBuildId(): string {
  const fromEnv = process.env.BUILD_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}
