import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getPublicAppUrl } from "@/config/env.shared";

export const authClient = createAuthClient({
  baseURL: getPublicAppUrl(),
  plugins: [emailOTPClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  forgetPassword,
  resetPassword,
} = authClient;
