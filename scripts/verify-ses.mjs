import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";

const region = process.env.AWS_SES_REGION?.trim() || "us-east-1";
const accessKeyId =
  process.env.AWS_SES_ACCESS_KEY_ID?.trim() ||
  process.env.AWS_ACCESS_KEY_ID?.trim();
const secretAccessKey =
  process.env.AWS_SES_SECRET_ACCESS_KEY?.trim() ||
  process.env.AWS_SECRET_ACCESS_KEY?.trim();
const fromEmail =
  process.env.SES_FROM_EMAIL?.trim() || "noreply@pakexcise.com";
const toEmail = process.argv[2]?.trim();

if (!accessKeyId || !secretAccessKey) {
  console.error(
    "Missing AWS SES credentials. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
  );
  process.exit(1);
}

if (!toEmail) {
  console.error("Usage: node scripts/verify-ses.mjs recipient@example.com");
  process.exit(1);
}

const client = new SESv2Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

try {
  await client.send(
    new SendEmailCommand({
      FromEmailAddress: fromEmail,
      Destination: { ToAddresses: [toEmail] },
      Content: {
        Simple: {
          Subject: { Data: "PakExcise SES test", Charset: "UTF-8" },
          Body: {
            Text: {
              Data: "If you received this, AWS SES is configured correctly.",
              Charset: "UTF-8",
            },
          },
        },
      },
    }),
  );

  console.log(`SES test email sent from ${fromEmail} to ${toEmail}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("SES test failed:", message);

  const forwardTo = process.env.SES_SANDBOX_FORWARD_TO?.trim();
  const isSandbox =
    message.toLowerCase().includes("not verified") ||
    message.toLowerCase().includes("sandbox");

  if (isSandbox) {
    console.error("");
    console.error("AWS SES is in sandbox mode.");
    console.error("Option A: Verify this email in SES (us-east-1) → Identities → Create identity.");
    console.error("Option B: Request SES production access in the AWS console.");
    if (forwardTo) {
      console.error(
        `Option C (staging): OTPs forward to ${forwardTo} when SES_SANDBOX_FORWARD_TO is set.`,
      );
    } else if (process.env.APP_ENV === "staging") {
      console.error(
        "Option C (staging): set SES_SANDBOX_FORWARD_TO=pakexcise@gmail.com in .env",
      );
    }
  }

  process.exit(1);
}
