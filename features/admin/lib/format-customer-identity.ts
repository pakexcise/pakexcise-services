import "server-only";

import { isTempPhoneEmail } from "@/features/auth/lib/user-identity";
import { formatPhoneForDisplay } from "@/lib/validations/phone";

export function formatAdminCustomerEmailDisplay(input: {
  email: string;
  phone?: string | null;
  phoneNumber?: string | null;
}): string {
  if (isTempPhoneEmail(input.email)) {
    const phone = input.phoneNumber ?? input.phone;
    return phone ? formatPhoneForDisplay(phone) : "—";
  }

  return input.email;
}

export function formatAdminCustomerPhoneDisplay(input: {
  phone?: string | null;
  phoneNumber?: string | null;
}): string | null {
  const phone = input.phoneNumber ?? input.phone;
  return phone ? formatPhoneForDisplay(phone) : null;
}
