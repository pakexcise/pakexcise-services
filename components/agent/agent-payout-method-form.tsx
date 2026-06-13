"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateAgentPayoutMethodAction } from "@/features/agents/actions/payout-method";

const payoutMethodFormSchema = z.object({
  payoutMethodType: z.enum([
    "BANK_TRANSFER",
    "JAZZCASH",
    "EASYPAISA",
    "NAYAPAY",
    "SADAPAY",
    "OTHER",
  ]),
  payoutAccountTitle: z.string().trim().min(2).max(120),
  payoutAccountNumber: z.string().trim().max(64).optional(),
  payoutIban: z.string().trim().max(34).optional(),
  payoutBankName: z.string().trim().max(120).optional(),
  payoutWalletNumber: z.string().trim().max(20).optional(),
  payoutNotes: z.string().trim().max(2000).optional(),
});

type PayoutMethodFormValues = z.infer<typeof payoutMethodFormSchema>;

type AgentPayoutMethodFormProps = {
  initialValues: PayoutMethodFormValues;
  labels: Record<string, string>;
};

const WALLET_TYPES = new Set(["JAZZCASH", "EASYPAISA", "NAYAPAY", "SADAPAY"]);

export function AgentPayoutMethodForm({
  initialValues,
  labels,
}: AgentPayoutMethodFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PayoutMethodFormValues>({
    resolver: zodResolver(payoutMethodFormSchema),
    defaultValues: initialValues,
  });

  const methodType = watch("payoutMethodType");

  function onSubmit(values: PayoutMethodFormValues) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateAgentPayoutMethodAction(values);

      if (!result.success) {
        setError(result.error ?? labels.error ?? null);
        return;
      }

      setMessage(labels.saved ?? null);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payoutMethodType">{labels.methodType}</Label>
        <select
          id="payoutMethodType"
          {...register("payoutMethodType")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {(
            [
              "BANK_TRANSFER",
              "JAZZCASH",
              "EASYPAISA",
              "NAYAPAY",
              "SADAPAY",
              "OTHER",
            ] as const
          ).map((type) => (
            <option key={type} value={type}>
              {labels[`method_${type}`]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payoutAccountTitle">{labels.accountTitle}</Label>
        <Input id="payoutAccountTitle" {...register("payoutAccountTitle")} />
        {errors.payoutAccountTitle ? (
          <p className="text-sm text-destructive">{errors.payoutAccountTitle.message}</p>
        ) : null}
      </div>

      {methodType === "BANK_TRANSFER" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="payoutBankName">{labels.bankName}</Label>
            <Input id="payoutBankName" {...register("payoutBankName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payoutAccountNumber">{labels.accountNumber}</Label>
            <Input id="payoutAccountNumber" {...register("payoutAccountNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payoutIban">{labels.iban}</Label>
            <Input id="payoutIban" {...register("payoutIban")} />
          </div>
        </>
      ) : null}

      {WALLET_TYPES.has(methodType) ? (
        <div className="space-y-2">
          <Label htmlFor="payoutWalletNumber">{labels.walletNumber}</Label>
          <Input id="payoutWalletNumber" {...register("payoutWalletNumber")} />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="payoutNotes">{labels.notes}</Label>
        <Textarea id="payoutNotes" rows={3} {...register("payoutNotes")} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? labels.saving : labels.save}
      </Button>
    </form>
  );
}
