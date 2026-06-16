"use client";

import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type WhatsAppFABProps = {
  phoneNumber?: string | null;
  message?: string | null;
  ariaLabel: string;
  position?: "bottom-right" | "bottom-left";
  className?: string;
};

function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppFAB({
  phoneNumber,
  message,
  ariaLabel,
  position = "bottom-right",
  className,
}: WhatsAppFABProps) {
  const resolvedPhone = phoneNumber?.trim();
  const resolvedMessage = message?.trim() ?? "";

  if (!resolvedPhone) {
    return null;
  }

  return (
    <a
      href={buildWhatsAppUrl(resolvedPhone, resolvedMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      data-analytics-event="click_whatsapp"
      data-analytics-placement="fab"
      className={cn(
        "fixed z-50 inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-14",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        position === "bottom-left" ? "start-4" : "end-4",
        className,
      )}
    >
      <MessageCircle className="size-7" aria-hidden="true" />
      <span className="sr-only">{ariaLabel}</span>
    </a>
  );
}
