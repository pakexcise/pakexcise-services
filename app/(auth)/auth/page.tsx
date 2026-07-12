import type { Route } from "next";
import { redirect } from "next/navigation";

import {
  buildLoginUrl,
  buildSignupUrl,
  parseAuthIntent,
  parseAuthMode,
} from "@/features/auth/lib/auth-url";

type AuthRedirectPageProps = {
  searchParams: Promise<{
    mode?: string;
    intent?: string;
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function AuthRedirectPage({
  searchParams,
}: AuthRedirectPageProps) {
  const params = await searchParams;
  const mode = parseAuthMode(params.mode);
  const intent = parseAuthIntent(params.intent);
  const target =
    mode === "signup"
      ? buildSignupUrl({ callbackUrl: params.callbackUrl, intent })
      : buildLoginUrl({ callbackUrl: params.callbackUrl, intent });

  const url = params.error
    ? `${target}${target.includes("?") ? "&" : "?"}error=${encodeURIComponent(params.error)}`
    : target;

  redirect(url as Route);
}
