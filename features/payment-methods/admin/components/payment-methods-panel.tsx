"use client";

import type { PaymentMethodType } from "@prisma/client";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createPaymentMethodAction,
  deletePaymentMethodAction,
  reorderPaymentMethodsAction,
  togglePaymentMethodActiveAction,
  updatePaymentMethodAction} from "@/features/payment-methods/admin/actions/payment-method-actions";
import type { PaymentMethodPanelLabels } from "@/features/payment-methods/admin/lib/labels";
import {
  PaymentMethodQrField,
  PaymentMethodQrSaveFirstHint} from "@/features/payment-methods/admin/components/payment-method-qr-field";
import type { AdminPaymentMethodItem } from "@/server/repositories/admin-payment-method-repository";

import { useRouter } from "next/navigation";
type PaymentMethodsPanelProps = {
  methods: AdminPaymentMethodItem[];
  labels: PaymentMethodPanelLabels;
  nextDisplayOrder: number;
};

type MethodDraft = {
  id?: string;
  code: string;
  type: PaymentMethodType;
  nameEn: string;
  accountTitleEn: string;
  accountNumber: string;
  iban: string;
  bankNameEn: string;
  instructionsEn: string;
  isActive: boolean;
  displayOrder: number;
};

const paymentMethodTypes: PaymentMethodType[] = [
  "BANK_TRANSFER",
  "JAZZCASH",
  "EASYPAISA",
  "NAYAPAY",
  "SADAPAY",
  "OTHER"];

function emptyDraft(displayOrder: number): MethodDraft {
  return {
    code: "",
    type: "BANK_TRANSFER",
    nameEn: "",
    accountTitleEn: "",
    accountNumber: "",
    iban: "",
    bankNameEn: "",
    instructionsEn: "",
    isActive: true,
    displayOrder};
}

function methodToDraft(method: AdminPaymentMethodItem): MethodDraft {
  return {
    id: method.id,
    code: method.code,
    type: method.type,
    nameEn: method.nameEn,
    accountTitleEn: method.accountTitleEn ?? "",
    accountNumber: method.accountNumber ?? "",
    iban: method.iban ?? "",
    bankNameEn: method.bankNameEn ?? "",
    instructionsEn: method.instructionsEn ?? "",
    isActive: method.isActive,
    displayOrder: method.displayOrder};
}

