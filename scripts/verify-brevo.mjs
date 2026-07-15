const apiKey = process.env.BREVO_API_KEY?.trim();
const fromEmail =
  process.env.BREVO_FROM_EMAIL?.trim() || "noreply@pakexcise.com";
const fromName = process.env.BREVO_FROM_NAME?.trim() || "PakExcise.com";
const toEmail = process.argv[2]?.trim();

if (!apiKey) {
  console.error("Missing BREVO_API_KEY. Set it in .env or .env.production.");
  process.exit(1);
}

if (!toEmail) {
  console.error("Usage: node scripts/verify-brevo.mjs recipient@example.com");
  process.exit(1);
}

const replyTo =
  process.env.BREVO_REPLY_TO_EMAIL?.trim() || "info@pakexcise.com";

try {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail }],
      replyTo: { email: replyTo },
      subject: "PakExcise Brevo test",
      textContent:
        "If you received this, Brevo is configured correctly for PakExcise.",
      htmlContent:
        "<p>If you received this, Brevo is configured correctly for PakExcise.</p>",
    }),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) {
        detail = body.message;
      }
    } catch {
      // ignore parse errors
    }

    console.error("Brevo test failed:", detail);
    process.exit(1);
  }

  console.log(`Brevo test email sent from ${fromEmail} to ${toEmail}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Brevo test failed:", message);
  process.exit(1);
}
