export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { channel: "direct"; provider: "brevo" | "ses" }
  | { channel: "dev_console" }
  | {
      channel: "sandbox_forward";
      provider: "ses";
      requestedFor: string;
      forwardedTo: string;
    };
