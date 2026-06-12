import type { Route } from "next";
import { redirect } from "next/navigation";

import { buildLoginUrl } from "@/features/auth/lib/auth-url";

type AuthLoginRedirectPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    intent?: string;
    error?: string;
  }>;
};

export default async function AuthLoginRedirectPage({
  searchParams,
}: AuthLoginRedirectPageProps) {
  const params = await searchParams;
  const target = buildLoginUrl({
    callbackUrl: params.callbackUrl,
    intent: params.intent === "agent" ? "agent" : undefined,
  });

  const url = params.error
    ? `${target}${target.includes("?") ? "&" : "?"}error=${encodeURIComponent(params.error)}`
    : target;

  redirect(url as Route);
}
