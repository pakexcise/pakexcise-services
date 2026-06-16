"use server";

import { checkEmailAuthEligibility as runCheckEmailAuthEligibility } from "@/features/auth/lib/otp-flow-service";
import type { AuthEligibilityResult } from "@/features/auth/types/otp-flow";

export async function checkEmailAuthEligibility(
  email: string,
  mode: "login" | "signup",
): Promise<AuthEligibilityResult> {
  return runCheckEmailAuthEligibility(email, mode);
}
