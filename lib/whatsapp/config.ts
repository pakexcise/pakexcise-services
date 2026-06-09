export type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string | null;
  apiVersion: string;
  templateName: string;
  templateLanguage: string;
  templateMode: "authentication" | "utility" | "plain";
  templateParamCount: number;
  devFallbackOnError: boolean;
};

function trimEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const accessToken = trimEnv(process.env.WHATSAPP_ACCESS_TOKEN);
  const phoneNumberId = trimEnv(process.env.WHATSAPP_PHONE_NUMBER_ID);

  if (!accessToken || !phoneNumberId) {
    return null;
  }

  const mode = trimEnv(process.env.WHATSAPP_OTP_TEMPLATE_MODE);
  const templateMode: WhatsAppConfig["templateMode"] =
    mode === "plain" || mode === "utility" || mode === "authentication"
      ? mode
      : "authentication";

  return {
    accessToken,
    phoneNumberId,
    businessAccountId: trimEnv(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) || null,
    apiVersion: trimEnv(process.env.WHATSAPP_API_VERSION) || "v25.0",
    templateName: trimEnv(process.env.WHATSAPP_OTP_TEMPLATE_NAME) || "pakexcise_otp",
    templateLanguage: trimEnv(process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE) || "en_US",
    templateMode,
    templateParamCount: Number.parseInt(
      trimEnv(process.env.WHATSAPP_OTP_TEMPLATE_PARAM_COUNT) || "1",
      10,
    ),
    devFallbackOnError:
      process.env.NODE_ENV === "development" &&
      trimEnv(process.env.WHATSAPP_DEV_FALLBACK_ON_ERROR) !== "false",
  };
}

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppConfig() !== null;
}
