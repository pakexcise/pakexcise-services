"use server";

import { checkPhoneSignupEligibility as runCheckPhoneSignupEligibility } from "@/features/auth/lib/otp-flow-service";
import type { AuthEligibilityResult } from "@/features/auth/types/otp-flow";

export async function checkPhoneSignupEligibility(
  phoneInput: string,
  cnicInput: string,
): Promise<AuthEligibilityResult> {
  return runCheckPhoneSignupEligibility(phoneInput, cnicInput);
}
