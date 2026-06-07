import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import bcrypt from "bcryptjs";

import { authConfig } from "@/config/auth";

function getOtpPepper(): string {
  const pepper = process.env[authConfig.otpPepperEnvKey];

  if (!pepper) {
    throw new Error("OTP_PEPPER is not configured");
  }

  return pepper;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, authConfig.bcryptCost);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function hashOtp(otp: string): string {
  return createHash("sha256")
    .update(`${otp}:${getOtpPepper()}`)
    .digest("hex");
}

export function verifyOtpHash(otp: string, hashedOtp: string): boolean {
  const candidate = hashOtp(otp);
  const candidateBuffer = Buffer.from(candidate, "utf8");
  const storedBuffer = Buffer.from(hashedOtp, "utf8");

  if (candidateBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, storedBuffer);
}

export function hashIpAddress(ipAddress: string): string | null {
  const pepper = process.env[authConfig.ipHashPepperEnvKey];

  if (!pepper) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("IP_HASH_PEPPER is not configured");
    }

    return null;
  }

  return createHash("sha256")
    .update(`${ipAddress}:${pepper}`)
    .digest("hex");
}
