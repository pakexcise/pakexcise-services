export const PHONE_OTP_WHATSAPP_UNAVAILABLE = "PHONE_OTP_WHATSAPP_UNAVAILABLE";
export const PHONE_OTP_WHATSAPP_NOT_CONFIGURED =
  "PHONE_OTP_WHATSAPP_NOT_CONFIGURED";
export const PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED =
  "PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED";
export const PHONE_OTP_WHATSAPP_TOKEN_EXPIRED =
  "PHONE_OTP_WHATSAPP_TOKEN_EXPIRED";

export type PhoneOtpErrorCode =
  | typeof PHONE_OTP_WHATSAPP_UNAVAILABLE
  | typeof PHONE_OTP_WHATSAPP_NOT_CONFIGURED
  | typeof PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED
  | typeof PHONE_OTP_WHATSAPP_TOKEN_EXPIRED;

export class PhoneOtpDeliveryError extends Error {
  readonly code: PhoneOtpErrorCode;

  constructor(code: PhoneOtpErrorCode, message: string) {
    super(message);
    this.name = "PhoneOtpDeliveryError";
    this.code = code;
  }
}

export function isPhoneOtpDeliveryError(
  error: unknown,
): error is PhoneOtpDeliveryError {
  return error instanceof PhoneOtpDeliveryError;
}

export function isWhatsAppUnavailableError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message === PHONE_OTP_WHATSAPP_UNAVAILABLE ||
      error.message.includes("not on WhatsApp")
    );
  }

  return false;
}
