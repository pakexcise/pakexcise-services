"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { CreditCard, Pencil, Plus, Trash2, X } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  clearAgentPayoutMethodAction,
  updateAgentPayoutMethodAction,
} from "@/features/agents/actions/payout-method";
import { cn } from "@/lib/utils";

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

export type AgentPayoutMethodValues = z.infer<typeof payoutMethodFormSchema>;

export type AgentPayoutMethodManagerLabels = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  addMethod: string;
  editMethod: string;
  deleteMethod: string;
  deleteConfirm: string;
  deleteConfirmButton: string;
  deleteDismiss: string;
  deleting: string;
  deleted: string;
  methodType: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  bankName: string;
  walletNumber: string;
  notes: string;
  save: string;
  saving: string;
  saved: string;
  error: string;
  cancel: string;
  configured: string;
  method_BANK_TRANSFER: string;
  method_JAZZCASH: string;
  method_EASYPAISA: string;
  method_NAYAPAY: string;
  method_SADAPAY: string;
  method_OTHER: string;
};

type AgentPayoutMethodManagerProps = {
  initialValues: AgentPayoutMethodValues;
  hasMethod: boolean;
  labels: AgentPayoutMethodManagerLabels;
  compact?: boolean;
};

const WALLET_TYPES = new Set(["JAZZCASH", "EASYPAISA", "NAYAPAY", "SADAPAY"]);
const METHOD_TYPES = [
  "BANK_TRANSFER",
  "JAZZCASH",
  "EASYPAISA",
  "NAYAPAY",
  "SADAPAY",
  "OTHER",
] as const;

type PanelMode = "view" | "edit" | "create";

export function AgentPayoutMethodManager({
  initialValues,
  hasMethod,
  labels,
  compact = false,
}: AgentPayoutMethodManagerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<PanelMode>(hasMethod ? "view" : "create");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AgentPayoutMethodValues>({
    resolver: zodResolver(payoutMethodFormSchema),
    defaultValues: initialValues,
  });

  const methodType = watch("payoutMethodType");

  function onSubmit(values: AgentPayoutMethodValues) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateAgentPayoutMethodAction(values);

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(labels.saved);
      setMode("view");
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await clearAgentPayoutMethodAction();

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      reset({
        payoutMethodType: "BANK_TRANSFER",
        payoutAccountTitle: "",
        payoutAccountNumber: "",
        payoutIban: "",
        payoutBankName: "",
        payoutWalletNumber: "",
        payoutNotes: "",
      });
      setMessage(labels.deleted);
      setConfirmDelete(false);
      setMode("create");
      router.refresh();
    });
  }

  const methodLabel = labels[`method_${initialValues.payoutMethodType}`];

  return (
    <section className={cn("rounded-xl border bg-card", compact ? "p-4" : "p-5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <h2 className={cn("font-semibold", compact ? "text-sm" : "text-lg")}>
              {labels.title}
            </h2>
            {hasMethod && mode === "view" ? (
              <Badge variant="secondary" className="text-[10px]">
                {labels.configured}
              </Badge>
            ) : null}
          </div>
          {!compact ? (
            <p className="mt-1 text-sm text-muted-foreground">{labels.description}</p>
          ) : null}
        </div>
        {mode === "view" && hasMethod ? (
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                reset(initialValues);
                setMode("edit");
                setConfirmDelete(false);
              }}
            >
              <Pencil className="size-3.5" />
              {labels.editMethod}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3.5" />
              {labels.deleteMethod}
            </Button>
          </div>
        ) : null}
        {mode === "create" && !hasMethod ? (
          <Badge variant="outline" className="text-[10px]">
            <Plus className="mr-1 size-3" />
            {labels.addMethod}
          </Badge>
        ) : null}
      </div>

      {confirmDelete ? (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{labels.deleteConfirm}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              {labels.deleteDismiss}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? labels.deleting : labels.deleteConfirmButton}
            </Button>
          </div>
        </div>
      ) : null}

      {mode === "view" && hasMethod && !confirmDelete ? (
        <dl className="mt-4 grid gap-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{labels.methodType}</dt>
            <dd className="font-medium">{methodLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{labels.accountTitle}</dt>
            <dd>{initialValues.payoutAccountTitle}</dd>
          </div>
          {initialValues.payoutMethodType === "BANK_TRANSFER" ? (
            <>
              {initialValues.payoutBankName ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{labels.bankName}</dt>
                  <dd>{initialValues.payoutBankName}</dd>
                </div>
              ) : null}
              {initialValues.payoutAccountNumber ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{labels.accountNumber}</dt>
                  <dd className="font-mono text-xs">{initialValues.payoutAccountNumber}</dd>
                </div>
              ) : null}
              {initialValues.payoutIban ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{labels.iban}</dt>
                  <dd className="font-mono text-xs">{initialValues.payoutIban}</dd>
                </div>
              ) : null}
            </>
          ) : null}
          {WALLET_TYPES.has(initialValues.payoutMethodType) &&
          initialValues.payoutWalletNumber ? (
            <div>
              <dt className="text-xs text-muted-foreground">{labels.walletNumber}</dt>
              <dd className="font-mono text-xs">{initialValues.payoutWalletNumber}</dd>
            </div>
          ) : null}
          {initialValues.payoutNotes ? (
            <div>
              <dt className="text-xs text-muted-foreground">{labels.notes}</dt>
              <dd className="text-muted-foreground">{initialValues.payoutNotes}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {(mode === "edit" || mode === "create") && !confirmDelete ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          {mode === "create" && !hasMethod ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-sm">
              <p className="font-medium">{labels.emptyTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{labels.emptyDescription}</p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="payoutMethodType" className="text-xs">
              {labels.methodType}
            </Label>
            <select
              id="payoutMethodType"
              {...register("payoutMethodType")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {METHOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {labels[`method_${type}`]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payoutAccountTitle" className="text-xs">
              {labels.accountTitle}
            </Label>
            <Input id="payoutAccountTitle" {...register("payoutAccountTitle")} />
            {errors.payoutAccountTitle ? (
              <p className="text-xs text-destructive">{errors.payoutAccountTitle.message}</p>
            ) : null}
          </div>

          {methodType === "BANK_TRANSFER" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="payoutBankName" className="text-xs">
                  {labels.bankName}
                </Label>
                <Input id="payoutBankName" {...register("payoutBankName")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payoutAccountNumber" className="text-xs">
                  {labels.accountNumber}
                </Label>
                <Input id="payoutAccountNumber" {...register("payoutAccountNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payoutIban" className="text-xs">
                  {labels.iban}
                </Label>
                <Input id="payoutIban" {...register("payoutIban")} />
              </div>
            </>
          ) : null}

          {WALLET_TYPES.has(methodType) ? (
            <div className="space-y-1.5">
              <Label htmlFor="payoutWalletNumber" className="text-xs">
                {labels.walletNumber}
              </Label>
              <Input id="payoutWalletNumber" {...register("payoutWalletNumber")} />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="payoutNotes" className="text-xs">
              {labels.notes}
            </Label>
            <Textarea id="payoutNotes" rows={2} {...register("payoutNotes")} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? labels.saving : labels.save}
            </Button>
            {hasMethod ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  reset(initialValues);
                  setMode("view");
                }}
              >
                <X className="size-3.5" />
                {labels.cancel}
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
    </section>
  );
}
