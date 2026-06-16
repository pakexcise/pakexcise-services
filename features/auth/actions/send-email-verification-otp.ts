"use server";

import { sendEmailVerificationOtp as runSendEmailVerificationOtp } from "@/features/auth/lib/otp-flow-service";
import type { EmailSignupInitResult } from "@/features/auth/types/otp-flow";

export async function sendEmailVerificationOtp(
  email: string,
): Promise<EmailSignupInitResult> {
  return runSendEmailVerificationOtp(email);
}
