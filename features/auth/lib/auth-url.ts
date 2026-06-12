import { isSafeInternalPath } from "@/features/auth/lib/redirect";

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const CHOOSE_ROLE_PATH = "/choose-role";

/** @deprecated Use LOGIN_PATH or SIGNUP_PATH */
export const AUTH_PATH = LOGIN_PATH;

export type AuthIntent = "agent";
export type AuthMode = "login" | "signup";

export type AuthPageQuery = {
  mode?: AuthMode;
  intent?: AuthIntent;
  callbackUrl?: string | null;
};

type AuthLinkQuery = {
  intent?: AuthIntent;
  callbackUrl?: string | null;
};

function appendQuery(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function buildPathWithQuery(
  path: string,
  options?: AuthLinkQuery,
): string {
  const params = new URLSearchParams();

  if (options?.intent === "agent") {
    params.set("intent", "agent");
  }

  if (isSafeInternalPath(options?.callbackUrl)) {
    params.set("callbackUrl", options.callbackUrl);
  }

  return appendQuery(path, params);
}

export function appendSearchParams(
  path: string,
  extra: Record<string, string | undefined>,
): string {
  const queryIndex = path.indexOf("?");
  const pathname = queryIndex >= 0 ? path.slice(0, queryIndex) : path;
  const params = new URLSearchParams(
    queryIndex >= 0 ? path.slice(queryIndex + 1) : "",
  );

  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined) {
      params.set(key, value);
    }
  }

  return appendQuery(pathname, params);
}

export function buildLoginUrl(options?: AuthLinkQuery): string {
  return buildPathWithQuery(LOGIN_PATH, options);
}

export function buildSignupUrl(options?: AuthLinkQuery): string {
  return buildPathWithQuery(SIGNUP_PATH, options);
}

export function buildAuthPageUrl(options?: AuthPageQuery): string {
  const target = options?.mode === "signup" ? SIGNUP_PATH : LOGIN_PATH;
  return buildPathWithQuery(target, options);
}

export function buildAuthPageErrorUrl(
  options: AuthPageQuery & { error?: string },
): string {
  const base = options.mode === "signup" ? buildSignupUrl(options) : buildLoginUrl(options);
  return appendSearchParams(base, { error: options.error });
}

export function buildChooseRoleUrl(options?: AuthLinkQuery): string {
  return buildPathWithQuery(CHOOSE_ROLE_PATH, options);
}

export function buildPostSignupRedirectUrl(options?: {
  intent?: AuthIntent | null;
  callbackUrl?: string | null;
}): string {
  return buildChooseRoleUrl({
    intent: options?.intent === "agent" ? "agent" : undefined,
    callbackUrl: options?.callbackUrl,
  });
}

export function parseAuthIntent(
  value: string | null | undefined,
): AuthIntent | undefined {
  return value === "agent" ? "agent" : undefined;
}

export function parseAuthMode(
  value: string | null | undefined,
): AuthMode {
  return value === "signup" ? "signup" : "login";
}
