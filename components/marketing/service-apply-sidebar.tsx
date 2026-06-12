import { FileCheck, MapPin } from "lucide-react";

import { WhatsAppCTA } from "@/components/marketing/whatsapp-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type ServiceApplySidebarProps = {
  serviceName: string;
  regionLabel: string;
  documentCount: number;
  requiredDocumentCount: number;
  applyHref: string;
  applyLabel: string;
  whatsappLabel: string;
  whatsappPhone: string;
  whatsappMessage: string;
  documentsLabel: string;
  regionLabelTitle: string;
  ctaTitle: string;
  ctaDescription: string;
};

export function ServiceApplySidebar({
  serviceName,
  regionLabel,
  documentCount,
  requiredDocumentCount,
  applyHref,
  applyLabel,
  whatsappLabel,
  whatsappPhone,
  whatsappMessage,
  documentsLabel,
  regionLabelTitle,
  ctaTitle,
  ctaDescription,
}: ServiceApplySidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-lg">{ctaTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{ctaDescription}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href={applyHref}>{applyLabel}</Link>
          </Button>
          <WhatsAppCTA
            phoneNumber={whatsappPhone}
            message={whatsappMessage}
            label={whatsappLabel}
            placement="service_detail"
            className="h-11 w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{serviceName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {regionLabel ? (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">{regionLabelTitle}</p>
                <p>{regionLabel}</p>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-2">
            <FileCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">{documentsLabel}</p>
              <p>
                {requiredDocumentCount > 0
                  ? `${requiredDocumentCount} required`
                  : documentCount > 0
                    ? `${documentCount} listed`
                    : "None required to start"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
