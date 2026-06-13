"use client";

import type { AgentCommissionMode, AgentPayoutStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { SecureCommissionProofViewer } from "@/components/shared/SecureCommissionProofViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAgentWorkspaceCommission } from "@/features/admin/lib/serialize-admin-agent";
import {
  cancelAgentCommissionAction,
  confirmCommissionPaidAction,
  abortCommissionProofUploadAction,
  createAgentCommissionAction,
  requestCommissionProofUploadAction,
  updateAgentCommissionAction,
} from "@/features/admin/agents/actions";
import { validateClientUpload } from "@/features/applications/lib/validate-upload";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";
import { cn } from "@/lib/utils";

export type AdminCommissionLedgerLabels = {
  title: string;
  empty: string;
  addPayout: string;
  hidePayoutForm: string;
  trackingId: string;
  label: string;
  amount: string;
  description: string;
  addCommission: string;
  addingCommission: string;
  edit: string;
  save: string;
  saving: string;
  cancelEdit: string;
  cancelPayout: string;
  cancelling: string;
  cancelConfirm: string;
  cancelConfirmButton: string;
  cancelDismiss: string;
  markPaid: string;
  markPaidShort: string;
  markPaidUploading: string;
  markPaidRequiresPayout: string;
  noTrackingId: string;
  payoutMethodMissing: string;
  receipt_RECEIVED: string;
  receipt_NOT_RECEIVED: string;
  receipt_AWAITING: string;
  viewProof: string;
  hideProof: string;
  locked: string;
  filterAll: string;
  filterPending: string;
  filterPaid: string;
  filterCancelled: string;
  summaryPending: string;
  summaryPaid: string;
  success: string;
  error: string;
  invalidProof: string;
  uploadFailed: string;
  completePayout: string;
  completingPayout: string;
  reuploadProof: string;
  resolveDispute: string;
  resolvingDispute: string;
  resolutionNote: string;
  resolutionNotePlaceholder: string;
  resolutionNoteRequired: string;
  cancelResolve: string;
  uploadNewProof: string;
  proofLoading: string;
  proofError: string;
  proofRetry: string;
  proofOpen: string;
  proofUnsupported: string;
  agentConfirmed: string;
  awaitingAgentConfirm: string;
  columns: {
    label: string;
    application: string;
    amount: string;
    status: string;
    actions: string;
  };
  source_MANUAL: string;
  source_AUTO_PERCENTAGE: string;
  source_AUTO_FIXED: string;
  payoutStatus_PENDING: string;
  payoutStatus_PROCESSING: string;
  payoutStatus_PAID: string;
  payoutStatus_CANCELLED: string;
};

type AdminCommissionLedgerProps = {
  agentProfileId: string;
  commissionMode: AgentCommissionMode;
  payoutMethodConfigured: boolean;
  commissions: AdminAgentWorkspaceCommission[];
  locale: "en" | "ur";
  labels: AdminCommissionLedgerLabels;
  fieldIdPrefix: string;
};

type StatusFilter = "all" | AgentPayoutStatus;

type EditFormState = {
  trackingId: string;
  label: string;
  amount: string;
  description: string;
};

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "PENDING",
  "PAID",
  "CANCELLED",
];

function isEditable(commission: AdminAgentWorkspaceCommission) {
  return (
    commission.payoutStatus === "PENDING" ||
    commission.payoutStatus === "PROCESSING"
  );
}

function formatAmount(locale: "en" | "ur", amount: string) {
  return new Intl.NumberFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(Number(amount));
}

