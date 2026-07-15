import { z } from "zod";

import {
  APP_ENV_VALUES,
  DEVELOPMENT_SITE_ORIGIN,
  PRODUCTION_SITE_ORIGIN,
  STAGING_SITE_ORIGIN,
  type AppEnv,
} from "@/config/env.shared";

const serverEnvSchema = z
  .object({
    APP_ENV: z.enum(APP_ENV_VALUES),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    ENCRYPTION_KEY: z.string().min(1),
    OTP_PEPPER: z.string().min(1),
    IP_HASH_PEPPER: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    const authUrl = env.BETTER_AUTH_URL.replace(/\/$/, "");

    if (env.APP_ENV === "production") {
      if (appUrl !== PRODUCTION_SITE_ORIGIN) {
        ctx.addIssue({
          code: "custom",
          path: ["NEXT_PUBLIC_APP_URL"],
          message: `Production NEXT_PUBLIC_APP_URL must be ${PRODUCTION_SITE_ORIGIN}`,
        });
      }

      if (authUrl !== PRODUCTION_SITE_ORIGIN) {
        ctx.addIssue({
          code: "custom",
          path: ["BETTER_AUTH_URL"],
          message: `Production BETTER_AUTH_URL must be ${PRODUCTION_SITE_ORIGIN}`,
        });
      }
    }

    if (env.APP_ENV === "staging") {
      if (appUrl !== STAGING_SITE_ORIGIN) {
        ctx.addIssue({
          code: "custom",
          path: ["NEXT_PUBLIC_APP_URL"],
          message: `Staging NEXT_PUBLIC_APP_URL must be ${STAGING_SITE_ORIGIN}`,
        });
      }

      if (authUrl !== STAGING_SITE_ORIGIN) {
        ctx.addIssue({
          code: "custom",
          path: ["BETTER_AUTH_URL"],
          message: `Staging BETTER_AUTH_URL must be ${STAGING_SITE_ORIGIN}`,
        });
      }
    }

    if (env.APP_ENV === "development") {
      if (appUrl !== DEVELOPMENT_SITE_ORIGIN) {
        ctx.addIssue({
          code: "custom",
          path: ["NEXT_PUBLIC_APP_URL"],
          message: `Development NEXT_PUBLIC_APP_URL must be ${DEVELOPMENT_SITE_ORIGIN}`,
        });
      }

      if (authUrl !== DEVELOPMENT_SITE_ORIGIN) {
        ctx.addIssue({
          code: "custom",
          path: ["BETTER_AUTH_URL"],
          message: `Development BETTER_AUTH_URL must be ${DEVELOPMENT_SITE_ORIGIN}`,
        });
      }
    }

    if (env.APP_ENV === "production" || env.APP_ENV === "staging") {
      for (const key of [
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
        "TURNSTILE_SECRET_KEY",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
      ] as const) {
        if (!env[key]?.trim()) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `${key} is required for protected public review submission.`,
          });
        }
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

function formatValidationError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "environment";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}

export function validateServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${formatValidationError(result.error)}`);
  }

  cachedEnv = result.data;
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
