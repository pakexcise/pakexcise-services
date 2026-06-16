"use client";

import { Suspense, useState } from "react";

import { AuthUrlErrorAlert } from "@/features/auth/components/auth-url-error-alert";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import {
  AuthMethodTabs,
  type AuthMethod,
} from "@/features/auth/components/auth-method-tabs";
import { EmailOtpAuthForm } from "@/features/auth/components/email-otp-auth-form";
import { PhoneOtpAuthForm } from "@/features/auth/components/phone-otp-auth-form";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import { useAuthPageQuery } from "@/features/auth/hooks/use-auth-page-query";
import { buildLoginUrl } from "@/features/auth/lib/auth-url";
import type { SocialProviderId } from "@/features/auth/lib/social-providers";
import { Link } from "@/i18n/navigation";

type SignupFormLabels = {
  name: string;
  email: string;
  phone: string;
  phoneHint: string;
  cnic: string;
  cnicHint: string;
  cnicVerificationNote: string;
  cnicExists: string;
  invalidCnic: string;
  password: string;
  confirmPassword: string;
  passwordHint: string;
  passwordMismatch: string;
  invalidPassword: string;
  showPassword: string;
  otp: string;
  otpHint: string;
  createAccount: string;
  creatingAccount: string;
  verifyOtp: string;
  verifyingOtp: string;
  resendOtp: string;
  changeEmail: string;
  changePhone: string;
  otpSentEmail: string;
  otpSentEmailSandbox: string;
  otpSentEmailDevConsole: string;
  sendFailed: string;
  verifyFailed: string;
  invalidEmail: string;
  invalidPhone: string;
  nameRequired: string;
  accountNotFound: string;
  accountExists: string;
  emailExists: string;
  phoneExists: string;
  googleAccountExists: string;
  signupPrompt: string;
  loginPrompt: string;
  hasAccount: string;
  loginLink: string;
  signupLink: string;
  orContinueWith: string;
  google: string;
  socialFailed: string;
  authError: string;
  staleServerAction: string;
  socialNotConfigured: string;
  methodEmail: string;
  methodPhone: string;
  signupVerifyHint: string;
};

type SignupFormProps = {
  labels: SignupFormLabels;
  socialProviders: SocialProviderId[];
  unified?: boolean;
};

function SignupFormContent({ labels, socialProviders, unified = false }: SignupFormProps) {
  const [method, setMethod] = useState<AuthMethod>("email");
  const { callbackUrl, intent } = useAuthPageQuery();
  const loginHref = buildLoginUrl({ callbackUrl, intent });

  const emailLabels = {
    name: labels.name,
    email: labels.email,
    password: labels.password,
    confirmPassword: labels.confirmPassword,
    passwordHint: labels.passwordHint,
    passwordMismatch: labels.passwordMismatch,
    invalidPassword: labels.invalidPassword,
    showPassword: labels.showPassword,
    otp: labels.otp,
    otpHint: labels.otpHint,
    createAccount: labels.createAccount,
    creatingAccount: labels.creatingAccount,
    verifyOtp: labels.verifyOtp,
    verifyingOtp: labels.verifyingOtp,
    resendOtp: labels.resendOtp,
    changeEmail: labels.changeEmail,
    otpSentEmail: labels.otpSentEmail,
    otpSentEmailSandbox: labels.otpSentEmailSandbox,
    otpSentEmailDevConsole: labels.otpSentEmailDevConsole,
    sendFailed: labels.sendFailed,
    verifyFailed: labels.verifyFailed,
    invalidEmail: labels.invalidEmail,
    nameRequired: labels.nameRequired,
    accountNotFound: labels.accountNotFound,
    accountExists: labels.accountExists,
    emailExists: labels.emailExists,
    googleAccountExists: labels.googleAccountExists,
    signupPrompt: labels.signupPrompt,
    loginPrompt: labels.loginPrompt,
    signupLink: labels.signupLink,
    loginLink: labels.loginLink,
    staleServerAction: labels.staleServerAction,
  };

  const phoneLabels = {
    name: labels.name,
    phone: labels.phone,
    phoneHint: labels.phoneHint,
    cnic: labels.cnic,
    cnicHint: labels.cnicHint,
    cnicVerificationNote: labels.cnicVerificationNote,
    cnicExists: labels.cnicExists,
    invalidCnic: labels.invalidCnic,
    password: labels.password,
    confirmPassword: labels.confirmPassword,
    passwordHint: labels.passwordHint,
    passwordMismatch: labels.passwordMismatch,
    invalidPassword: labels.invalidPassword,
    showPassword: labels.showPassword,
    createAccount: labels.createAccount,
    creatingAccount: labels.creatingAccount,
    sendFailed: labels.sendFailed,
    verifyFailed: labels.verifyFailed,
    invalidPhone: labels.invalidPhone,
    nameRequired: labels.nameRequired,
    accountNotFound: labels.accountNotFound,
    accountExists: labels.accountExists,
    phoneExists: labels.phoneExists,
    signupPrompt: labels.signupPrompt,
    loginPrompt: labels.loginPrompt,
    signupLink: labels.signupLink,
    loginLink: labels.loginLink,
    staleServerAction: labels.staleServerAction,
  };

  return (
    <div className="space-y-5">
      <AuthUrlErrorAlert
        labels={{
          authError: labels.authError,
          socialFailed: labels.socialFailed,
        }}
      />
      {socialProviders.length > 0 ? (
        <>
          <SocialAuthButtons
            providers={socialProviders}
            authMode="signup"
            labels={{
              google: labels.google,
              socialFailed: labels.socialFailed,
              notConfigured: labels.socialNotConfigured,
            }}
          />
          <AuthDivider label={labels.orContinueWith} />
        </>
      ) : null}

      <AuthMethodTabs
        value={method}
        onChange={setMethod}
        emailLabel={labels.methodEmail}
        phoneLabel={labels.methodPhone}
      />

      {method === "email" ? (
        <>
          <p className="text-xs text-muted-foreground">{labels.signupVerifyHint}</p>
          <EmailOtpAuthForm mode="signup" labels={emailLabels} />
        </>
      ) : (
        <PhoneOtpAuthForm mode="signup" labels={phoneLabels} />
      )}

      {unified ? null : (
        <p className="text-center text-sm text-muted-foreground">
          {labels.hasAccount}{" "}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            {labels.loginLink}
          </Link>
        </p>
      )}
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
