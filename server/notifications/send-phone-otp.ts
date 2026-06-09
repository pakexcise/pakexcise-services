import "server-only";

import {
  PHONE_OTP_WHATSAPP_NOT_CONFIGURED,
  PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED,
  PHONE_OTP_WHATSAPP_TOKEN_EXPIRED,
  PHONE_OTP_WHATSAPP_UNAVAILABLE,
  PhoneOtpDeliveryError,
} from "@/lib/errors/phone-otp-errors";
import { sendWhatsAppOtp } from "@/server/notifications/send-whatsapp-otp";
import { enforceRateLimit, otpRateLimit } from "@/server/security/rate-limit";

export async function sendPhoneOtp(
  phoneNumber: string,
  code: string,
): Promise<void> {
  try {
    await enforceRateLimit(otpRateLimit, `phone:${phoneNumber}`);
  } catch (rateLimitError) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[phone-otp:dev] rate limit skipped", rateLimitError);
    } else {
      throw rateLimitError;
    }
  }

  const whatsappResult = await sendWhatsAppOtp(phoneNumber, code);

  if (whatsappResult.delivered) {
    return;
  }

  if (whatsappResult.reason === "not_on_whatsapp") {
    throw new PhoneOtpDeliveryError(
      PHONE_OTP_WHATSAPP_UNAVAILABLE,
      PHONE_OTP_WHATSAPP_UNAVAILABLE,
    );
  }

  if (whatsappResult.reason === "recipient_not_allowed") {
    throw new PhoneOtpDeliveryError(
      PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED,
      PHONE_OTP_WHATSAPP_RECIPIENT_NOT_ALLOWED,
    );
  }

  if (whatsappResult.reason === "token_error") {
    throw new PhoneOtpDeliveryError(
      PHONE_OTP_WHATSAPP_TOKEN_EXPIRED,
      PHONE_OTP_WHATSAPP_TOKEN_EXPIRED,
    );
  }

  if (whatsappResult.reason === "not_configured") {
    throw new PhoneOtpDeliveryError(
      PHONE_OTP_WHATSAPP_NOT_CONFIGURED,
      PHONE_OTP_WHATSAPP_NOT_CONFIGURED,
    );
  }

  if (
    whatsappResult.reason === "template_error" ||
    whatsappResult.reason === "network_error" ||
    whatsappResult.reason === "delivery_failed"
  ) {
    throw new PhoneOtpDeliveryError(
      PHONE_OTP_WHATSAPP_NOT_CONFIGURED,
      PHONE_OTP_WHATSAPP_NOT_CONFIGURED,
    );
  }

  throw new PhoneOtpDeliveryError(
    PHONE_OTP_WHATSAPP_UNAVAILABLE,
    PHONE_OTP_WHATSAPP_UNAVAILABLE,
  );
}
