"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAndSendInvoiceAction } from "@/features/invoices/actions";
const invoiceLineItemFormSchema = z.object({
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  amount: z.coerce.number().min(0),
  isOfficialFee: z.boolean(),
});

const invoiceFormSchema = z.object({
  serviceFee: z.coerce.number().min(0.01),
  officialFeeNote: z.string().optional(),
  paymentMethod: z.string().trim().min(1),
  paymentInstructions: z.string().trim().min(1),
  dueAt: z.string().optional(),
  notes: z.string().optional(),
  taxTotal: z.coerce.number().min(0),
  statusNote: z.string().trim().min(3),
  lineItems: z.array(invoiceLineItemFormSchema),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

type InvoiceGeneratorProps = {
  applicationId: string;
  locale: "en" | "ur";
  labels: {
    title: string;
    description: string;
    serviceFee: string;
    officialFeeNote: string;
    paymentMethod: string;
    paymentInstructions: string;
    dueDate: string;
    notes: string;
    taxTotal: string;
    statusNote: string;
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
  };
};

export function InvoiceGenerator({
  applicationId,
  locale,
  labels,
}: InvoiceGeneratorProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      serviceFee: 0,
      taxTotal: 0,
      lineItems: [],
      statusNote: "",
      paymentMethod: "",
      paymentInstructions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  function onSubmit(values: InvoiceFormValues) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const lineItems = values.lineItems.filter(
        (item) => item.label.trim().length > 0 && item.amount > 0,
      );

      const result = await createAndSendInvoiceAction({
        applicationId,
        locale,
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
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold">{labels.title}</h3>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="serviceFee">{labels.serviceFee}</Label>
          <Input
            id="serviceFee"
            type="number"
            step="0.01"
            min="0"
            {...register("serviceFee")}
          />
          {errors.serviceFee ? (
            <p className="text-sm text-destructive">{errors.serviceFee.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxTotal">{labels.taxTotal}</Label>
          <Input
            id="taxTotal"
            type="number"
            step="0.01"
            min="0"
            {...register("taxTotal")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="officialFeeNote">{labels.officialFeeNote}</Label>
          <Textarea id="officialFeeNote" rows={2} {...register("officialFeeNote")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">{labels.paymentMethod}</Label>
          <Input id="paymentMethod" {...register("paymentMethod")} />
          {errors.paymentMethod ? (
            <p className="text-sm text-destructive">
              {errors.paymentMethod.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueAt">{labels.dueDate}</Label>
          <Input id="dueAt" type="date" {...register("dueAt")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="paymentInstructions">{labels.paymentInstructions}</Label>
          <Textarea
            id="paymentInstructions"
            rows={3}
            {...register("paymentInstructions")}
          />
          {errors.paymentInstructions ? (
            <p className="text-sm text-destructive">
              {errors.paymentInstructions.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">{labels.notes}</Label>
          <Textarea id="notes" rows={2} {...register("notes")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="statusNote">{labels.statusNote}</Label>
          <Textarea id="statusNote" rows={2} {...register("statusNote")} required />
          {errors.statusNote ? (
            <p className="text-sm text-destructive">{errors.statusNote.message}</p>
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

      <Button type="submit" disabled={isPending}>
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
