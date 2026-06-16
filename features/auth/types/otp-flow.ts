import type { SendEmailResult } from "@/server/notifications/send-email";

export type AuthEligibilityResult =
  | { ok: true; resumeVerification?: boolean }
  | {
      ok: false;
      code:
        | "ACCOUNT_NOT_FOUND"
        | "ACCOUNT_EXISTS"
        | "EMAIL_NOT_VERIFIED"
        | "PHONE_EXISTS"
        | "CNIC_EXISTS"
        | "GOOGLE_ACCOUNT_EXISTS"
        | "INVALID_INPUT";
    };

export type EmailSignupInitResult =
  | { ok: true; delivery: SendEmailResult | null }
  | { ok: false; code: "ACCOUNT_EXISTS" | "INVALID_INPUT" | "SIGNUP_FAILED" };

export type PhoneLoginIdentityResult =
  | { ok: true; email: string }
  | { ok: false; code: "ACCOUNT_NOT_FOUND" | "INVALID_INPUT" };

export type LinkPhoneAndCnicResult =
  | { ok: true }
  | { ok: false; code: "INVALID_INPUT" | "CNIC_EXISTS" | "PHONE_EXISTS" };
