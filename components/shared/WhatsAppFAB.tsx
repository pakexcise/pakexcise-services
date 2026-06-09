"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type WhatsAppFABProps = {
  phoneNumber?: string | null;
  message?: string | null;
  className?: string;
};

function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppFAB({
  phoneNumber,
  message,
  className,
}: WhatsAppFABProps) {
  const t = useTranslations("common");
  const resolvedPhone = phoneNumber ?? siteConfig.contact.whatsapp;
  const resolvedMessage = message ?? siteConfig.contact.whatsappMessage;

  if (!resolvedPhone) {
    return null;
  }

  return (
    <a
      href={buildWhatsAppUrl(resolvedPhone, resolvedMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappHelp")}
      data-analytics-event="click_whatsapp"
      data-analytics-placement="fab"
      className={cn(
        "fixed end-4 z-50 inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-14",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <MessageCircle className="size-7" aria-hidden="true" />
      <span className="sr-only">{t("whatsappHelp")}</span>
    </a>
  );
}