export function PaymentMethodsPanel({
  methods,
  labels,
  nextDisplayOrder}: PaymentMethodsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<MethodDraft>(emptyDraft(nextDisplayOrder));
  const [error, setError] = useState<string | null>(null);

  function updateDraft<K extends keyof MethodDraft>(key: K, value: MethodDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    setError(null);

    startTransition(async () => {
      try {
        const result = draft.id
          ? await updatePaymentMethodAction(draft)
          : await createPaymentMethodAction(draft);

        if (!result.success) {
          setError(result.error);
          return;
        }

        if (draft.id) {
          setDraft(emptyDraft(nextDisplayOrder));
        } else {
          const created = methods.find((method) => method.id === result.data.id);
          setDraft(
            created
              ? methodToDraft(created)
              : {
                  ...emptyDraft(nextDisplayOrder),
                  id: result.data.id,
                  code: draft.code,
                  type: draft.type,
                  nameEn: draft.nameEn,
                  accountTitleEn: draft.accountTitleEn,
                  accountNumber: draft.accountNumber,
                  iban: draft.iban,
                  bankNameEn: draft.bankNameEn,
                  instructionsEn: draft.instructionsEn,
                  isActive: draft.isActive,
                  displayOrder: draft.displayOrder},
          );
        }
        router.refresh();
      } catch (saveError) {
        setError(
          saveError instanceof Error ? saveError.message : labels.saveFailed,
        );
      }
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deletePaymentMethodAction({ id });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await togglePaymentMethodActiveAction({ id, isActive });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleReorder(id: string, direction: "up" | "down") {
    const index = methods.findIndex((method) => method.id === id);

    if (index < 0) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= methods.length) {
      return;
    }

    const reordered = [...methods];
    const current = reordered[index];
    const target = reordered[swapIndex];

    if (!current || !target) {
      return;
    }

    reordered[index] = target;
    reordered[swapIndex] = current;

    startTransition(async () => {
      const result = await reorderPaymentMethodsAction({
        items: reordered.map((method, order) => ({
          id: method.id,
          displayOrder: order + 1}))});

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-4 md:p-6">
        <h2 className="text-lg font-semibold">
          {draft.id ? labels.editMethod : labels.addMethod}
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">{labels.code}</Label>
            <Input
              id="code"
              value={draft.code}
              onChange={(event) => updateDraft("code", event.target.value)}
              placeholder="meezan-bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{labels.type}</Label>
            <select
              id="type"
              value={draft.type}
              onChange={(event) =>
                updateDraft("type", event.target.value as PaymentMethodType)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {paymentMethodTypes.map((type) => (
                <option key={type} value={type}>
                  {labels.types[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameEn">{labels.nameEn}</Label>
            <p className="text-xs text-muted-foreground">{labels.nameEnHint}</p>
            <Input
              id="nameEn"
              value={draft.nameEn}
              onChange={(event) => updateDraft("nameEn", event.target.value)}
              placeholder="Meezan Bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankNameEn">{labels.bankNameEn}</Label>
            <Input
              id="bankNameEn"
              value={draft.bankNameEn}
              onChange={(event) => updateDraft("bankNameEn", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountTitleEn">{labels.accountTitleEn}</Label>
            <Input
              id="accountTitleEn"
              value={draft.accountTitleEn}
              onChange={(event) =>
                updateDraft("accountTitleEn", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">{labels.accountNumber}</Label>
            <Input
              id="accountNumber"
              value={draft.accountNumber}
              onChange={(event) =>
                updateDraft("accountNumber", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">{labels.iban}</Label>
            <Input
              id="iban"
              value={draft.iban}
              onChange={(event) => updateDraft("iban", event.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="instructionsEn">{labels.instructionsEn}</Label>
            <Textarea
              id="instructionsEn"
              rows={2}
              value={draft.instructionsEn}
              onChange={(event) =>
                updateDraft("instructionsEn", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">{labels.displayOrder}</Label>
            <Input
              id="displayOrder"
              type="number"
              min={0}
              value={draft.displayOrder}
              onChange={(event) =>
                updateDraft("displayOrder", Number(event.target.value) || 0)
              }
            />
          </div>

          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => updateDraft("isActive", event.target.checked)}
              className="size-4 rounded border-input"
            />
            {labels.isActive}
          </label>

          {draft.id ? (
            <PaymentMethodQrField
              paymentMethodId={draft.id}
              hasQr={Boolean(
                methods.find((method) => method.id === draft.id)?.qrCodeR2Key,
              )}
              labels={{
                title: labels.qrCode,
                hint: labels.qrCodeHint,
                upload: labels.qrCodeUpload,
                uploading: labels.qrCodeUploading,
                remove: labels.qrCodeRemove,
                removing: labels.qrCodeRemoving,
                scanHint: labels.qrCodeScanHint,
                saveFirst: labels.qrCodeSaveFirst,
                uploadFailed: labels.qrCodeUploadFailed,
                invalidType: labels.qrCodeInvalidType,
                tooLarge: labels.qrCodeTooLarge,
                invalidName: labels.qrCodeInvalidName,
                maxSize: labels.qrCodeMaxSize}}
            />
          ) : (
            <PaymentMethodQrSaveFirstHint
              labels={{ saveFirst: labels.qrCodeSaveFirst }}
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {labels.saveMethod}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(emptyDraft(nextDisplayOrder))}
            disabled={isPending}
          >
            {labels.clear}
          </Button>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">{labels.existing}</h2>
        </div>

        {methods.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labels.nameEn}</TableHead>
                <TableHead>{labels.type}</TableHead>
                <TableHead>{labels.accountNumber}</TableHead>
                <TableHead>{labels.isActive}</TableHead>
                <TableHead className="text-end">{labels.edit}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method, index) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{method.nameEn}</p>
                      <p className="text-xs text-muted-foreground">{method.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>{labels.types[method.type]}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {method.accountNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.isActive ? "default" : "secondary"}>
                      {method.isActive ? labels.active : labels.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={isPending || index === 0}
                        onClick={() => handleReorder(method.id, "up")}
                        aria-label={labels.moveUp}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={isPending || index === methods.length - 1}
                        onClick={() => handleReorder(method.id, "down")}
                        aria-label={labels.moveDown}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setDraft(methodToDraft(method))}
                        aria-label={labels.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleToggle(method.id, !method.isActive)
                        }
                        disabled={isPending}
                      >
                        {method.isActive ? labels.inactive : labels.active}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(method.id)}
                        disabled={isPending}
                        aria-label={labels.delete}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
