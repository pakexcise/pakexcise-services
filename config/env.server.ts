import "server-only";

import {
  type ServerEnv,
  validateServerEnv as parseServerEnv,
} from "@/config/env.schema";
import type { AppEnv } from "@/config/env.shared";

let cachedEnv: ServerEnv | null = null;

export function validateServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = parseServerEnv();
  return cachedEnv;
}

export function getServerEnv(): ServerEnv {
  return validateServerEnv();
}

export function getAppEnv(): AppEnv {
  return getServerEnv().APP_ENV;
}

export function isProduction(): boolean {
  return getAppEnv() === "production";
}

export function isStaging(): boolean {
  return getAppEnv() === "staging";
}

export function isDevelopment(): boolean {
  return getAppEnv() === "development";
}

export function shouldAllowSearchIndexing(): boolean {
  return isProduction();
}

export function getSentryEnvironment(): string {
  return process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
}
