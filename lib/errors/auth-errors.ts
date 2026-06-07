export type AuthErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ACCOUNT_DISABLED"
  | "AGENT_NOT_APPROVED"
  | "TWO_FACTOR_REQUIRED"
  | "RATE_LIMITED"
  | "CSRF_INVALID";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
