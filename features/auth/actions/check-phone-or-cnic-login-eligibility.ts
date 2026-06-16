"use server";

import { checkPhoneOrCnicLoginEligibility as runCheckPhoneOrCnicLoginEligibility } from "@/features/auth/lib/otp-flow-service";
import type { AuthEligibilityResult } from "@/features/auth/types/otp-flow";

export async function checkPhoneOrCnicLoginEligibility(
  identifier: string,
): Promise<AuthEligibilityResult> {
  return runCheckPhoneOrCnicLoginEligibility(identifier);
}
