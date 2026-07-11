import {
  Clock,
  Mail,
  Phone,
} from "lucide-react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { buildTelHref } from "@/lib/contact/build-tel-href";
import { cn } from "@/lib/utils";

type ContactMethodCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  variant: "whatsapp" | "call" | "email" | "channel" | "hours";
  value?: string;
  className?: string;
};

function ContactMethodIcon({ variant }: { variant: ContactMethodCardProps["variant"] }) {
  switch (variant) {
    case "whatsapp":
      return <WhatsAppIcon className="size-5 text-[#25D366]" />;
    case "call":
      return <Phone className="size-5 text-primary" aria-hidden="true" />;
    case "email":
      return <Mail className="size-5 text-primary" aria-hidden="true" />;
    case "channel":
      return <WhatsAppIcon className="size-5 text-[#25D366]" />;
    case "hours":
      return <Clock className="size-5 text-primary" aria-hidden="true" />;
  }
}

export function ContactMethodCard({
  title,
  description,
  buttonLabel,
  href,
  variant,
  value,
  className,
}: ContactMethodCardProps) {
  const isWhatsApp = variant === "whatsapp" || variant === "channel";
  const isHours = variant === "hours";

  return (
    <Card
      className={cn(
        "shadow-sm",
        isWhatsApp && "border-[#25D366]/30 bg-[#25D366]/5",
        className,
      )}
    >
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center gap-2">
          <ContactMethodIcon variant={variant} />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
        {value ? (
          <p className="text-sm font-medium text-foreground">{value}</p>
        ) : null}
      </CardHeader>
      {!isHours ? (
        <CardContent>
          <Button
            asChild
            className={cn(
              "w-full",
              isWhatsApp && "bg-[#25D366] text-white hover:bg-[#20bd5a]",
            )}
            variant={isWhatsApp ? "default" : "outline"}
          >
            <a
              href={href}
              target={variant === "email" ? undefined : "_blank"}
              rel={variant === "email" ? undefined : "noopener noreferrer"}
              data-analytics-event={isWhatsApp ? "click_whatsapp" : undefined}
              data-analytics-placement={`contact_${variant}`}
            >
              {isWhatsApp ? (
                <WhatsAppIcon className="size-4" />
              ) : variant === "call" ? (
                <Phone className="size-4" aria-hidden="true" />
              ) : (
                <Mail className="size-4" aria-hidden="true" />
              )}
              {buttonLabel}
            </a>
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}

type ContactMethodsSidebarProps = {
  phoneNumber: string;
  whatsappNumber: string;
  supportEmail: string;
  supportHours: string;
  supportDays: string;
  whatsappChannelUrl: string;
  whatsappPrefillMessage: string;
  whatsappCard: {
    title: string;
    description: string;
    buttonLabel: string;
    isActive: boolean;
  };
  callCard: {
    title: string;
    description: string;
    buttonLabel: string;
    isActive: boolean;
  };
  emailCard: {
    title: string;
    description: string;
    buttonLabel: string;
    isActive: boolean;
  };
  whatsappChannelCard: {
    title: string;
    description: string;
    buttonLabel: string;
    isActive: boolean;
  };
  supportHoursCard: {
    title: string;
    isActive: boolean;
  };
};

export function ContactMethodsSidebar({
  phoneNumber,
  whatsappNumber,
  supportEmail,
  supportHours,
  supportDays,
  whatsappChannelUrl,
  whatsappPrefillMessage,
  whatsappCard,
  callCard,
  emailCard,
  whatsappChannelCard,
  supportHoursCard,
}: ContactMethodsSidebarProps) {
  const whatsappHref = buildWhatsAppUrl(whatsappNumber, whatsappPrefillMessage);
  const callHref = buildTelHref(phoneNumber);
  const emailHref = `mailto:${supportEmail}`;

  return (
    <div className="space-y-4">
      {whatsappCard.isActive ? (
        <ContactMethodCard
          title={whatsappCard.title}
          description={whatsappCard.description}
          buttonLabel={whatsappCard.buttonLabel}
          href={whatsappHref}
          variant="whatsapp"
        />
      ) : null}

      {callCard.isActive ? (
        <ContactMethodCard
          title={callCard.title}
          description={callCard.description}
          buttonLabel={callCard.buttonLabel}
          href={callHref}
          variant="call"
        />
      ) : null}

      {emailCard.isActive ? (
        <ContactMethodCard
          title={emailCard.title}
          description={emailCard.description}
          buttonLabel={emailCard.buttonLabel}
          href={emailHref}
          variant="email"
        />
      ) : null}

      {whatsappChannelCard.isActive ? (
        <ContactMethodCard
          title={whatsappChannelCard.title}
          description={whatsappChannelCard.description}
          buttonLabel={whatsappChannelCard.buttonLabel}
          href={whatsappChannelUrl}
          variant="channel"
        />
      ) : null}

      {supportHoursCard.isActive ? (
        <ContactMethodCard
          title={supportHoursCard.title}
          description={supportDays}
          buttonLabel=""
          href="#"
          variant="hours"
          value={supportHours}
        />
      ) : null}
    </div>
  );
}
