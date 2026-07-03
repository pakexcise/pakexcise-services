import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { authConfig } from "@/config/auth";
import { getPublicAppUrl } from "@/config/env.shared";
import { AuthError } from "@/lib/errors/auth-errors";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function createCsrfTokenPair(): {
  token: string;
  hashedToken: string;
} {
  const token = generateCsrfToken();
  return {
    token,
    hashedToken: hashToken(token),
  };
}

export function verifyCsrfToken(
  submittedToken: string | null | undefined,
  storedHashedToken: string | null | undefined,
): boolean {
  if (!submittedToken || !storedHashedToken) {
    return false;
  }

  const submittedHash = hashToken(submittedToken);
  const submittedBuffer = Buffer.from(submittedHash, "utf8");
  const storedBuffer = Buffer.from(storedHashedToken, "utf8");

  if (submittedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(submittedBuffer, storedBuffer);
}

export function getAllowedOrigins(): string[] {
  const origins = new Set<string>([getPublicAppUrl()]);

  if (process.env.BETTER_AUTH_URL) {
    origins.add(process.env.BETTER_AUTH_URL.replace(/\/$/, ""));
  }

  return [...origins];
}

export function isTrustedOrigin(origin: string | null): boolean {
  if (!origin) {
    return false;
  }

  return getAllowedOrigins().includes(origin);
}

export function validateMutationOrigin(headers: Headers): void {
  const origin = headers.get("origin");
  const referer = headers.get("referer");

  if (origin && isTrustedOrigin(origin)) {
    return;
  }

  if (referer) {
    const isTrustedReferer = getAllowedOrigins().some((allowedOrigin) =>
      referer.startsWith(allowedOrigin),
    );

    if (isTrustedReferer) {
      return;
    }
  }

  if (process.env.NODE_ENV !== "production" && !origin && !referer) {
    return;
  }

  throw new AuthError("CSRF_INVALID", "Cross-site request blocked");
}

export function validateCsrfRequest(
  headers: Headers,
  cookieHashedToken: string | null | undefined,
): void {
  validateMutationOrigin(headers);

  const submittedToken = headers.get(authConfig.csrfHeaderName);

  if (!verifyCsrfToken(submittedToken, cookieHashedToken)) {
    throw new AuthError("CSRF_INVALID", "Invalid CSRF token");
  }
}
