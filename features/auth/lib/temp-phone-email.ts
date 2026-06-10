export function getTempPhoneEmail(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  return `phone+${digits}@otp.pakexcise.com`;
}
