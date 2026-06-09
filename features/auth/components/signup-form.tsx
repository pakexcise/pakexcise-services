"use client";

import { Suspense, useState } from "react";

import { AuthDivider } from "@/features/auth/components/auth-divider";
import {
  AuthMethodTabs,
  type AuthMethod,
} from "@/features/auth/components/auth-method-tabs";
import { EmailOtpAuthForm } from "@/features/auth/components/email-otp-auth-form";
import { PhoneOtpAuthForm } from "@/features/auth/components/phone-otp-auth-form";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import type { SocialProviderId } from "@/features/auth/lib/social-providers";
import { Link } from "@/i18n/navigation";

type SignupFormLabels = {
  name: string;
  email: string;
  phone: string;
  phoneHint: string;
  otp: string;
  otpHint: string;
  sendOtp: string;
  sendingOtp: string;
  verifyOtp: string;
  verifyingOtp: string;
  resendOtp: string;
  changeEmail: string;
  changePhone: string;
  otpSentEmail: string;
  otpSentEmailSandbox: string;
  otpSentEmailDevConsole: string;
  otpSentPhone: string;
  whatsappUnavailable: string;
  whatsappNotConfigured: string;
  whatsappRecipientNotAllowed: string;
  whatsappTokenExpired: string;
  sendFailed: string;
  verifyFailed: string;
  invalidEmail: string;
  invalidPhone: string;
  nameRequired: string;
  hasAccount: string;
  loginLink: string;
  orContinueWith: string;
  google: string;
  facebook: string;
  socialFailed: string;
  socialNotConfigured: string;
  methodEmail: string;
  methodPhone: string;
};

type SignupFormProps = {
  labels: SignupFormLabels;
  socialProviders: SocialProviderId[];
};

function SignupFormContent({ labels, socialProviders }: SignupFormProps) {
  const [method, setMethod] = useState<AuthMethod>("email");

  const otpLabels = {
    name: labels.name,
    email: labels.email,
    phone: labels.phone,
    phoneHint: labels.phoneHint,
    otp: labels.otp,
    otpHint: labels.otpHint,
    sendOtp: labels.sendOtp,
    sendingOtp: labels.sendingOtp,
    verifyOtp: labels.verifyOtp,
    verifyingOtp: labels.verifyingOtp,
    resendOtp: labels.resendOtp,
    changeEmail: labels.changeEmail,
    changePhone: labels.changePhone,
    otpSentEmail: labels.otpSentEmail,
    otpSentEmailSandbox: labels.otpSentEmailSandbox,
    otpSentEmailDevConsole: labels.otpSentEmailDevConsole,
    otpSentPhone: labels.otpSentPhone,
    whatsappUnavailable: labels.whatsappUnavailable,
    whatsappNotConfigured: labels.whatsappNotConfigured,
    whatsappRecipientNotAllowed: labels.whatsappRecipientNotAllowed,
    whatsappTokenExpired: labels.whatsappTokenExpired,
    sendFailed: labels.sendFailed,
    verifyFailed: labels.verifyFailed,
    invalidEmail: labels.invalidEmail,
    invalidPhone: labels.invalidPhone,
    nameRequired: labels.nameRequired,
  };

  return (
    <div className="space-y-5">
      <SocialAuthButtons
        providers={socialProviders}
        labels={{
          google: labels.google,
          facebook: labels.facebook,
          socialFailed: labels.socialFailed,
          notConfigured: labels.socialNotConfigured,
        }}
      />

      <AuthDivider label={labels.orContinueWith} />

      <AuthMethodTabs
        value={method}
        onChange={setMethod}
        emailLabel={labels.methodEmail}
        phoneLabel={labels.methodPhone}
      />

      {method === "email" ? (
        <EmailOtpAuthForm mode="signup" labels={otpLabels} />
      ) : (
        <PhoneOtpAuthForm mode="signup" labels={otpLabels} />
      )}

      <p className="text-center text-sm text-muted-foreground">
        {labels.hasAccount}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {labels.loginLink}
        </Link>
      </p>
    </div>
  );
}

export function SignupForm(props: SignupFormProps) {
  return (
    <Suspense fallback={null}>
      <SignupFormContent {...props} />
    </Suspense>
  );
}
