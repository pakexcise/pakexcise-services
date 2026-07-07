import "server-only";

import { randomInt } from "node:crypto";

import { findUserByEmail } from "@/features/auth/lib/user-identity";
import { prisma } from "@/server/db/client";
import { sendEmailOtp } from "@/server/notifications/send-email-otp";
import { getRememberedOtpDelivery } from "@/server/notifications/otp-delivery-cache";
import type { SendEmailResult } from "@/server/notifications/send-email";
import { enforceRateLimit, otpRateLimit } from "@/server/security/rate-limit";
import { isAuthError } from "@/lib/errors/auth-errors";

const OTP_LENGTH = 6;
const OTP_EXPIRES_SECONDS = 300;

function generateNumericOtp(length: number): string {
  let otp = "";

  for (let index = 0; index < length; index += 1) {
    otp += randomInt(0, 10).toString();
  }

  return otp;
}

export type IssueEmailVerificationOtpResult =
  | { ok: true; delivery: SendEmailResult | null }
  | { ok: false; code: "INVALID_INPUT" | "USER_NOT_FOUND" | "RATE_LIMITED" | "EMAIL_FAILED" };

export async function issueEmailVerificationOtp(
  email: string,
): Promise<IssueEmailVerificationOtpResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes("@")) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return { ok: false, code: "USER_NOT_FOUND" };
  }

  try {
    await enforceRateLimit(otpRateLimit, `email:${normalizedEmail}`);
  } catch (error) {
    if (isAuthError(error) && error.code === "RATE_LIMITED") {
      return { ok: false, code: "RATE_LIMITED" };
    }

    throw error;
  }

  const otp = generateNumericOtp(OTP_LENGTH);
  const identifier = `email-verification-otp-${normalizedEmail}`;
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_SECONDS * 1000);

  await prisma.verification.deleteMany({
    where: { identifier },
  });

  await prisma.verification.create({
    data: {
      identifier,
      value: `${otp}:0`,
      expiresAt,
    },
  });

  try {
    await sendEmailOtp(normalizedEmail, otp, "email-verification");
  } catch (error) {
    console.error("[email-otp] delivery failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return { ok: false, code: "EMAIL_FAILED" };
  }

  return {
    ok: true,
    delivery: getRememberedOtpDelivery(normalizedEmail),
  };
}
