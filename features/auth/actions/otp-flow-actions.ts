"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  findUserByCnic,
  findUserByEmail,
  findUserByPhone,
  isTempPhoneEmail,
} from "@/features/auth/lib/user-identity";
import { isValidCnicInput, normalizeCnic, parsePhoneOrCnicInput } from "@/lib/validations/cnic";
import { normalizePakistanPhone } from "@/lib/validations/phone";
import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db/client";
import { getRememberedOtpDelivery } from "@/server/notifications/otp-delivery-cache";
import type { SendEmailResult } from "@/server/notifications/send-email";
import { encryptCnic } from "@/server/security/encryption";
import { hashCnic } from "@/server/security/cnic-hash";

const emailSchema = z.string().trim().email();

export type AuthEligibilityResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "ACCOUNT_NOT_FOUND"
        | "ACCOUNT_EXISTS"
        | "CNIC_EXISTS"
        | "INVALID_INPUT";
    };

export type EmailSignupInitResult =
  | { ok: true; delivery: SendEmailResult | null }
  | { ok: false; code: "ACCOUNT_EXISTS" | "INVALID_INPUT" | "SIGNUP_FAILED" };

export type PhoneLoginIdentityResult =
  | { ok: true; email: string }
  | { ok: false; code: "ACCOUNT_NOT_FOUND" | "INVALID_INPUT" };

export async function checkEmailAuthEligibility(
  email: string,
  mode: "login" | "signup",
): Promise<AuthEligibilityResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const normalized = parsed.data.toLowerCase();
  const user = await findUserByEmail(normalized);

  if (mode === "login") {
    if (!user || isTempPhoneEmail(user.email)) {
      return { ok: false, code: "ACCOUNT_NOT_FOUND" };
    }
    return { ok: true };
  }

  if (user && !isTempPhoneEmail(user.email)) {
    return { ok: false, code: "ACCOUNT_EXISTS" };
  }

  return { ok: true };
}

export async function checkPhoneSignupEligibility(
  phoneInput: string,
  cnicInput: string,
): Promise<AuthEligibilityResult> {
  const normalizedPhone = normalizePakistanPhone(phoneInput);
  if (!normalizedPhone || !isValidCnicInput(cnicInput)) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const phoneUser = await findUserByPhone(normalizedPhone);
  if (phoneUser) {
    return { ok: false, code: "ACCOUNT_EXISTS" };
  }

  const cnicUser = await findUserByCnic(cnicInput);
  if (cnicUser) {
    return { ok: false, code: "CNIC_EXISTS" };
  }

  return { ok: true };
}

export async function checkPhoneOrCnicLoginEligibility(
  identifier: string,
): Promise<AuthEligibilityResult> {
  const parsed = parsePhoneOrCnicInput(identifier);
  if (parsed.type === "invalid") {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const user =
    parsed.type === "phone"
      ? await findUserByPhone(parsed.value)
      : await findUserByCnic(parsed.value);

  if (!user) {
    return { ok: false, code: "ACCOUNT_NOT_FOUND" };
  }

  return { ok: true };
}

export async function getPhoneOrCnicLoginEmail(
  identifier: string,
): Promise<PhoneLoginIdentityResult> {
  const parsed = parsePhoneOrCnicInput(identifier);
  if (parsed.type === "invalid") {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const user =
    parsed.type === "phone"
      ? await findUserByPhone(parsed.value)
      : await findUserByCnic(parsed.value);

  if (!user) {
    return { ok: false, code: "ACCOUNT_NOT_FOUND" };
  }

  return { ok: true, email: user.email };
}

export async function sendEmailVerificationOtp(
  email: string,
): Promise<EmailSignupInitResult> {
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const normalizedEmail = parsedEmail.data.toLowerCase();
  const requestHeaders = await headers();

  try {
    await auth.api.sendVerificationOTP({
      body: {
        email: normalizedEmail,
        type: "email-verification",
      },
      headers: requestHeaders,
    });
  } catch {
    return { ok: false, code: "SIGNUP_FAILED" };
  }

  return {
    ok: true,
    delivery: getRememberedOtpDelivery(normalizedEmail),
  };
}

export async function linkPhoneAndCnicToUser(
  phoneInput: string,
  email: string,
  cnicInput: string,
): Promise<
  { ok: true } | { ok: false; code: "INVALID_INPUT" | "CNIC_EXISTS" }
> {
  const normalizedPhone = normalizePakistanPhone(phoneInput);
  const normalizedCnic = normalizeCnic(cnicInput);
  const parsedEmail = emailSchema.safeParse(email);
  const cnicHashValue = normalizedCnic ? hashCnic(normalizedCnic) : null;

  if (!normalizedPhone || !normalizedCnic || !parsedEmail.success || !cnicHashValue) {
    return { ok: false, code: "INVALID_INPUT" };
  }

  const existingCnic = await prisma.user.findFirst({
    where: {
      cnicHash: cnicHashValue,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existingCnic) {
    return { ok: false, code: "CNIC_EXISTS" };
  }

  await prisma.user.update({
    where: { email: parsedEmail.data.toLowerCase() },
    data: {
      phone: normalizedPhone,
      phoneNumber: normalizedPhone,
      phoneNumberVerified: true,
      cnicEncrypted: encryptCnic(normalizedCnic),
      cnicHash: cnicHashValue,
    },
  });

  return { ok: true };
}

export async function getEmailOtpDeliveryMeta(
  email: string,
): Promise<SendEmailResult | null> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return null;
  }

  return getRememberedOtpDelivery(parsed.data.toLowerCase());
}
