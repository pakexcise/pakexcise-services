"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpCodeInput } from "@/features/auth/components/otp-code-input";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { authClient, signIn } from "@/lib/auth-client";
import { getUserRole } from "@/lib/auth-types";
import {
  formatResendSandboxMessage,
  getResendSandboxOwnerEmail,
  isResendSandboxRecipient,
} from "@/lib/email/resend-sandbox";

type EmailOtpAuthFormLabels = {
  email: string;
  name?: string;
  otp: string;
  otpHint: string;
  sendOtp: string;
  sendingOtp: string;
  verifyOtp: string;
  verifyingOtp: string;
  resendOtp: string;
  changeEmail: string;
  otpSentEmail: string;
  otpSentEmailSandbox: string;
  otpSentEmailDevConsole: string;
  sendFailed: string;
  verifyFailed: string;
  invalidEmail: string;
  nameRequired?: string;
};

type EmailOtpAuthFormProps = {
  mode: "login" | "signup";
  labels: EmailOtpAuthFormLabels;
};

export function EmailOtpAuthForm({ mode, labels }: EmailOtpAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function resolveOtpSentMessage(trimmedEmail: string): string {
    const sandboxOwner = getResendSandboxOwnerEmail();

    if (sandboxOwner && isResendSandboxRecipient(trimmedEmail)) {
      return formatResendSandboxMessage(
        labels.otpSentEmailSandbox,
        sandboxOwner,
        trimmedEmail,
      );
    }

    return labels.otpSentEmail;
  }

  function sendOtpCode(targetEmail: string, advanceStep = true) {
    const trimmedEmail = targetEmail.trim().toLowerCase();

    if (!trimmedEmail.includes("@")) {
      setError(labels.invalidEmail);
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError(labels.nameRequired ?? labels.verifyFailed);
      return;
    }

    setError(null);
    if (advanceStep) {
      setInfo(null);
    }

    startTransition(async () => {
      try {
        const result = await authClient.emailOtp.sendVerificationOtp({
          email: trimmedEmail,
          type: "sign-in",
        });

        if (result.error) {
          setError(result.error.message ?? labels.sendFailed);
          return;
        }

        setEmail(trimmedEmail);
        if (advanceStep) {
          setStep("otp");
        }
        setInfo(resolveOtpSentMessage(trimmedEmail));
      } catch (sendError) {
        setError(
          sendError instanceof Error ? sendError.message : labels.sendFailed,
        );
      }
    });
  }

  function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendOtpCode(email, true);
  }

  function handleResendOtp() {
    sendOtpCode(email, false);
  }

  function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError(labels.verifyFailed);
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn.emailOtp({
          email,
          otp,
          ...(mode === "signup" && name.trim() ? { name: name.trim() } : {}),
        });

        if (result.error) {
          setError(result.error.message ?? labels.verifyFailed);
          return;
        }

        const session = await authClient.getSession();
        const user = result.data?.user ?? session.data?.user;
        const role = getUserRole(user);
        const callbackUrl = searchParams.get("callbackUrl");
        const destination = resolvePostLoginPath(role, callbackUrl);

        router.push(destination);
        router.refresh();
      } catch (verifyError) {
        setError(
          verifyError instanceof Error
            ? verifyError.message
            : labels.verifyFailed,
        );
      }
    });
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
            {info}
          </p>
        ) : null}

        <OtpCodeInput
          id="emailOtp"
          label={labels.otp}
          value={otp}
          onChange={setOtp}
          hint={labels.otpHint}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? labels.verifyingOtp : labels.verifyOtp}
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={() => {
              setStep("identifier");
              setOtp("");
              setError(null);
              setInfo(null);
            }}
          >
            {labels.changeEmail}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={isPending}
            onClick={handleResendOtp}
          >
            {labels.resendOtp}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {mode === "signup" && labels.name ? (
        <div className="space-y-2">
          <Label htmlFor="name">{labels.name}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
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
        {isPending ? labels.sendingOtp : labels.sendOtp}
      </Button>
    </form>
  );
}
