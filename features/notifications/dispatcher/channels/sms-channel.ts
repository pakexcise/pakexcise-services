import "server-only";

export type SmsChannelResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Twilio SMS placeholder — wire TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
 */
export async function sendSmsNotification(input: {
  phone: string;
  text: string;
}): Promise<SmsChannelResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!accountSid || !authToken || !fromNumber) {
    if (process.env.NODE_ENV === "development") {
      console.info("[sms-notification:dev]", {
        phone: input.phone.replace(/\d(?=\d{4})/g, "*"),
        text: input.text,
      });
      return { ok: true };
    }

    return { ok: false, error: "twilio_not_configured" };
  }

  const to = input.phone.replace(/\D/g, "");
  const body = new URLSearchParams({
    To: to.startsWith("+") ? to : `+${to}`,
    From: fromNumber,
    Body: input.text,
  });

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      },
    );

    if (response.ok) {
      return { ok: true };
    }

    const raw = await response.text();
    return { ok: false, error: raw.slice(0, 300) || "twilio_send_failed" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "twilio_network_error";
    return { ok: false, error: message };
  }
}