function payoutBadgeVariant(
  status: AgentPayoutStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "PROCESSING":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function filterCount(
  commissions: AdminAgentWorkspaceCommission[],
  filter: StatusFilter,
) {
  if (filter === "all") {
    return commissions.length;
  }
  if (filter === "PENDING") {
    return commissions.filter(
      (item) =>
        item.payoutStatus === "PENDING" || item.payoutStatus === "PROCESSING",
    ).length;
  }
  return commissions.filter((item) => item.payoutStatus === filter).length;
}

type CommissionLedgerItemProps = {
  commission: AdminAgentWorkspaceCommission;
  locale: "en" | "ur";
  labels: AdminCommissionLedgerLabels;
  fieldId: (name: string) => string;
  isPending: boolean;
  isUploading: boolean;
  payoutMethodConfigured: boolean;
  isEditing: boolean;
  isConfirmingCancel: boolean;
  isProofExpanded: boolean;
  editForm: EditFormState;
  setProofInputRef: (node: HTMLInputElement | null) => void;
  onMarkPaidClick: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditFormChange: (value: EditFormState) => void;
  onUpdate: () => void;
  onRequestCancel: () => void;
  onDismissCancel: () => void;
  onConfirmCancel: () => void;
  onProofUpload: (file: File) => void;
  onToggleProof: () => void;
  onCompletePayout: () => void;
  isResolvingDispute: boolean;
  resolutionNote: string;
  onResolutionNoteChange: (value: string) => void;
  onStartResolveDispute: () => void;
  onCancelResolveDispute: () => void;
  onResolveDisputeUpload: (file: File) => void;
};

function CommissionLedgerItem({
  commission,
  locale,
  labels,
  fieldId,
  isPending,
  isUploading,
  payoutMethodConfigured,
  isEditing,
  isConfirmingCancel,
  isProofExpanded,
  editForm,
  setProofInputRef,
  onMarkPaidClick,
  onStartEdit,
  onCancelEdit,
  onEditFormChange,
  onUpdate,
  onRequestCancel,
  onDismissCancel,
  onConfirmCancel,
  onProofUpload,
  onToggleProof,
  onCompletePayout,
  isResolvingDispute,
  resolutionNote,
  onResolutionNoteChange,
  onStartResolveDispute,
  onCancelResolveDispute,
  onResolveDisputeUpload,
}: CommissionLedgerItemProps) {
  const editable = isEditable(commission);
  const canMarkPaid =
    commission.payoutStatus === "PENDING" ||
    (commission.payoutStatus === "PROCESSING" && !commission.hasProof);
  const canCompletePayout =
    commission.payoutStatus === "PROCESSING" && commission.hasProof;
  const canReuploadProof =
    commission.payoutStatus === "PROCESSING" && commission.hasProof;
  const canResolveDispute =
    commission.payoutStatus === "PAID" &&
    commission.agentReceiptStatus === "NOT_RECEIVED" &&
    !isResolvingDispute;

  return (
    <article
      className={cn(
        "rounded-xl border bg-background transition-colors",
        commission.payoutStatus === "CANCELLED" && "opacity-60",
        isEditing && "border-primary/40 ring-1 ring-primary/20",
      )}
    >
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-semibold">{commission.label}</h4>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {labels[`source_${commission.source}`]}
              </Badge>
            </div>
            {commission.description ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {commission.description}
              </p>
            ) : null}
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-primary">
            {formatAmount(locale, commission.amount)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={payoutBadgeVariant(commission.payoutStatus)} className="text-[11px]">
            {labels[`payoutStatus_${commission.payoutStatus}`]}
          </Badge>
          {commission.payoutStatus === "PAID" ? (
            <Badge
              variant={
                commission.agentReceiptStatus === "NOT_RECEIVED"
                  ? "destructive"
                  : commission.agentReceiptStatus === "RECEIVED"
                    ? "default"
                    : "secondary"
              }
              className="text-[11px]"
            >
              {commission.agentReceiptStatus === "RECEIVED"
                ? labels.receipt_RECEIVED
                : commission.agentReceiptStatus === "NOT_RECEIVED"
                  ? labels.receipt_NOT_RECEIVED
                  : labels.receipt_AWAITING}
            </Badge>
          ) : null}
          {commission.trackingId ? (
            <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              <FileText className="size-3 shrink-0" />
              <span className="truncate">{commission.trackingId}</span>
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">{labels.noTrackingId}</span>
          )}
        </div>

        {commission.agentReceiptStatus === "NOT_RECEIVED" &&
        commission.agentDisputeReason ? (
          <p className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-xs text-destructive">
            {commission.agentDisputeReason}
          </p>
        ) : null}

        {commission.agentReceiptStatus === "RECEIVED" ? (
          <p className="mt-2 text-[11px] font-medium text-primary">{labels.agentConfirmed}</p>
        ) : commission.payoutStatus === "PAID" &&
          commission.agentReceiptStatus === "AWAITING" ? (
          <p className="mt-2 text-[11px] font-medium text-amber-700 dark:text-amber-300">
            {labels.awaitingAgentConfirm}
          </p>
        ) : null}

        {!isEditing && !isConfirmingCancel ? (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
            {editable ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2.5"
                disabled={isPending}
                onClick={onStartEdit}
              >
                <Pencil className="size-3.5" />
                {labels.edit}
              </Button>
            ) : null}

            {canMarkPaid || canReuploadProof ? (
              <>
                <input
                  ref={setProofInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onProofUpload(file);
                    }
                    event.target.value = "";
                  }}
                />
                {canMarkPaid ? (
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 px-2.5"
                    disabled={isPending || isUploading || !payoutMethodConfigured}
                    title={
                      payoutMethodConfigured
                        ? labels.markPaid
                        : labels.markPaidRequiresPayout
                    }
                    onClick={onMarkPaidClick}
                  >
                    <Upload className="size-3.5" />
                    {isUploading ? labels.markPaidUploading : labels.markPaidShort}
                  </Button>
                ) : null}
                {canReuploadProof ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5"
                    disabled={isPending || isUploading || !payoutMethodConfigured}
                    onClick={onMarkPaidClick}
                  >
                    <Upload className="size-3.5" />
                    {isUploading ? labels.markPaidUploading : labels.reuploadProof}
                  </Button>
                ) : null}
              </>
            ) : null}

            {canCompletePayout ? (
              <Button
                type="button"
                size="sm"
                className="h-8 px-2.5"
                disabled={isPending || isUploading}
                onClick={onCompletePayout}
              >
                {isUploading ? labels.completingPayout : labels.completePayout}
              </Button>
            ) : null}

            {commission.hasProof ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2.5"
                onClick={onToggleProof}
              >
                {isProofExpanded ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                {isProofExpanded ? labels.hideProof : labels.viewProof}
              </Button>
            ) : null}

            {canResolveDispute ? (
              <Button
                type="button"
                size="sm"
                variant="default"
                className="h-8 px-2.5"
                disabled={isPending || isUploading}
                onClick={onStartResolveDispute}
              >
                <Upload className="size-3.5" />
                {labels.resolveDispute}
              </Button>
            ) : null}

            {editable ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2.5 text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={onRequestCancel}
              >
                <Trash2 className="size-3.5" />
                {labels.cancelPayout}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isConfirmingCancel ? (
        <div className="border-t bg-destructive/5 px-3.5 py-3">
          <p className="text-sm text-destructive">{labels.cancelConfirm}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onDismissCancel}>
              {labels.cancelDismiss}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={onConfirmCancel}
            >
              {isPending ? labels.cancelling : labels.cancelConfirmButton}
            </Button>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="space-y-3 border-t bg-muted/20 px-3.5 py-3">
          {commission.source === "MANUAL" ? (
            <div className="space-y-1.5">
              <Label htmlFor={fieldId(`edit-tracking-${commission.id}`)} className="text-xs">
                {labels.trackingId}
              </Label>
              <Input
                id={fieldId(`edit-tracking-${commission.id}`)}
                value={editForm.trackingId}
                onChange={(event) =>
                  onEditFormChange({
                    ...editForm,
                    trackingId: event.target.value,
                  })
                }
              />
            </div>
          ) : null}
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={fieldId(`edit-label-${commission.id}`)} className="text-xs">
                {labels.label}
              </Label>
              <Input
                id={fieldId(`edit-label-${commission.id}`)}
                value={editForm.label}
                onChange={(event) =>
                  onEditFormChange({
                    ...editForm,
                    label: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={fieldId(`edit-amount-${commission.id}`)} className="text-xs">
                {labels.amount}
              </Label>
              <Input
                id={fieldId(`edit-amount-${commission.id}`)}
                type="number"
                step="0.01"
                min="0"
                value={editForm.amount}
                onChange={(event) =>
                  onEditFormChange({
                    ...editForm,
                    amount: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={fieldId(`edit-description-${commission.id}`)} className="text-xs">
                {labels.description}
              </Label>
              <Textarea
                id={fieldId(`edit-description-${commission.id}`)}
                value={editForm.description}
                onChange={(event) =>
                  onEditFormChange({
                    ...editForm,
                    description: event.target.value,
                  })
                }
                rows={2}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onUpdate}
              disabled={
                isPending ||
                !editForm.label.trim() ||
                !editForm.amount ||
                Number(editForm.amount) <= 0 ||
                (commission.source === "MANUAL" && !editForm.trackingId.trim())
              }
            >
              {isPending ? labels.saving : labels.save}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="size-3.5" />
              {labels.cancelEdit}
            </Button>
          </div>
        </div>
      ) : null}

      {isResolvingDispute ? (
        <div className="space-y-3 border-t bg-primary/5 px-3.5 py-3">
          <p className="text-sm font-medium">{labels.resolveDispute}</p>
          <div className="space-y-1.5">
            <Label htmlFor={fieldId(`resolution-note-${commission.id}`)} className="text-xs">
              {labels.resolutionNote}
            </Label>
            <Textarea
              id={fieldId(`resolution-note-${commission.id}`)}
              value={resolutionNote}
              onChange={(event) => onResolutionNoteChange(event.target.value)}
              placeholder={labels.resolutionNotePlaceholder}
              rows={3}
            />
          </div>
          <input
            ref={setProofInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onResolveDisputeUpload(file);
              }
              event.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={
                isPending ||
                isUploading ||
                resolutionNote.trim().length < 3 ||
                !payoutMethodConfigured
              }
              onClick={onMarkPaidClick}
            >
              <Upload className="size-3.5" />
              {isUploading ? labels.resolvingDispute : labels.uploadNewProof}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending || isUploading}
              onClick={onCancelResolveDispute}
            >
              {labels.cancelResolve}
            </Button>
          </div>
        </div>
      ) : null}

      {isProofExpanded && commission.hasProof ? (
        <div className="border-t bg-muted/10 px-3.5 py-3">
          <SecureCommissionProofViewer
            commissionId={commission.id}
            labels={{
              loading: labels.proofLoading,
              error: labels.proofError,
              retry: labels.proofRetry,
              openNewTab: labels.proofOpen,
              unsupported: labels.proofUnsupported,
            }}
          />
        </div>
      ) : null}
    </article>
  );
}

export function AdminCommissionLedger({
  agentProfileId,
  commissionMode,
  payoutMethodConfigured,
  commissions,
  locale,
  labels,
  fieldIdPrefix,
}: AdminCommissionLedgerProps) {
  const router = useRouter();
  const proofInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [createForm, setCreateForm] = useState({
    trackingId: "",
    label: "",
    amount: "",
    description: "",
  });
  const [editForm, setEditForm] = useState<EditFormState>({
    trackingId: "",
    label: "",
    amount: "",
    description: "",
  });

  const fieldId = (name: string) => `${fieldIdPrefix}-${name}`;

  const filteredCommissions = useMemo(() => {
    if (statusFilter === "all") {
      return commissions;
    }
    if (statusFilter === "PENDING") {
      return commissions.filter(
        (commission) =>
          commission.payoutStatus === "PENDING" ||
          commission.payoutStatus === "PROCESSING",
      );
    }
    return commissions.filter(
      (commission) => commission.payoutStatus === statusFilter,
    );
  }, [commissions, statusFilter]);

  const summary = useMemo(() => {
    const pending = commissions.filter(
      (item) =>
        item.payoutStatus === "PENDING" || item.payoutStatus === "PROCESSING",
    );
    const paid = commissions.filter((item) => item.payoutStatus === "PAID");

    const pendingTotal = pending.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );
    const paidTotal = paid.reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      pendingCount: pending.length,
      paidCount: paid.length,
      pendingTotal,
      paidTotal,
    };
  }, [commissions]);

  function refreshSuccess() {
    setMessage(labels.success);
    setEditingId(null);
    setConfirmCancelId(null);
    setShowCreateForm(false);
    router.refresh();
  }

  function startEdit(commission: AdminAgentWorkspaceCommission) {
    setConfirmCancelId(null);
    setEditingId(commission.id);
    setEditForm({
      trackingId: commission.trackingId ?? "",
      label: commission.label,
      amount: commission.amount,
      description: commission.description ?? "",
    });
  }

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createAgentCommissionAction({
        agentProfileId,
        trackingId: createForm.trackingId.trim().toUpperCase(),
        label: createForm.label,
        amount: Number(createForm.amount),
        description: createForm.description || undefined,
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setCreateForm({
        trackingId: "",
        label: "",
        amount: "",
        description: "",
      });
      refreshSuccess();
    });
  }

  function handleUpdate(commissionId: string, source: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateAgentCommissionAction({
        commissionId,
        label: editForm.label,
        amount: Number(editForm.amount),
        description: editForm.description || undefined,
        trackingId:
          source === "MANUAL" ? editForm.trackingId.trim().toUpperCase() : undefined,
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      refreshSuccess();
    });
  }

  function handleCancel(commissionId: string) {
    setError(null);
    startTransition(async () => {
      const result = await cancelAgentCommissionAction({ commissionId });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      refreshSuccess();
    });
  }

  function handleProofUpload(
    commissionId: string,
    file: File,
    options?: { resolutionNote?: string },
  ) {
    setError(null);
    setUploadingId(commissionId);
    startTransition(async () => {
      try {
        const validation = validateClientUpload({
          file,
          acceptedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
          ],
          maxSizeBytes: 5 * 1024 * 1024,
          invalidTypeMessage: labels.invalidProof,
          tooLargeMessage: labels.invalidProof,
          invalidNameMessage: labels.invalidProof,
        });

        if (!validation.valid) {
          setError(validation.error);
          return;
        }

        const note = options?.resolutionNote?.trim();
        if (resolvingDisputeId === commissionId && (!note || note.length < 3)) {
          setError(labels.resolutionNoteRequired);
          return;
        }

        const mimeType =
          resolveClientFileMimeType(file, [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
          ]) ?? file.type;

        const request = await requestCommissionProofUploadAction({
          commissionId,
          fileName: file.name,
          mimeType,
          fileSize: file.size,
        });

        if (!request.success) {
          setError(request.error ?? labels.error);
          return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append("file", file, file.name);

        let uploadResponse: Response;

        try {
          uploadResponse = await fetch(
            `/api/commissions/${request.data.commissionId}/upload`,
            {
              method: "POST",
              body: uploadFormData,
              credentials: "include",
            },
          );
        } catch {
          await abortCommissionProofUploadAction({
            commissionId: request.data.commissionId,
          });
          setError(labels.uploadFailed);
          return;
        }

        if (!uploadResponse.ok) {
          await abortCommissionProofUploadAction({
            commissionId: request.data.commissionId,
          });
          const payload = (await uploadResponse.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(payload?.error ?? labels.uploadFailed);
          return;
        }

        const confirm = await confirmCommissionPaidAction({
          commissionId: request.data.commissionId,
          resolutionNote: note,
        });

        if (!confirm.success) {
          setError(confirm.error ?? labels.error);
          return;
        }

        setResolvingDisputeId(null);
        setResolutionNote("");
        refreshSuccess();
      } catch {
        setError(labels.uploadFailed);
      } finally {
        setUploadingId(null);
      }
    });
  }

  function handleCompletePayout(commissionId: string) {
    setError(null);
    setUploadingId(commissionId);
    startTransition(async () => {
      try {
        const confirm = await confirmCommissionPaidAction({ commissionId });

        if (!confirm.success) {
          setError(confirm.error ?? labels.error);
          return;
        }

        refreshSuccess();
      } catch {
        setError(labels.error);
      } finally {
        setUploadingId(null);
      }
    });
  }

  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{labels.title}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {labels.summaryPending}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {summary.pendingCount}
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {formatAmount(locale, summary.pendingTotal.toString())}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {labels.summaryPaid}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {summary.paidCount}
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {formatAmount(locale, summary.paidTotal.toString())}
              </p>
            </div>
          </div>
        </div>
        {commissionMode === "MANUAL" ? (
          <Button
            type="button"
            variant={showCreateForm ? "secondary" : "default"}
            size="sm"
            className="shrink-0"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setEditingId(null);
              setConfirmCancelId(null);
            }}
          >
            {showCreateForm ? (
              <>
                <ChevronUp className="size-4" />
                {labels.hidePayoutForm}
              </>
            ) : (
              <>
                <Plus className="size-4" />
                {labels.addPayout}
              </>
            )}
          </Button>
        ) : null}
      </div>

      {!payoutMethodConfigured ? (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
          {labels.markPaidRequiresPayout}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-4 gap-1 rounded-lg border bg-muted/20 p-1">
        {STATUS_FILTERS.map((filter) => {
          const count = filterCount(commissions, filter);
          const isActive = statusFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "rounded-md px-2 py-1.5 text-center text-[11px] font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="block truncate">
                {filter === "all"
                  ? labels.filterAll
                  : filter === "PENDING"
                    ? labels.filterPending
                    : filter === "PAID"
                      ? labels.filterPaid
                      : labels.filterCancelled}
              </span>
              <span className="mt-0.5 block text-[10px] tabular-nums opacity-80">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {showCreateForm && commissionMode === "MANUAL" ? (
        <div className="mt-4 space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-medium text-primary">{labels.addCommission}</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={fieldId("create-trackingId")} className="text-xs">
                {labels.trackingId}
              </Label>
              <Input
                id={fieldId("create-trackingId")}
                value={createForm.trackingId}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    trackingId: event.target.value,
                  }))
                }
                placeholder="PAX-YYYYMMDD-XXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={fieldId("create-label")} className="text-xs">
                {labels.label}
              </Label>
              <Input
                id={fieldId("create-label")}
                value={createForm.label}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={fieldId("create-amount")} className="text-xs">
                {labels.amount}
              </Label>
              <Input
                id={fieldId("create-amount")}
                type="number"
                step="0.01"
                min="0"
                value={createForm.amount}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={fieldId("create-description")} className="text-xs">
                {labels.description}
              </Label>
              <Textarea
                id={fieldId("create-description")}
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={2}
              />
            </div>
          </div>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleCreate}
            disabled={
              isPending ||
              !createForm.trackingId.trim() ||
              !createForm.label.trim() ||
              !createForm.amount ||
              Number(createForm.amount) <= 0
            }
          >
            {isPending ? labels.addingCommission : labels.addCommission}
          </Button>
        </div>
      ) : null}

      {filteredCommissions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">{labels.empty}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredCommissions.map((commission) => (
            <CommissionLedgerItem
              key={commission.id}
              commission={commission}
              locale={locale}
              labels={labels}
              fieldId={fieldId}
              isPending={isPending}
              isUploading={uploadingId === commission.id}
              payoutMethodConfigured={payoutMethodConfigured}
              isEditing={editingId === commission.id}
              isConfirmingCancel={confirmCancelId === commission.id}
              isProofExpanded={expandedProofId === commission.id}
              editForm={editForm}
              setProofInputRef={(node) => {
                proofInputRefs.current[commission.id] = node;
              }}
              onMarkPaidClick={() => proofInputRefs.current[commission.id]?.click()}
              onStartEdit={() => startEdit(commission)}
              onCancelEdit={() => setEditingId(null)}
              onEditFormChange={setEditForm}
              onUpdate={() => handleUpdate(commission.id, commission.source)}
              onRequestCancel={() => {
                setEditingId(null);
                setConfirmCancelId(commission.id);
              }}
              onDismissCancel={() => setConfirmCancelId(null)}
              onConfirmCancel={() => handleCancel(commission.id)}
              onProofUpload={(file) => handleProofUpload(commission.id, file)}
              onToggleProof={() =>
                setExpandedProofId((current) =>
                  current === commission.id ? null : commission.id,
                )
              }
              onCompletePayout={() => handleCompletePayout(commission.id)}
              isResolvingDispute={resolvingDisputeId === commission.id}
              resolutionNote={resolutionNote}
              onResolutionNoteChange={setResolutionNote}
              onStartResolveDispute={() => {
                setResolvingDisputeId(commission.id);
                setResolutionNote("");
                setEditingId(null);
                setConfirmCancelId(null);
                setError(null);
              }}
              onCancelResolveDispute={() => {
                setResolvingDisputeId(null);
                setResolutionNote("");
              }}
              onResolveDisputeUpload={(file) =>
                handleProofUpload(commission.id, file, {
                  resolutionNote,
                })
              }
            />
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      ) : null}
    </section>
  );
}
