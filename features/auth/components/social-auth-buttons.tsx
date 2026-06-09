"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { SocialProviderId } from "@/features/auth/lib/social-providers";
import { buildAuthRedirectUrl } from "@/features/auth/lib/redirect";
import { signIn } from "@/lib/auth-client";

type SocialAuthButtonsProps = {
  providers: SocialProviderId[];
  labels: {
    google: string;
    facebook: string;
    socialFailed: string;
    notConfigured: string;
  };
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.253h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

const ALL_PROVIDERS: SocialProviderId[] = ["google", "facebook"];

export function SocialAuthButtons({ providers, labels }: SocialAuthButtonsProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] =
    useState<SocialProviderId | null>(null);

  function handleSocial(provider: SocialProviderId) {
    if (!providers.includes(provider)) {
      setError(labels.notConfigured);
      return;
    }

    setError(null);
    setPendingProvider(provider);

    const callbackUrl = searchParams.get("callbackUrl");
    const callbackURL = buildAuthRedirectUrl(callbackUrl);

    startTransition(async () => {
      try {
        const result = await signIn.social({
          provider,
          callbackURL,
          errorCallbackURL: "/login",
        });

        if (result.error) {
          setError(result.error.message ?? labels.socialFailed);
          setPendingProvider(null);
        }
      } catch (socialError) {
        setError(
          socialError instanceof Error
            ? socialError.message
            : labels.socialFailed,
        );
        setPendingProvider(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {ALL_PROVIDERS.map((provider) => {
          const enabled = providers.includes(provider);
          const label = provider === "google" ? labels.google : labels.facebook;
          const Icon = provider === "google" ? GoogleIcon : FacebookIcon;

          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={() => handleSocial(provider)}
              title={enabled ? undefined : labels.notConfigured}
            >
              <Icon />
              {label}
              {pendingProvider === provider ? "..." : ""}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
