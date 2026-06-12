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

  const normalizedError = error.toLowerCase();

  let message = labels.authError;

  if (
    error === "social_auth_failed" ||
    normalizedError.includes("callback") ||
    normalizedError.includes("social")
  ) {
    message = labels.socialFailed;
  } else if (error === "internal_server_error" || error === "auth_error") {
    message = labels.authError;
  }

  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
