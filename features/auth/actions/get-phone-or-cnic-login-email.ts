"use server";

import { getPhoneOrCnicLoginEmail as runGetPhoneOrCnicLoginEmail } from "@/features/auth/lib/otp-flow-service";
import type { PhoneLoginIdentityResult } from "@/features/auth/types/otp-flow";

export async function getPhoneOrCnicLoginEmail(
  identifier: string,
): Promise<PhoneLoginIdentityResult> {
  return runGetPhoneOrCnicLoginEmail(identifier);
}
