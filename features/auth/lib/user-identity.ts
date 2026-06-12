import "server-only";

import { getTempPhoneEmail } from "@/features/auth/lib/temp-phone-email";
import { normalizeCnic } from "@/lib/validations/cnic";
import { prisma } from "@/server/db/client";
import { hashCnic } from "@/server/security/cnic-hash";

const TEMP_PHONE_EMAIL_PATTERN = /^phone\+\d+@otp\.pakexcise\.com$/i;

export function isTempPhoneEmail(email: string): boolean {
  return TEMP_PHONE_EMAIL_PATTERN.test(email.trim().toLowerCase());
}

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  return prisma.user.findFirst({
    where: {
      email: normalized,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      phoneNumber: true,
      emailVerified: true,
    },
  });
}

export async function findUserByPhone(phoneNumber: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ phoneNumber }, { phone: phoneNumber }],
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      phoneNumber: true,
      phoneNumberVerified: true,
    },
  });
}

export async function findUserByPhoneOrTempEmail(phoneNumber: string) {
  const phoneUser = await findUserByPhone(phoneNumber);
  if (phoneUser) {
    return phoneUser;
  }

  return findUserByEmail(getTempPhoneEmail(phoneNumber));
}

export async function findGoogleAccountByEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  return prisma.account.findFirst({
    where: {
      providerId: "google",
      user: {
        email: normalized,
        deletedAt: null,
      },
    },
    select: {
      userId: true,
    },
  });
}

export async function findUserByCnic(cnicInput: string) {
  const normalized = normalizeCnic(cnicInput);
  if (!normalized) {
    return null;
  }

  const cnicHash = hashCnic(normalized);
  if (!cnicHash) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      cnicHash,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      phoneNumber: true,
      phoneNumberVerified: true,
    },
  });
}
