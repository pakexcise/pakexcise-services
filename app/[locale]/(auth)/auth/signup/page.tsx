import type { Route } from "next";
import { redirect } from "next/navigation";

import { buildSignupUrl } from "@/features/auth/lib/auth-url";

type AuthSignupRedirectPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    intent?: string;
    error?: string;
  }>;
};

export default async function AuthSignupRedirectPage({
  searchParams,
}: AuthSignupRedirectPageProps) {
  const params = await searchParams;
  const target = buildSignupUrl({
    callbackUrl: params.callbackUrl,
    intent: params.intent === "agent" ? "agent" : undefined,
  });

  const url = params.error
    ? `${target}${target.includes("?") ? "&" : "?"}error=${encodeURIComponent(params.error)}`
    : target;

  redirect(url as Route);
}
