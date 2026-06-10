"use client";

import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import {
  checkPhoneOrCnicLoginEligibility,
  checkPhoneSignupEligibility,
  getPhoneOrCnicLoginEmail,
  linkPhoneAndCnicToUser,
} from "@/features/auth/actions/otp-flow-actions";
import { PasswordInput } from "@/features/auth/components/password-input";
import { getTempPhoneEmail } from "@/features/auth/lib/temp-phone-email";
import { buildAuthRedirectUrl } from "@/features/auth/lib/redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, signIn, signUp } from "@/lib/auth-client";
import { isValidCnicInput } from "@/lib/validations/cnic";
import {
  isValidPakistanPhone,
  normalizePakistanPhone,
} from "@/lib/validations/phone";

const MIN_PASSWORD_LENGTH = 8;

type PhoneOtpAuthFormLabels = {
  phone: string;
  phoneOrCnic?: string;
  phoneHint: string;
  phoneLoginHint?: string;
  cnic?: string;
  cnicHint?: string;
  cnicVerificationNote?: string;
  cnicExists?: string;
  invalidCnic?: string;
  password: string;
  confirmPassword?: string;
  passwordHint?: string;
  passwordMismatch?: string;
  invalidPassword?: string;
  showPassword?: string;
  name?: string;
  signIn?: string;
  signingIn?: string;
  createAccount?: string;
  creatingAccount?: string;
  sendFailed: string;
  verifyFailed?: string;
  invalidPhone: string;
  invalidIdentifier?: string;
  signInFailed?: string;
  nameRequired?: string;
  accountNotFound?: string;
  accountExists?: string;
  signupPrompt?: string;
  loginPrompt?: string;
  signupLink?: string;
  loginLink?: string;
  tryOtherMethods?: string;
};

type PhoneOtpAuthFormProps = {
  mode: "login" | "signup";
  labels: PhoneOtpAuthFormLabels;
};

