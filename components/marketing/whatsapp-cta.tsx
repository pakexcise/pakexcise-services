import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { Button } from "@/components/ui/button";

type WhatsAppCTAProps = {
  phoneNumber: string;
  message: string;
  label: string;
  placement?: string;
  className?: string;
};

function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppCTA({
  phoneNumber,
  message,
  label,
  placement = "page",
  className,
}: WhatsAppCTAProps) {
  return (
    <Button
      asChild
      className={className ?? "bg-[#25D366] text-white hover:bg-[#20bd5a]"}
    >
      <a
        href={buildWhatsAppUrl(phoneNumber, message)}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-event="click_whatsapp"
        data-analytics-placement={placement}
      >
        <WhatsAppIcon className="size-4" />
        {label}
      </a>
    </Button>
  );
}
