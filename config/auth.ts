import { buildLoginUrl } from "@/features/auth/lib/auth-url";

export const authConfig = {
  sessionCookieNames: [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
  ],
  csrfCookieName: "pakexcise.csrf_token",
  csrfHeaderName: "x-csrf-token",
  loginPath: "/login",
  signupPath: "/signup",
  forgotPasswordPath: "/forgot-password",
  resetPasswordPath: "/reset-password",
  customerPathPrefix: "/customer",
  agentPathPrefix: "/agent",
  supportPathPrefix: "/support",
  adminPathPrefix: "/admin",
  bcryptCost: 12,
  otpPepperEnvKey: "OTP_PEPPER",
  ipHashPepperEnvKey: "IP_HASH_PEPPER",
  adminRolesRequiringTwoFactor: ["ADMIN", "SUPER_ADMIN"] as const,
} as const;

export type AdminRoleRequiringTwoFactor =
  (typeof authConfig.adminRolesRequiringTwoFactor)[number];

export function buildLoginRedirectUrl(callbackPath: string): string {
  return buildLoginUrl({ callbackUrl: callbackPath });
}
