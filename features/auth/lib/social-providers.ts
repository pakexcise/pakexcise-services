import "server-only";

export type SocialProviderId = "google" | "facebook";

export function getEnabledSocialProviders(): SocialProviderId[] {
  const providers: SocialProviderId[] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push("google");
  }

  const facebookClientId =
    process.env.FACEBOOK_CLIENT_ID ?? process.env.META_APP_ID;
  const facebookClientSecret =
    process.env.FACEBOOK_CLIENT_SECRET ?? process.env.META_APP_SECRET;

  if (facebookClientId && facebookClientSecret) {
    providers.push("facebook");
  }

  return providers;
}

export function isSocialAuthConfigured(): boolean {
  return getEnabledSocialProviders().length > 0;
}
