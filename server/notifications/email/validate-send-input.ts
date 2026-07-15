import "server-only";

import { z } from "zod";

import type { SendEmailInput } from "@/server/notifications/email/types";

const recipientSchema = z.string().trim().email();

export type ValidatedSendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export function validateSendEmailInput(
  input: SendEmailInput,
): ValidatedSendEmailInput {
  const parsedRecipient = recipientSchema.safeParse(input.to);

  if (!parsedRecipient.success) {
    throw new Error("Invalid recipient email address");
  }

  const subject = input.subject.trim();

  if (!subject) {
    throw new Error("Email subject is required");
  }

  return {
    to: parsedRecipient.data,
    subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
  };
}
