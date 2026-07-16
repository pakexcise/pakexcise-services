import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP } from "better-auth/plugins";
import { adminAc } from "better-auth/plugins/admin/access";
import { render } from "@react-email/render";

import { authConfig } from "@/config/auth";
import { getPublicAppUrl } from "@/config/env.shared";
import { getEmailBranding } from "@/features/notifications/lib/email-branding";
import { PasswordResetEmail } from "@/features/notifications/templates/emails/password-reset-email";
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
      const branding = await getEmailBranding();
      const html = await render(
        PasswordResetEmail({
          branding,
          name: user.name,
          resetUrl: url,
        }),
      );

      await sendTransactionalEmail({
        to: user.email,
        subject: "Reset your PakExcise.com password",
        text: `Reset your ${branding.siteName} password: ${url}\n\nIf you did not request this, ignore this email.\n\n${branding.disclaimer}`,
        html,
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
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmailOtp(email, otp, type);
      },
    }),
    admin({
      defaultRole: "CUSTOMER",
      adminRoles: ["SUPER_ADMIN"],
      impersonationSessionDuration: 60 * 60,
      roles: {
        SUPER_ADMIN: adminAc,
      },
    }),
    nextCookies(),
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
