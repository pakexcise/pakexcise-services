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
import { buildSignupUrl } from "@/features/auth/lib/auth-url";
import type { SocialProviderId } from "@/features/auth/lib/social-providers";
import type { Route } from "next";
import Link from "next/link";

type LoginFormLabels = {
  email: string;
  phone: string;
  phoneOrCnic: string;
  phoneHint: string;
  phoneLoginHint: string;
  phoneLoginPlaceholder: string;
  password: string;
  passwordHint: string;
  invalidPassword: string;
  showPassword: string;
  otp: string;
  otpHint: string;
  signIn: string;
  signingIn: string;
  verifyOtp: string;
  verifyingOtp: string;
  resendOtp: string;
  changeEmail: string;
  otpSentEmail: string;
  otpSentEmailSandbox: string;
  otpSentEmailDevConsole: string;
  sendFailed: string;
  verifyFailed: string;
  signInFailed: string;
  invalidEmail: string;
  invalidPhone: string;
  invalidIdentifier: string;
  accountNotFound: string;
  phoneAccountNotFound: string;
  accountExists: string;
  emailExists: string;
  emailNotVerified: string;
  phoneExists: string;
  googleAccountExists: string;
  signupPrompt: string;
  loginPrompt: string;
  noAccount: string;
  signupLink: string;
  loginLink: string;
  orContinueWith: string;
  google: string;
  socialFailed: string;
  socialNotConfigured: string;
  methodEmail: string;
  methodPhone: string;
  forgotPassword: string;
  authError: string;
  staleServerAction: string;
};

type LoginFormProps = {
  labels: LoginFormLabels;
  socialProviders: SocialProviderId[];
  unified?: boolean;
};

function LoginFormContent({ labels, socialProviders, unified = false }: LoginFormProps) {
  const [method, setMethod] = useState<AuthMethod>("email");
  const { callbackUrl, intent } = useAuthPageQuery();
  const signupHref = buildSignupUrl({ callbackUrl, intent });

  const emailLabels = {
    email: labels.email,
    password: labels.password,
    passwordHint: labels.passwordHint,
    invalidPassword: labels.invalidPassword,
    showPassword: labels.showPassword,
    otp: labels.otp,
    otpHint: labels.otpHint,
    signIn: labels.signIn,
    signingIn: labels.signingIn,
    verifyOtp: labels.verifyOtp,
    verifyingOtp: labels.verifyingOtp,
    resendOtp: labels.resendOtp,
    changeEmail: labels.changeEmail,
    otpSentEmail: labels.otpSentEmail,
    otpSentEmailSandbox: labels.otpSentEmailSandbox,
    otpSentEmailDevConsole: labels.otpSentEmailDevConsole,
    sendFailed: labels.sendFailed,
    verifyFailed: labels.verifyFailed,
    signInFailed: labels.signInFailed,
    invalidEmail: labels.invalidEmail,
    accountNotFound: labels.accountNotFound,
    accountExists: labels.accountExists,
    emailExists: labels.emailExists,
    emailNotVerified: labels.emailNotVerified,
    googleAccountExists: labels.googleAccountExists,
    signupPrompt: labels.signupPrompt,
    loginPrompt: labels.loginPrompt,
    signupLink: labels.signupLink,
    loginLink: labels.loginLink,
    staleServerAction: labels.staleServerAction,
  };

  const phoneLabels = {
    phone: labels.phone,
    phoneOrCnic: labels.phoneOrCnic,
    phoneHint: labels.phoneHint,
    phoneLoginHint: labels.phoneLoginHint,
    phoneLoginPlaceholder: labels.phoneLoginPlaceholder,
    password: labels.password,
    invalidPassword: labels.invalidPassword,
    showPassword: labels.showPassword,
    signIn: labels.signIn,
    signingIn: labels.signingIn,
    sendFailed: labels.sendFailed,
    verifyFailed: labels.verifyFailed,
    invalidPhone: labels.invalidPhone,
    invalidIdentifier: labels.invalidIdentifier,
    signInFailed: labels.signInFailed,
    accountNotFound: labels.phoneAccountNotFound,
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
            authMode="login"
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
        <div className="space-y-3">
          <EmailOtpAuthForm mode="login" labels={emailLabels} />
          <p className="text-center text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:underline"
            >
              {labels.forgotPassword}
            </Link>
          </p>
        </div>
      ) : (
        <PhoneOtpAuthForm mode="login" labels={phoneLabels} />
      )}

      {unified ? null : (
        <p className="text-center text-sm text-muted-foreground">
          {labels.noAccount}{" "}
          <Link href={signupHref as Route} className="font-medium text-primary hover:underline">
            {labels.signupLink}
          </Link>
        </p>
      )}
    </div>
  );
}

export function LoginForm(props: LoginFormProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">{props.labels.signingIn}</p>
      }
    >
      <LoginFormContent {...props} />
    </Suspense>
  );
}
