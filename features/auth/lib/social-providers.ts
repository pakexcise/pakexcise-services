import "server-only";

export type SocialProviderId = "google";

export function getEnabledSocialProviders(): SocialProviderId[] {
  const providers: SocialProviderId[] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push("google");
  }

  return providers;
}

export function isSocialAuthConfigured(): boolean {
  return getEnabledSocialProviders().length > 0;
}
