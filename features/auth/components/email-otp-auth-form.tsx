"use client";

import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { checkEmailAuthEligibility } from "@/features/auth/actions/check-email-auth-eligibility";
import { getEmailOtpDeliveryMeta } from "@/features/auth/actions/get-email-otp-delivery-meta";
import { sendEmailVerificationOtp } from "@/features/auth/actions/send-email-verification-otp";
import { resolveEmailOtpSentMessage } from "@/features/auth/lib/otp-delivery-messages";
import { OtpCodeInput } from "@/features/auth/components/otp-code-input";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useAuthPageQuery } from "@/features/auth/hooks/use-auth-page-query";
import {
  buildLoginUrl,
  buildSignupUrl,
  buildPostSignupRedirectUrl,
} from "@/features/auth/lib/auth-url";
import { buildAuthRedirectUrl } from "@/features/auth/lib/redirect";
import { resolveAuthSubmitError } from "@/features/auth/lib/server-action-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, signIn, signUp } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 8;

type EmailOtpAuthFormLabels = {
  email: string;
  password: string;
  confirmPassword?: string;
  passwordHint: string;
  passwordMismatch?: string;
  invalidPassword?: string;
  showPassword?: string;
  name?: string;
  otp: string;
  otpHint: string;
  signIn?: string;
  signingIn?: string;
  createAccount?: string;
  creatingAccount?: string;
  verifyOtp: string;
  verifyingOtp: string;
  resendOtp: string;
  changeEmail: string;
  otpSentEmail: string;
  otpSentEmailSandbox: string;
  otpSentEmailDevConsole: string;
  sendFailed: string;
  emailDeliveryFailed?: string;
  rateLimitedOtp?: string;
  verifyFailed: string;
  invalidEmail: string;
  signInFailed?: string;
  nameRequired?: string;
  accountNotFound?: string;
  accountExists?: string;
  emailExists?: string;
  emailNotVerified?: string;
  googleAccountExists?: string;
  signupPrompt?: string;
  loginPrompt?: string;
  signupLink?: string;
  loginLink?: string;
  staleServerAction?: string;
};

type EmailOtpAuthFormProps = {
  mode: "login" | "signup";
  labels: EmailOtpAuthFormLabels;
};