function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function PhoneOtpAuthForm({ mode, labels }: PhoneOtpAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [cnicInput, setCnicInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fallbackError = labels.verifyFailed ?? labels.sendFailed;

    if (!isValidPassword(password)) {
      setError(labels.invalidPassword ?? fallbackError);
      return;
    }

    if (mode === "signup") {
      const normalized = normalizePakistanPhone(phoneInput);

      if (!normalized || !isValidPakistanPhone(phoneInput)) {
        setError(labels.invalidPhone);
        return;
      }

      if (!name.trim()) {
        setError(labels.nameRequired ?? fallbackError);
        return;
      }

      if (!isValidCnicInput(cnicInput)) {
        setError(labels.invalidCnic ?? fallbackError);
        return;
      }

      if (password !== confirmPassword) {
        setError(labels.passwordMismatch ?? fallbackError);
        return;
      }
    } else if (!loginIdentifier.trim()) {
      setError(labels.invalidIdentifier ?? labels.invalidPhone);
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        if (mode === "login") {
          const eligibility = await checkPhoneOrCnicLoginEligibility(
            loginIdentifier.trim(),
          );

          if (!eligibility.ok) {
            if (eligibility.code === "ACCOUNT_NOT_FOUND") {
              setError(
                labels.accountNotFound ?? labels.signInFailed ?? fallbackError,
              );
              return;
            }

            setError(labels.invalidIdentifier ?? labels.invalidPhone);
            return;
          }

          const identity = await getPhoneOrCnicLoginEmail(loginIdentifier.trim());

          if (!identity.ok) {
            setError(
              labels.accountNotFound ?? labels.signInFailed ?? fallbackError,
            );
            return;
          }

          const result = await signIn.email({
            email: identity.email,
            password,
          });

          if (result.error) {
            setError(result.error.message ?? labels.signInFailed ?? fallbackError);
            return;
          }

          const callbackUrl = searchParams.get("callbackUrl");
          router.push(buildAuthRedirectUrl(callbackUrl));
          router.refresh();
          return;
        }

        const normalized = normalizePakistanPhone(phoneInput);
        if (!normalized) {
          setError(labels.invalidPhone);
          return;
        }

        const eligibility = await checkPhoneSignupEligibility(
          normalized,
          cnicInput.trim(),
        );

        if (!eligibility.ok) {
          if (eligibility.code === "ACCOUNT_EXISTS") {
            setError(labels.accountExists ?? labels.sendFailed);
            return;
          }

          if (eligibility.code === "CNIC_EXISTS") {
            setError(labels.cnicExists ?? labels.sendFailed);
            return;
          }

          setError(labels.invalidPhone);
          return;
        }

        const tempEmail = getTempPhoneEmail(normalized);
        const signupResult = await signUp.email({
          email: tempEmail,
          password,
          name: name.trim(),
        });

        if (signupResult.error) {
          if (
            signupResult.error.message?.toLowerCase().includes("already") ||
            signupResult.error.message?.toLowerCase().includes("exists")
          ) {
            setError(labels.accountExists ?? labels.sendFailed);
            return;
          }

          setError(signupResult.error.message ?? labels.sendFailed);
          return;
        }

        const linkResult = await linkPhoneAndCnicToUser(
          normalized,
          tempEmail,
          cnicInput.trim(),
        );

        if (!linkResult.ok) {
          if (linkResult.code === "CNIC_EXISTS") {
            setError(labels.cnicExists ?? labels.sendFailed);
            return;
          }

          setError(labels.sendFailed);
          return;
        }

        const callbackUrl = searchParams.get("callbackUrl");
        router.push(buildAuthRedirectUrl(callbackUrl));
        router.refresh();
      } catch (submitError) {
        const message =
          submitError instanceof Error ? submitError.message : undefined;
        setError(
          message ??
            (mode === "login"
              ? (labels.signInFailed ?? fallbackError)
              : labels.sendFailed),
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error ? (
        <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          {mode === "login" && error === labels.accountNotFound ? (
            <p className="text-foreground">
              {labels.signupPrompt}{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                {labels.signupLink}
              </Link>
            </p>
          ) : null}
          {mode === "signup" && error === labels.accountExists ? (
            <p className="text-foreground">
              {labels.loginPrompt}{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
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

      {mode === "login" ? (
        <div className="space-y-2">
          <Label htmlFor="loginIdentifier">
            {labels.phoneOrCnic ?? labels.phone}
          </Label>
          <Input
            id="loginIdentifier"
            name="loginIdentifier"
            type="text"
            autoComplete="username"
            inputMode="text"
            placeholder="03XX XXXXXXX or 12345-1234567-1"
            required
            value={loginIdentifier}
            onChange={(event) => setLoginIdentifier(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {labels.phoneLoginHint ?? labels.phoneHint}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="03XX XXXXXXX"
            required
            value={phoneInput}
            onChange={(event) => setPhoneInput(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{labels.phoneHint}</p>
        </div>
      )}

      {mode === "signup" && labels.cnic ? (
        <div className="space-y-2">
          <Label htmlFor="cnic">{labels.cnic}</Label>
          <Input
            id="cnic"
            name="cnic"
            type="text"
            autoComplete="off"
            inputMode="numeric"
            placeholder="12345-1234567-1"
            required
            value={cnicInput}
            onChange={(event) => setCnicInput(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{labels.cnicHint}</p>
          {labels.cnicVerificationNote ? (
            <p className="rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs text-foreground">
              {labels.cnicVerificationNote}
            </p>
          ) : null}
        </div>
      ) : null}

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
            ? (labels.signingIn ?? "…")
            : (labels.creatingAccount ?? "…")
          : mode === "login"
            ? (labels.signIn ?? "Sign in")
            : (labels.createAccount ?? "Create account")}
      </Button>
    </form>
  );
}
