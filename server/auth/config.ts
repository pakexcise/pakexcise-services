import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";

import { authConfig } from "@/config/auth";
import { getPublicAppUrl } from "@/config/env.shared";
import { prisma } from "@/server/db/client";
import { sendEmailOtp } from "@/server/notifications/send-email-otp";
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

const socialProviders = {
  ...(googleProvider ? { google: googleProvider } : {}),
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
    autoSignIn: false,
    requireEmailVerification: true,
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
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      disableSignUp: true,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmailOtp(email, otp, type);
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
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? getPublicAppUrl(),
    getPublicAppUrl(),
  ],
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.APP_ENV !== "development",
    defaultCookieAttributes: {
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.APP_ENV !== "development",
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
