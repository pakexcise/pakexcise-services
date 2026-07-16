import "server-only";

import { render } from "@react-email/render";

import { getEmailBranding } from "@/features/notifications/lib/email-branding";
import { SubmissionConfirmationEmail } from "@/features/notifications/templates/emails/submission-confirmation-email";
import { sendTransactionalEmail } from "@/server/notifications/send-email";

export async function sendFormSubmissionConfirmation(input: {
  to: string;
  customerName: string;
  referenceId: string;
  submissionLabel: string;
}): Promise<void> {
  const branding = await getEmailBranding();
  const html = await render(
    SubmissionConfirmationEmail({
      branding,
      customerName: input.customerName,
      referenceId: input.referenceId,
      submissionLabel: input.submissionLabel,
    }),
  );

  await sendTransactionalEmail({
    to: input.to,
    subject: `${input.submissionLabel} received — ${input.referenceId}`,
    text: [
      `Hello ${input.customerName},`,
      `We received your ${input.submissionLabel.toLowerCase()}.`,
      `Reference number: ${input.referenceId}`,
      "Our team will review it and contact you if more information is needed.",
      branding.disclaimer,
    ].join("\n\n"),
    html,
  });
}
