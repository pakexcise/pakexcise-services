"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpCodeInput } from "@/features/auth/components/otp-code-input";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/lib/auth-types";
import {
  PHONE_OTP_WHATSAPP_NOT_CONFIGURED,
  PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED,
  PHONE_OTP_WHATSAPP_TOKEN_EXPIRED,
  PHONE_OTP_WHATSAPP_UNAVAILABLE,
} from "@/lib/errors/phone-otp-errors";
import {
  isValidPakistanPhone,
  normalizePakistanPhone,
} from "@/lib/validations/phone";

type PhoneOtpAuthFormLabels = {
  phone: string;
  phoneHint: string;
  name?: string;
  otp: string;
  otpHint: string;
  sendOtp: string;
  sendingOtp: string;
  verifyOtp: string;
  verifyingOtp: string;
  resendOtp: string;
  changePhone: string;
  otpSentPhone: string;
  whatsappUnavailable: string;
  whatsappNotConfigured: string;
  whatsappRecipientNotAllowed: string;
  whatsappTokenExpired: string;
  sendFailed: string;
  verifyFailed: string;
  invalidPhone: string;
  nameRequired?: string;
};

type PhoneOtpAuthFormProps = {
  mode: "login" | "signup";
  labels: PhoneOtpAuthFormLabels;
};

export function PhoneOtpAuthForm({ mode, labels }: PhoneOtpAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [name, setName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function resolveSendError(message: string | undefined): string {
    if (message === PHONE_OTP_WHATSAPP_UNAVAILABLE) {
      return labels.whatsappUnavailable;
    }

    if (message === PHONE_OTP_WHATSAPP_NOT_CONFIGURED) {
      return labels.whatsappNotConfigured;
    }

    if (message === PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED) {
      return labels.whatsappRecipientNotAllowed;
    }

    if (message === PHONE_OTP_WHATSAPP_TOKEN_EXPIRED) {
      return labels.whatsappTokenExpired;
    }

    return message ?? labels.sendFailed;
  }

  function sendOtpCode(input: string, advanceStep = true) {
    const normalized = normalizePakistanPhone(input);

    if (!normalized || !isValidPakistanPhone(input)) {
      setError(labels.invalidPhone);
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
        const result = await authClient.phoneNumber.sendOtp({
          phoneNumber: normalized,
        });

        if (result.error) {
          setError(resolveSendError(result.error.message));
          return;
        }

        setPhoneNumber(normalized);
        if (advanceStep) {
          setStep("otp");
        }
        setInfo(labels.otpSentPhone);
      } catch (sendError) {
        const message =
          sendError instanceof Error ? sendError.message : undefined;
        setError(resolveSendError(message));
      }
    });
  }

  function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendOtpCode(phoneInput, true);
  }

  function handleResendOtp() {
    sendOtpCode(phoneNumber || phoneInput, false);
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
        const result = await authClient.phoneNumber.verify({
          phoneNumber,
          code: otp,
        });

        if (result.error) {
          setError(result.error.message ?? labels.verifyFailed);
          return;
        }

        if (mode === "signup" && name.trim() && result.data?.user?.id) {
          await authClient.updateUser({ name: name.trim() });
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
          id="phoneOtp"
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
            {labels.changePhone}
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? labels.sendingOtp : labels.sendOtp}
      </Button>
    </form>
  );
}
