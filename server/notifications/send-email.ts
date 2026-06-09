import "server-only";

import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type SendEmailResult =
  | { channel: "direct" }
  | { channel: "sandbox_forward"; forwardedTo: string }
  | { channel: "dev_console" };

function getSandboxOwnerEmail(): string {
  return (
    process.env.RESEND_SANDBOX_OWNER_EMAIL?.trim().toLowerCase() ??
    "pakexcise@gmail.com"
  );
}

function isResendSandboxRestriction(message: string): boolean {
  return message.toLowerCase().includes("testing emails to your own email");
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "notifications@pakexcise.com";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", {
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
      return { channel: "dev_console" };
    }

    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html ?? `<p>${input.text}</p>`,
  });

  if (!error) {
    return { channel: "direct" };
  }

  const message = error.message ?? "Email delivery failed";
  const sandboxOwner = getSandboxOwnerEmail();
  const recipient = input.to.trim().toLowerCase();

  if (
    isResendSandboxRestriction(message) &&
    recipient !== sandboxOwner
  ) {
    const { error: forwardError } = await resend.emails.send({
      from,
      to: sandboxOwner,
      subject: `[PakExcise Dev OTP] Code for ${input.to}`,
      text: [
        `A verification code was requested for: ${input.to}`,
        "",
        input.text,
        "",
        "Resend test mode only delivers to your account email. Check this inbox for the OTP while testing locally.",
      ].join("\n"),
      html: `
        <p>A verification code was requested for: <strong>${input.to}</strong></p>
        ${input.html ?? `<p>${input.text}</p>`}
        <p><small>Resend test mode only delivers to your account email during local development.</small></p>
      `,
    });

    if (!forwardError) {
      console.info("[email:sandbox-forward]", {
        requestedFor: input.to,
        forwardedTo: sandboxOwner,
      });
      return { channel: "sandbox_forward", forwardedTo: sandboxOwner };
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[email:dev:fallback]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
      resendError: message,
    });
    return { channel: "dev_console" };
  }

  throw new Error(message);
}
