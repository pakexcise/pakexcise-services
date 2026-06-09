import "server-only";

import type { FacebookProfile } from "better-auth/social-providers";

export type FacebookSocialProviderConfig = {
  clientId: string;
  clientSecret: string;
  disableDefaultScope: true;
  scope: ["public_profile"];
  fields: ["id", "name", "picture"];
  configId?: string;
  mapProfileToUser: (profile: FacebookProfile) => {
    email: string;
    emailVerified: boolean;
    name?: string;
    image?: string;
  };
};

function buildFacebookFallbackEmail(facebookUserId: string): string {
  return `facebook+${facebookUserId}@oauth.pakexcise.com`;
}

export function getFacebookSocialProvider():
  | FacebookSocialProviderConfig
  | undefined {
  const clientId = trimEnv(
    process.env.FACEBOOK_CLIENT_ID ?? process.env.META_APP_ID,
  );
  const clientSecret = trimEnv(
    process.env.FACEBOOK_CLIENT_SECRET ?? process.env.META_APP_SECRET,
  );
  const configId = trimEnv(process.env.FACEBOOK_LOGIN_CONFIG_ID);

  if (!clientId || !clientSecret) {
    return undefined;
  }

  return {
    clientId,
    clientSecret,
    // Meta rejects `email` scope until the app has Facebook Login + email permission approved.
    disableDefaultScope: true,
    scope: ["public_profile"],
    fields: ["id", "name", "picture"],
    ...(configId ? { configId } : {}),
    mapProfileToUser(profile) {
      const email = profile.email?.trim().toLowerCase();

      return {
        email: email || buildFacebookFallbackEmail(profile.id),
        emailVerified: Boolean(email),
        name: profile.name,
        image: profile.picture?.data?.url,
      };
    },
  };
}

function trimEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}
