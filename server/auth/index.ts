export {
  auth,
  isAdminRoleRequiringTwoFactor,
  type AuthUser,
  type Session,
} from "@/server/auth/config";

export {
  clearSessionTwoFactorVerified,
  getRequestMeta,
  getRequestMetaFromHeaders,
  getServerSession,
  getSessionTwoFactorVerifiedAt,
  hasSessionCookie,
  markSessionTwoFactorVerified,
  type ServerSession,
  type SessionMeta,
} from "@/server/auth/session";

export {
  getCurrentUser,
  requireUser,
  type CurrentUser,
} from "@/server/auth/current-user";
