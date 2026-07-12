"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgetPassword } from "@/lib/auth-client";
import { absoluteUrl } from "@/lib/utils";

import Link from "next/link";
type ForgotPasswordFormLabels = {
  email: string;
  submit: string;
  submitting: string;
  success: string;
  requestFailed: string;
  backToLogin: string;
};

type ForgotPasswordFormProps = {
  labels: ForgotPasswordFormLabels;
};

export function ForgotPasswordForm({ labels }: ForgotPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);

    startTransition(async () => {
      try {
        const result = await forgetPassword({
          email: email.trim(),
          redirectTo: absoluteUrl("/reset-password"),
        });

        if (result.error) {
          setError(result.error.message ?? labels.requestFailed);
          return;
        }

        setSent(true);
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : labels.requestFailed,
        );
      }
    });
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-3 text-sm text-foreground">
          {labels.success}
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">{labels.backToLogin}</Link>
        </Button>
      </div>
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
        <Label htmlFor="email">{labels.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? labels.submitting : labels.submit}
      </Button>

      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {labels.backToLogin}
        </Link>
      </p>
    </form>
  );
}
