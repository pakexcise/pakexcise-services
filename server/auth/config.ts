import "server-only";

import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { phoneNumber } from "better-auth/plugins";

import { authConfig } from "@/config/auth";
import { getFacebookSocialProvider } from "@/server/auth/facebook-provider";
import { isPhoneOtpDeliveryError } from "@/lib/errors/phone-otp-errors";
import { normalizePakistanPhone } from "@/lib/validations/phone";
import { prisma } from "@/server/db/client";
import { sendEmailOtp } from "@/server/notifications/send-email-otp";
import { sendPhoneOtp } from "@/server/notifications/send-phone-otp";
import { sendTransactionalEmail } from "@/server/notifications/send-email";

function getGoogleSocialProvider():
  | {
      clientId: string;
      clientSecret: string;
    }
  | undefined {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return undefined;
  }

  return { clientId, clientSecret };
}

const googleProvider = getGoogleSocialProvider();
const facebookProvider = getFacebookSocialProvider();

const socialProviders = {
  ...(googleProvider ? { google: googleProvider } : {}),
  ...(facebookProvider ? { facebook: facebookProvider } : {}),
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Reset your PakExcise.com password",
        text: `Click the link to reset your password: ${url}`,
        html: `
          <p>Hello${user.name ? ` ${user.name}` : ""},</p>
          <p>We received a request to reset your PakExcise.com password.</p>
          <p><a href="${url}">Reset your password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
          <p>PakExcise.com is a private facilitation service — not a government website.</p>
        `,
      });
    },
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmailOtp(email, otp, type);
      },
    }),
    phoneNumber({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      requireVerification: true,
      phoneNumberValidator: (value) => normalizePakistanPhone(value) !== null,
      signUpOnVerification: {
        getTempEmail: (phone) => {
          const digits = phone.replace(/\D/g, "");
          return `phone+${digits}@otp.pakexcise.com`;
        },
        getTempName: (phone) => phone,
      },
      async sendOTP({ phoneNumber: phone, code }) {
        try {
          await sendPhoneOtp(phone, code);
        } catch (error) {
          if (isPhoneOtpDeliveryError(error)) {
            throw new APIError("BAD_REQUEST", { message: error.code });
          }

          throw error;
        }
      },
      async callbackOnVerification({ phoneNumber: phone, user }) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            phone,
            phoneNumber: phone,
            phoneNumberVerified: true,
          },
        });
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
      twoFactorEnabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];

export function isAdminRoleRequiringTwoFactor(role: string): boolean {
  return authConfig.adminRolesRequiringTwoFactor.includes(
    role as (typeof authConfig.adminRolesRequiringTwoFactor)[number],
  );
}
