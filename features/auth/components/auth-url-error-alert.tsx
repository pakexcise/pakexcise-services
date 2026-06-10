"use client";

import { useSearchParams } from "next/navigation";

type AuthUrlErrorAlertProps = {
  labels: {
    authError: string;
    socialFailed: string;
  };
};

export function AuthUrlErrorAlert({ labels }: AuthUrlErrorAlertProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) {
    return null;
  }

  let message = labels.socialFailed;

  if (error === "internal_server_error" || error === "auth_error") {
    message = labels.authError;
  } else if (error === "social_auth_failed") {
    message = labels.socialFailed;
  }

  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
