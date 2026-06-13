"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Building2, Pencil, Plus, Smartphone, Trash2, Wallet } from "lucide-react";
import type { PaymentMethodType } from "@prisma/client";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceGeneratorPaymentMethod } from "@/components/admin/InvoiceGenerator";
import { updateSentInvoiceAction } from "@/features/invoices/actions";
import type { InvoiceEditorInitialInvoice } from "@/features/invoices/lib/serialize-invoice-for-editor";
import { splitInvoiceLineItemsForEdit } from "@/features/invoices/lib/split-invoice-line-items";
import { broadcastApplicationUpdate } from "@/features/realtime/broadcast-application-update";
import { getPaymentMethodName } from "@/features/payment-methods/lib/format-payment-method";
import { cn } from "@/lib/utils";

const invoiceLineItemFormSchema = z.object({
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  amount: z.coerce.number().min(0),
  isOfficialFee: z.boolean(),
});

const invoiceEditFormSchema = z.object({
  serviceFee: z.coerce.number().min(0.01),
  officialFeeNote: z.string().optional(),
  paymentMethodIds: z.array(z.string()).min(1, "Select at least one payment method"),
  paymentInstructions: z.string().optional(),
  dueAt: z.string().optional(),
  notes: z.string().optional(),
  taxTotal: z.coerce.number().min(0),
  editNote: z.string().trim().min(3),
  lineItems: z.array(invoiceLineItemFormSchema),
});

type InvoiceEditFormValues = z.infer<typeof invoiceEditFormSchema>;

