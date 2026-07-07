import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateServerEnv } = await import("./config/env.server");
    validateServerEnv();

    const { isSesConfigured } = await import(
      "./server/notifications/ses/config"
    );
    const appEnv = process.env.APP_ENV ?? "development";

    if (
      (appEnv === "production" || appEnv === "staging") &&
      !isSesConfigured()
    ) {
      console.error(
        "[email:ses] AWS SES credentials are missing. OTP and transactional email will fail.",
      );
    }

    await import("./sentry.server.config");
    const { warmDatabaseConnection } = await import("./server/db/warm-connection");
    await warmDatabaseConnection();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
