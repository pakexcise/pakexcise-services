"use client";

import { useSearchParams } from "next/navigation";

import type { AuthIntent } from "@/features/auth/lib/auth-url";
import { parseAuthIntent } from "@/features/auth/lib/auth-url";

export function useAuthPageQuery(): {
  callbackUrl: string | null;
  intent: AuthIntent | undefined;
} {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const intent = parseAuthIntent(searchParams.get("intent"));

  return { callbackUrl, intent };
}
