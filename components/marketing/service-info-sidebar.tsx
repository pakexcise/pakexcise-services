import { FileCheck, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ServiceInfoSidebarProps = {
  serviceName: string;
  regionLabel: string;
  documentCount: number;
  requiredDocumentCount: number;
  documentsLabel: string;
  regionLabelTitle: string;
};

export function ServiceInfoSidebar({
  serviceName,
  regionLabel,
  documentCount,
  requiredDocumentCount,
  documentsLabel,
  regionLabelTitle,
}: ServiceInfoSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
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