function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function EmailOtpAuthForm({ mode, labels }: EmailOtpAuthFormProps) {
  const router = useRouter();
  const { callbackUrl, intent } = useAuthPageQuery();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function resolveDeliveryMessage(targetEmail: string): Promise<string> {
    const delivery = await getEmailOtpDeliveryMeta(targetEmail);
    return resolveEmailOtpSentMessage(targetEmail, labels, delivery);
  }

  function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.includes("@")) {
      setError(labels.invalidEmail);
      return;
    }

    if (!isValidPassword(password)) {
      setError(labels.invalidPassword ?? labels.verifyFailed);
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError(labels.nameRequired ?? labels.verifyFailed);
        return;
      }

      if (password !== confirmPassword) {
        setError(labels.passwordMismatch ?? labels.verifyFailed);
        return;
      }
    }

    setError(null);
    setInfo(null);

    startTransition(async () => {
      try {
        const eligibility = await checkEmailAuthEligibility(trimmedEmail, mode);

        if (!eligibility.ok) {
          if (eligibility.code === "ACCOUNT_NOT_FOUND") {
            setError(labels.accountNotFound ?? labels.signInFailed ?? labels.verifyFailed);
            return;
          }

          if (eligibility.code === "EMAIL_NOT_VERIFIED") {
            setError(
              labels.emailNotVerified ??
                labels.signInFailed ??
                labels.verifyFailed,
            );
            return;
          }

          if (eligibility.code === "GOOGLE_ACCOUNT_EXISTS") {
            setError(labels.googleAccountExists ?? labels.sendFailed);
            return;
          }

          if (eligibility.code === "ACCOUNT_EXISTS") {
            setError(labels.emailExists ?? labels.accountExists ?? labels.sendFailed);
            return;
          }

          setError(labels.invalidEmail);
          return;
        }

        if (mode === "login") {
          const result = await signIn.email({
            email: trimmedEmail,
            password,
          });

          if (result.error) {
            const isUnverified =
              result.error.status === 403 ||
              result.error.message?.toLowerCase().includes("verify");

            if (isUnverified) {
              setError(
                labels.emailNotVerified ??
                  labels.signInFailed ??
                  labels.verifyFailed,
              );
              return;
            }

            setError(result.error.message ?? labels.signInFailed ?? labels.verifyFailed);
            return;
          }

          router.push(buildAuthRedirectUrl(callbackUrl));
          router.refresh();
          return;
        }

        let signupCreatedAccount = eligibility.resumeVerification;

        if (!signupCreatedAccount) {
          const signupResult = await signUp.email({
            email: trimmedEmail,
            password,
            name: name.trim(),
          });

          if (signupResult.error) {
            const afterSignup = await checkEmailAuthEligibility(
              trimmedEmail,
              "signup",
            );

            if (!afterSignup.resumeVerification) {
              if (
                signupResult.error.message?.toLowerCase().includes("already") ||
                signupResult.error.message?.toLowerCase().includes("exists")
              ) {
                setError(
                  labels.emailExists ?? labels.accountExists ?? labels.sendFailed,
                );
                return;
              }

              setError(signupResult.error.message ?? labels.sendFailed);
              return;
            }

            signupCreatedAccount = true;
          } else {
            signupCreatedAccount = true;
          }
        }

        if (!signupCreatedAccount) {
          setError(labels.sendFailed);
          return;
        }

        const otpResult = await sendEmailVerificationOtp(trimmedEmail);

        if (!otpResult.ok) {
          if (otpResult.code === "RATE_LIMITED") {
            setError(labels.rateLimitedOtp ?? labels.sendFailed);
            return;
          }

          if (otpResult.code === "EMAIL_FAILED") {
            setError(labels.emailDeliveryFailed ?? labels.sendFailed);
            return;
          }

          setError(labels.sendFailed);
          return;
        }

        setEmail(trimmedEmail);
        setStep("otp");
        setInfo(
          resolveEmailOtpSentMessage(trimmedEmail, labels, otpResult.delivery),
        );
      } catch (submitError) {
        setError(
          resolveAuthSubmitError(
            submitError,
            mode === "login"
              ? (labels.signInFailed ?? labels.verifyFailed)
              : labels.sendFailed,
            labels.staleServerAction ?? labels.sendFailed,
          ),
        );
      }
    });
  }

  function handleResendOtp() {
    setError(null);

    startTransition(async () => {
      try {
        const otpResult = await sendEmailVerificationOtp(email);

        if (!otpResult.ok) {
          if (otpResult.code === "RATE_LIMITED") {
            setError(labels.rateLimitedOtp ?? labels.sendFailed);
            return;
          }

          if (otpResult.code === "EMAIL_FAILED") {
            setError(labels.emailDeliveryFailed ?? labels.sendFailed);
            return;
          }

          setError(labels.sendFailed);
          return;
        }

        setInfo(
          resolveEmailOtpSentMessage(email, labels, otpResult.delivery),
        );
      } catch (resendError) {
        setError(
          resolveAuthSubmitError(
            resendError,
            labels.sendFailed,
            labels.staleServerAction ?? labels.sendFailed,
          ),
        );
      }
    });
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
        const result = await authClient.emailOtp.verifyEmail({
          email,
          otp,
        });

        if (result.error) {
          setError(result.error.message ?? labels.verifyFailed);
          return;
        }

        const redirectTarget =
          mode === "signup"
            ? buildPostSignupRedirectUrl({ intent, callbackUrl })
            : buildAuthRedirectUrl(callbackUrl);
        router.push(redirectTarget);
        router.refresh();
      } catch (verifyError) {
        setError(
          resolveAuthSubmitError(
            verifyError,
            labels.verifyFailed,
            labels.staleServerAction ?? labels.verifyFailed,
          ),
        );
      }
    });
  }

  if (mode === "signup" && step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
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

        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={() => {
              setStep("credentials");
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
    <form onSubmit={handleCredentialsSubmit} className="w-full space-y-4">
      {error ? (
        <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          {mode === "login" && error === labels.accountNotFound ? (
            <p className="text-foreground">
              {labels.signupPrompt}{" "}
              <Link
                href={buildSignupUrl({ callbackUrl, intent })}
                className="font-medium text-primary hover:underline"
              >
                {labels.signupLink}
              </Link>
            </p>
          ) : null}
          {mode === "signup" && error === labels.accountExists ? (
            <p className="text-foreground">
              {labels.loginPrompt}{" "}
              <Link
                href={buildLoginUrl({ callbackUrl, intent })}
                className="font-medium text-primary hover:underline"
              >
                {labels.loginLink}
              </Link>
            </p>
          ) : null}
        </div>
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

      <div className="space-y-2">
        <Label htmlFor="password">{labels.password}</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          toggleLabel={labels.showPassword}
        />
        {mode === "signup" ? (
          <p className="text-xs text-muted-foreground">{labels.passwordHint}</p>
        ) : null}
      </div>

      {mode === "signup" && labels.confirmPassword ? (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{labels.confirmPassword}</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            toggleLabel={labels.showPassword}
          />
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? mode === "login"
            ? (labels.signingIn ?? labels.verifyOtp)
            : (labels.creatingAccount ?? labels.verifyOtp)
          : mode === "login"
            ? (labels.signIn ?? labels.verifyOtp)
            : (labels.createAccount ?? labels.verifyOtp)}
      </Button>
    </form>
  );
}
