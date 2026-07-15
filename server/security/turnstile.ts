import "server-only";

type TurnstileResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!token.trim()) {
    return false;
  }

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as TurnstileResponse;
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    const expectedHostname = configuredAppUrl
      ? new URL(configuredAppUrl).hostname
      : null;

    return (
      result.success === true &&
      result.action === "review_submit" &&
      (!expectedHostname || result.hostname === expectedHostname)
    );
  } catch {
    return false;
  }
}
