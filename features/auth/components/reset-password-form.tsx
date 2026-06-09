"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { resetPassword } from "@/lib/auth-client";

type ResetPasswordFormLabels = {
  newPassword: string;
  confirmPassword: string;
  submit: string;
  submitting: string;
  success: string;
  resetFailed: string;
  passwordMismatch: string;
  passwordHint: string;
  invalidToken: string;
  backToLogin: string;
  requestNewLink: string;
};

type ResetPasswordFormProps = {
  labels: ResetPasswordFormLabels;
};

export function ResetPasswordForm({ labels }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  if (tokenError === "INVALID_TOKEN" || (!token && !success)) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
          {labels.invalidToken}
        </p>
        <Button asChild className="w-full">
          <Link href="/forgot-password">{labels.requestNewLink}</Link>
        </Button>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(labels.invalidToken);
      return;
    }

    if (password !== confirmPassword) {
      setError(labels.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(labels.passwordHint);
      return;
    }

    startTransition(async () => {
      try {
        const result = await resetPassword({
          newPassword: password,
          token,
        });

        if (result.error) {
          setError(result.error.message ?? labels.resetFailed);
          return;
        }

        setSuccess(true);
        router.push("/login");
        router.refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : labels.resetFailed,
        );
      }
    });
  }

  if (success) {
    return (
      <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-3 text-center text-sm">
        {labels.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="newPassword">{labels.newPassword}</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{labels.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