type InvoiceEditorProps = {
  invoice: InvoiceEditorInitialInvoice;
  paymentMethods: InvoiceGeneratorPaymentMethod[];
  blockReason?: "payment_uploaded" | "payment_verified" | null;
  labels: {
    edit: string;
    editing: string;
    description: string;
    serviceFee: string;
    officialFeeNote: string;
    paymentMethods: string;
    paymentMethodsHint: string;
    noPaymentMethods: string;
    paymentInstructions: string;
    paymentInstructionsHint: string;
    dueDate: string;
    notes: string;
    taxTotal: string;
    editNote: string;
    lineItems: string;
    itemLabel: string;
    itemDescription: string;
    itemAmount: string;
    officialFee: string;
    addLineItem: string;
    removeLineItem: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    bankName: string;
    blockedPaymentUploaded: string;
    blockedPaymentVerified: string;
    cancel: string;
  };
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

function formatDueDateInput(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function InvoiceEditor({
  invoice,
  paymentMethods,
  blockReason = null,
  labels,
}: InvoiceEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const splitLineItems = useMemo(
    () => splitInvoiceLineItemsForEdit(invoice.lineItems, invoice.locale),
    [invoice.lineItems, invoice.locale],
  );

  const initialPaymentMethodIds = useMemo(() => {
    const activeIds = new Set(paymentMethods.map((method) => method.id));
    const fromSnapshots = invoice.paymentMethods
      .map((method) => method.paymentMethodId)
      .filter((id): id is string => Boolean(id && activeIds.has(id)));

    if (fromSnapshots.length > 0) {
      return fromSnapshots;
    }

    return paymentMethods.length === 1 ? [paymentMethods[0]!.id] : [];
  }, [invoice.paymentMethods, paymentMethods]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceEditFormValues>({
    resolver: zodResolver(invoiceEditFormSchema),
    defaultValues: {
      serviceFee: splitLineItems.serviceFee,
      officialFeeNote: invoice.officialFeeNote ?? "",
      paymentMethodIds: initialPaymentMethodIds,
      paymentInstructions: invoice.paymentInstructions ?? "",
      dueAt: formatDueDateInput(invoice.dueAt),
      notes: invoice.notes ?? "",
      taxTotal: Number(invoice.taxTotal),
      editNote: "",
      lineItems: splitLineItems.additionalLineItems,
    },
  });

  const selectedPaymentMethodIds = useWatch({
    control,
    name: "paymentMethodIds",
    defaultValue: initialPaymentMethodIds,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  function togglePaymentMethod(id: string) {
    const current = selectedPaymentMethodIds ?? [];
    const next = current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id];
    setValue("paymentMethodIds", next, { shouldValidate: true });
  }

  function onSubmit(values: InvoiceEditFormValues) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const lineItems = values.lineItems.filter(
        (item) => item.label.trim().length > 0 && item.amount > 0,
      );

      const result = await updateSentInvoiceAction({
        invoiceId: invoice.id,
        locale: invoice.locale,
        ...values,
        lineItems,
        dueAt: values.dueAt
          ? new Date(`${values.dueAt}T12:00:00.000Z`).toISOString()
          : undefined,
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(`${labels.success} ${result.data.invoiceNumber}`);
      broadcastApplicationUpdate();
      router.refresh();
    });
  }

  if (blockReason) {
    return (
      <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
        {blockReason === "payment_uploaded"
          ? labels.blockedPaymentUploaded
          : labels.blockedPaymentVerified}
      </p>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      {!open ? (
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
          {labels.edit}
        </Button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium">{labels.editing}</h4>
            <p className="text-sm text-muted-foreground">{labels.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`serviceFee-${invoice.id}`}>{labels.serviceFee}</Label>
              <Input
                id={`serviceFee-${invoice.id}`}
                type="number"
                step="0.01"
                min="0"
                {...register("serviceFee")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`taxTotal-${invoice.id}`}>{labels.taxTotal}</Label>
              <Input
                id={`taxTotal-${invoice.id}`}
                type="number"
                step="0.01"
                min="0"
                {...register("taxTotal")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`officialFeeNote-${invoice.id}`}>
                {labels.officialFeeNote}
              </Label>
              <Textarea
                id={`officialFeeNote-${invoice.id}`}
                rows={2}
                {...register("officialFeeNote")}
              />
            </div>

            <div className="space-y-3 sm:col-span-2">
              <div>
                <Label>{labels.paymentMethods}</Label>
                <p className="text-xs text-muted-foreground">
                  {labels.paymentMethodsHint}
                </p>
              </div>

              {paymentMethods.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  {labels.noPaymentMethods}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => {
                    const Icon = methodIcon(method.type);
                    const selected =
                      selectedPaymentMethodIds?.includes(method.id) ?? false;
                    const name = getPaymentMethodName(method, invoice.locale);

                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => togglePaymentMethod(method.id)}
                        className={cn(
                          "rounded-xl border p-4 text-start text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "hover:border-primary/30 hover:bg-muted/30",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-background p-2 shadow-sm">
                            <Icon className="size-4 text-primary" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">{name}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.paymentMethodIds ? (
                <p className="text-sm text-destructive">
                  {errors.paymentMethodIds.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dueAt-${invoice.id}`}>{labels.dueDate}</Label>
              <Input id={`dueAt-${invoice.id}`} type="date" {...register("dueAt")} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`paymentInstructions-${invoice.id}`}>
                {labels.paymentInstructions}
              </Label>
              <Textarea
                id={`paymentInstructions-${invoice.id}`}
                rows={3}
                {...register("paymentInstructions")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`notes-${invoice.id}`}>{labels.notes}</Label>
              <Textarea id={`notes-${invoice.id}`} rows={2} {...register("notes")} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`editNote-${invoice.id}`}>{labels.editNote}</Label>
              <Textarea
                id={`editNote-${invoice.id}`}
                rows={2}
                {...register("editNote")}
                required
              />
              {errors.editNote ? (
                <p className="text-sm text-destructive">{errors.editNote.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>{labels.lineItems}</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({
                    label: "",
                    description: "",
                    amount: 0,
                    isOfficialFee: false,
                  })
                }
              >
                <Plus className="size-4" />
                {labels.addLineItem}
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>{labels.itemLabel}</Label>
                  <Input {...register(`lineItems.${index}.label`)} />
                </div>
                <div className="space-y-2">
                  <Label>{labels.itemAmount}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`lineItems.${index}.amount`)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{labels.itemDescription}</Label>
                  <Input {...register(`lineItems.${index}.description`)} />
                </div>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    {...register(`lineItems.${index}.isOfficialFee`)}
                    className="size-4 rounded border-input"
                  />
                  {labels.officialFee}
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                  {labels.removeLineItem}
                </Button>
              </div>
            ))}
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="text-sm text-primary" role="status">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending || paymentMethods.length === 0}>
              {isPending ? labels.submitting : labels.submit}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                setOpen(false);
                setError(null);
                setMessage(null);
              }}
            >
              {labels.cancel}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
