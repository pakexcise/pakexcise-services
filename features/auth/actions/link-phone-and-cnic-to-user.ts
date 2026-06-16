"use server";

import { linkPhoneAndCnicToUser as runLinkPhoneAndCnicToUser } from "@/features/auth/lib/otp-flow-service";
import type { LinkPhoneAndCnicResult } from "@/features/auth/types/otp-flow";

export async function linkPhoneAndCnicToUser(
  phoneInput: string,
  email: string,
  cnicInput: string,
): Promise<LinkPhoneAndCnicResult> {
  return runLinkPhoneAndCnicToUser(phoneInput, email, cnicInput);
}
