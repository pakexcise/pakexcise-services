import type { PaymentMethodType } from "@prisma/client";
import { Building2, Smartphone, Wallet } from "lucide-react";

import {
  formatPaymentMethodDetails,
  type PaymentMethodDisplayFields,
  type PaymentMethodDisplayLabels,
} from "@/features/payment-methods/lib/format-payment-method";
import { cn } from "@/lib/utils";

export type InvoicePaymentMethodView = PaymentMethodDisplayFields & {
  id: string;
  code: string;
  qrCodeUrl?: string | null;
};

type InvoicePaymentMethodsDisplayProps = {
  methods: InvoicePaymentMethodView[];
  locale: "en" | "ur";
  labels: PaymentMethodDisplayLabels & {
    title: string;
    empty?: string;
    scanQr?: string;
  };
  className?: string;
};

function methodIcon(type: PaymentMethodType) {
  switch (type) {
    case "BANK_TRANSFER":
      return Building2;
    case "JAZZCASH":
    case "EASYPAISA":
    case "NAYAPAY":
    case "SADAPAY":
      return Smartphone;
    default:
      return Wallet;
  }
}

export function InvoicePaymentMethodsDisplay({
  methods,
  locale,
  labels,
  className,
}: InvoicePaymentMethodsDisplayProps) {
  if (methods.length === 0) {
    return labels.empty ? (
      <p className={cn("text-sm text-muted-foreground", className)}>{labels.empty}</p>
    ) : null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">{labels.title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map((method) => {
          const Icon = methodIcon(method.type);
          const lines = formatPaymentMethodDetails(method, locale, labels);

          return (
            <div
              key={method.id}
              className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-background p-2 shadow-sm">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  {lines.map((line, index) => (
                    <p
                      key={`${method.id}-${index}`}
                      className={cn(
                        index === 0
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                        index > 0 && "break-all",
                      )}
                    >
                      {line}
                    </p>
                  ))}
                  {method.qrCodeUrl ? (
                    <div className="pt-3">
                      {labels.scanQr ? (
                        <p className="mb-2 text-xs text-muted-foreground">
                          {labels.scanQr}
                        </p>
                      ) : null}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={method.qrCodeUrl}
                        alt=""
                        className="mx-auto max-h-80 w-auto max-w-full object-contain"
                        width={512}
                        height={512}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
