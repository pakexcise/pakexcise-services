"use client";

import { useSearchParams } from "next/navigation";

import {
  buildLoginUrl,
  buildSignupUrl,
  parseAuthIntent,
  type AuthMode,
} from "@/features/auth/lib/auth-url";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AuthModeTabsProps = {
  mode: AuthMode;
  loginLabel: string;
  signupLabel: string;
};

export function AuthModeTabs({ mode, loginLabel, signupLabel }: AuthModeTabsProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const intent = parseAuthIntent(searchParams.get("intent"));
  const sharedQuery = { callbackUrl, intent };

  const loginHref = buildLoginUrl(sharedQuery);
  const signupHref = buildSignupUrl(sharedQuery);

  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/40 p-1">
      <Link
        href={loginHref}
        className={cn(
          "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
          mode === "login"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {loginLabel}
      </Link>
      <Link
        href={signupHref}
        className={cn(
          "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
          mode === "signup"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {signupLabel}
      </Link>
    </div>
  );
}
