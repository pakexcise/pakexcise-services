"use client";

import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { checkPhoneOrCnicLoginEligibility } from "@/features/auth/actions/check-phone-or-cnic-login-eligibility";
import { checkPhoneSignupEligibility } from "@/features/auth/actions/check-phone-signup-eligibility";
import { getPhoneOrCnicLoginEmail } from "@/features/auth/actions/get-phone-or-cnic-login-email";
import { linkPhoneAndCnicToUser } from "@/features/auth/actions/link-phone-and-cnic-to-user";
import { PasswordInput } from "@/features/auth/components/password-input";
import { getTempPhoneEmail } from "@/features/auth/lib/temp-phone-email";
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
import { signIn, signUp } from "@/lib/auth-client";
import { disclaimerCompactClassName } from "@/lib/styles/disclaimer-banner";
import {
  CNIC_MAX_DIGITS,
  formatCnicInput,
  formatLoginIdentifierInput,
  isValidCnicInput,
  isValidLoginIdentifier,
} from "@/lib/validations/cnic";
import {
  formatPakistanPhoneInput,
  isValidPakistanPhone,
  normalizePakistanPhone,
} from "@/lib/validations/phone";

const MIN_PASSWORD_LENGTH = 8;

type SignupErrorCode = "PHONE_EXISTS" | "CNIC_EXISTS" | null;

type PhoneOtpAuthFormLabels = {
  phone: string;
  phoneOrCnic?: string;
  phoneHint: string;
  phoneLoginHint?: string;
  phoneLoginPlaceholder?: string;
  cnic?: string;
  cnicHint?: string;
  cnicVerificationNote?: string;
  cnicExists?: string;
  phoneExists?: string;
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
  staleServerAction?: string;
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
  const { callbackUrl, intent } = useAuthPageQuery();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [cnicInput, setCnicInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<SignupErrorCode>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fallbackError = labels.verifyFailed ?? labels.sendFailed;

    if (!isValidPassword(password)) {
      setError(labels.invalidPassword ?? fallbackError);
      setErrorCode(null);
      return;
    }

    if (mode === "signup") {
      const normalized = normalizePakistanPhone(phoneInput);

      if (!normalized || !isValidPakistanPhone(phoneInput)) {
        setError(labels.invalidPhone);
        setErrorCode(null);
        return;
      }

      if (!name.trim()) {
        setError(labels.nameRequired ?? fallbackError);
        setErrorCode(null);
        return;
      }

      if (!isValidCnicInput(cnicInput)) {
        setError(labels.invalidCnic ?? fallbackError);
        setErrorCode(null);
        return;
      }

      if (password !== confirmPassword) {
        setError(labels.passwordMismatch ?? fallbackError);
        setErrorCode(null);
        return;
      }
    } else if (
      !loginIdentifier.trim() ||
      !isValidLoginIdentifier(loginIdentifier.trim())
    ) {
      setError(labels.invalidIdentifier ?? labels.invalidPhone);
      setErrorCode(null);
      return;
    }

    setError(null);
    setErrorCode(null);

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
          if (eligibility.code === "PHONE_EXISTS") {
            setErrorCode("PHONE_EXISTS");
            setError(labels.phoneExists ?? labels.accountExists ?? labels.sendFailed);
            return;
          }

          if (eligibility.code === "CNIC_EXISTS") {
            setErrorCode("CNIC_EXISTS");
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
            setErrorCode("PHONE_EXISTS");
            setError(labels.phoneExists ?? labels.sendFailed);
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
            setErrorCode("CNIC_EXISTS");
            setError(labels.cnicExists ?? labels.sendFailed);
            return;
          }

          if (linkResult.code === "PHONE_EXISTS") {
            setErrorCode("PHONE_EXISTS");
            setError(labels.phoneExists ?? labels.sendFailed);
            return;
          }

          setError(labels.sendFailed);
          return;
        }

        const signInResult = await signIn.email({
          email: tempEmail,
          password,
        });

        if (signInResult.error) {
          setError(signInResult.error.message ?? labels.sendFailed);
          return;
        }

        router.push(buildPostSignupRedirectUrl({ intent, callbackUrl }));
        router.refresh();
      } catch (submitError) {
        setError(
          resolveAuthSubmitError(
            submitError,
            mode === "login"
              ? (labels.signInFailed ?? fallbackError)
              : labels.sendFailed,
            labels.staleServerAction ?? fallbackError,
          ),
        );
      }
    });
  }

  const showSignupLoginPrompt =
    mode === "signup" &&
    (errorCode === "PHONE_EXISTS" || errorCode === "CNIC_EXISTS");

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
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
          {showSignupLoginPrompt ? (
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
            inputMode="numeric"
            placeholder={labels.phoneLoginPlaceholder ?? "03001234567 or 13-digit CNIC"}
            required
            maxLength={CNIC_MAX_DIGITS}
            value={loginIdentifier}
            onChange={(event) =>
              setLoginIdentifier(formatLoginIdentifierInput(event.target.value))
            }
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
            placeholder="03XX-XXXXXXX"
            required
            maxLength={12}
            value={phoneInput}
            onChange={(event) =>
              setPhoneInput(formatPakistanPhoneInput(event.target.value))
            }
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
            maxLength={15}
            value={cnicInput}
            onChange={(event) => setCnicInput(formatCnicInput(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">{labels.cnicHint}</p>
          {labels.cnicVerificationNote ? (
            <p className={disclaimerCompactClassName}>
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
