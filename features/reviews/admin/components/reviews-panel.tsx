"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RatingStars } from "@/components/shared/rating-stars";
import {
  approveReviewAction,
  bulkApproveReviewsAction,
  bulkDeleteReviewsAction,
  bulkRejectReviewsAction,
  createReviewAction,
  deleteReviewAction,
  rejectReviewAction,
  reorderReviewsAction,
  syncGoogleReviewsAction,
  toggleReviewActiveAction,
  updateReviewAction,
} from "@/features/reviews/admin/actions/review-actions";
import { dispatchAdminBadgesRefresh } from "@/lib/admin/admin-badges-refresh";
import type { AdminReviewItem } from "@/server/repositories/admin-review-repository";

export type ReviewPanelLabels = {
  authenticityNotice: string;
  existing: string;
  empty: string;
  add: string;
  edit: string;
  author: string;
  context: string;
  content: string;
  rating: string;
  displayOrder: string;
  active: string;
  inactive: string;
  save: string;
  clear: string;
  delete: string;
  confirmDelete: string;
  saveFailed: string;
  moveUp: string;
  moveDown: string;
  searchPlaceholder: string;
  allStatuses: string;
  statusPending: string;
  statusApproved: string;
  statusRejected: string;
  approve: string;
  reject: string;
  rejectReason: string;
  rejectReasonRequired: string;
  source: string;
  sourceManual: string;
  sourceCustomer: string;
  sourceGoogle: string;
  service: string;
  trackingId: string;
  syncNow: string;
  syncing: string;
  syncSuccess: string;
  syncFailed: string;
  lastSynced: string;
  neverSynced: string;
  previous: string;
  next: string;
  results: string;
  selectAllPage: string;
  selectedCount: string;
  bulkApprove: string;
  bulkReject: string;
  bulkDelete: string;
  bulkRejectReason: string;
  confirmBulkDelete: string;
  clearSelection: string;
};

type ServiceOption = {
  id: string;
  nameEn: string;
};

type ReviewDraft = {
  id?: string;
  authorNameEn: string;
  authorRoleEn: string;
  contentEn: string;
  rating: number;
  isActive: boolean;
  displayOrder: number;
  serviceId: string;
};

function emptyDraft(displayOrder: number): ReviewDraft {
  return {
    authorNameEn: "",
    authorRoleEn: "",
    contentEn: "",
    rating: 5,
    isActive: false,
    displayOrder,
    serviceId: "",
  };
}

function toDraft(review: AdminReviewItem): ReviewDraft {
  return {
    id: review.id,
    authorNameEn: review.authorNameEn,
    authorRoleEn: review.authorRoleEn ?? "",
    contentEn: review.contentEn,
    rating: review.rating,
    isActive: review.isActive,
    displayOrder: review.displayOrder,
    serviceId: review.serviceId ?? "",
  };
}

export function ReviewsPanel({
  reviews,
  nextDisplayOrder,
  labels,
  services,
  lastSyncedAt,
}: {
  reviews: AdminReviewItem[];
  nextDisplayOrder: number;
  labels: ReviewPanelLabels;
  services: ServiceOption[];
  lastSyncedAt: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ReviewDraft>(emptyDraft(nextDisplayOrder));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">(
    "ALL",
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [showBulkReject, setShowBulkReject] = useState(false);

  const sorted = useMemo(
    () =>
      [...reviews].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      ),
    [reviews],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sorted.filter((review) => {
      const matchesStatus = status === "ALL" || review.status === status;
      const haystack = [
        review.authorNameEn,
        review.authorRoleEn ?? "",
        review.contentEn,
        review.service?.nameEn ?? "",
        review.application?.trackingId ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [query, sorted, status]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleIds = visible.map((review) => review.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  function toggleSelectOne(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleSelectPage() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return [...new Set([...current, ...visibleIds])];
    });
  }

  function clearSelection() {
    setSelectedIds([]);
    setShowBulkReject(false);
    setBulkRejectReason("");
  }

  function runBulkApprove() {
    if (selectedIds.length === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await bulkApproveReviewsAction({ ids: selectedIds });
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearSelection();
      refreshReviewUi();
    });
  }

  function runBulkReject() {
    if (selectedIds.length === 0) return;
    if (bulkRejectReason.trim().length < 5) {
      setError(labels.rejectReasonRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await bulkRejectReviewsAction({
        ids: selectedIds,
        moderationNote: bulkRejectReason.trim(),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearSelection();
      refreshReviewUi();
    });
  }

  function runBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(labels.confirmBulkDelete)) return;
    setError(null);
    startTransition(async () => {
      const result = await bulkDeleteReviewsAction({ ids: selectedIds });
      if (!result.success) {
        setError(result.error);
        return;
      }
      clearSelection();
      refreshReviewUi();
    });
  }

  function updateDraft<K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function sourceLabel(source: AdminReviewItem["source"]) {
    if (source === "GOOGLE") return labels.sourceGoogle;
    if (source === "CUSTOMER") return labels.sourceCustomer;
    return labels.sourceManual;
  }

  function statusLabel(value: AdminReviewItem["status"]) {
    if (value === "APPROVED") return labels.statusApproved;
    if (value === "REJECTED") return labels.statusRejected;
    return labels.statusPending;
  }

  function refreshReviewUi() {
    dispatchAdminBadgesRefresh();
    router.refresh();
  }

  function save() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const payload = {
        ...draft,
        serviceId: draft.serviceId || null,
      };
      const result = draft.id
        ? await updateReviewAction(payload)
        : await createReviewAction(payload);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDraft(emptyDraft(nextDisplayOrder + (draft.id ? 0 : 1)));
      refreshReviewUi();
    });
  }

  function remove(id: string) {
    if (!window.confirm(labels.confirmDelete)) return;
    startTransition(async () => {
      const result = await deleteReviewAction({ id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      refreshReviewUi();
    });
  }

  function approve(id: string) {
    startTransition(async () => {
      const result = await approveReviewAction({ id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      refreshReviewUi();
    });
  }

  function reject(id: string) {
    if (rejectReason.trim().length < 5) {
      setError(labels.rejectReasonRequired);
      return;
    }
    startTransition(async () => {
      const result = await rejectReviewAction({
        id,
        moderationNote: rejectReason.trim(),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRejectingId(null);
      setRejectReason("");
      refreshReviewUi();
    });
  }

  function togglePublish(review: AdminReviewItem) {
    startTransition(async () => {
      const result = await toggleReviewActiveAction({
        id: review.id,
        isActive: !review.isActive,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      refreshReviewUi();
    });
  }

  function move(review: AdminReviewItem, direction: "up" | "down") {
    const index = sorted.findIndex((item) => item.id === review.id);
    const target = sorted[direction === "up" ? index - 1 : index + 1];
    if (!target) return;
    startTransition(async () => {
      const result = await reorderReviewsAction({
        items: [
          { id: review.id, displayOrder: target.displayOrder },
          { id: target.id, displayOrder: review.displayOrder },
        ],
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      refreshReviewUi();
    });
  }

  function syncGoogle() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await syncGoogleReviewsAction();
      if (!result.success) {
        setError(result.error || labels.syncFailed);
        return;
      }
      setMessage(
        `${labels.syncSuccess} (+${result.data.imported} / ~${result.data.updated})`,
      );
      refreshReviewUi();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-secondary/40 bg-secondary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed">{labels.authenticityNotice}</p>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            {lastSyncedAt
              ? labels.lastSynced.replace(
                  "{time}",
                  new Date(lastSyncedAt).toLocaleString(),
                )
              : labels.neverSynced}
          </p>
          <Button type="button" variant="outline" disabled={isPending} onClick={syncGoogle}>
            {isPending ? labels.syncing : labels.syncNow}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          {message}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="space-y-3 border-b p-4">
          <h2 className="font-semibold">{labels.existing}</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <Input
              type="search"
              value={query}
              placeholder={labels.searchPlaceholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                clearSelection();
              }}
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as typeof status);
                setPage(1);
                clearSelection();
              }}
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">{labels.allStatuses}</option>
              <option value="PENDING">{labels.statusPending}</option>
              <option value="APPROVED">{labels.statusApproved}</option>
              <option value="REJECTED">{labels.statusRejected}</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectPage}
                disabled={visible.length === 0 || isPending}
              />
              {labels.selectAllPage}
            </label>
            {selectedIds.length > 0 ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {labels.selectedCount.replace("{count}", String(selectedIds.length))}
                </span>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={runBulkApprove}
                >
                  {labels.bulkApprove}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setShowBulkReject((value) => !value)}
                >
                  {labels.bulkReject}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={runBulkDelete}
                >
                  {labels.bulkDelete}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={clearSelection}
                >
                  {labels.clearSelection}
                </Button>
              </>
            ) : null}
          </div>

          {showBulkReject && selectedIds.length > 0 ? (
            <div className="space-y-2 rounded-lg border p-3">
              <Label>{labels.bulkRejectReason}</Label>
              <Input
                value={bulkRejectReason}
                onChange={(event) => setBulkRejectReason(event.target.value)}
                placeholder={labels.rejectReason}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={runBulkReject}
                >
                  {labels.bulkReject}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowBulkReject(false);
                    setBulkRejectReason("");
                  }}
                >
                  {labels.clear}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="divide-y">
            {visible.map((review) => (
              <article key={review.id} className="grid gap-4 p-4 lg:grid-cols-[auto_1fr_auto]">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(review.id)}
                    onChange={() => toggleSelectOne(review.id)}
                    aria-label={review.authorNameEn}
                    disabled={isPending}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{review.authorNameEn}</strong>
                    <Badge variant={review.status === "APPROVED" ? "success" : "secondary"}>
                      {statusLabel(review.status)}
                    </Badge>
                    <Badge variant="outline">{sourceLabel(review.source)}</Badge>
                    {review.isActive ? (
                      <Badge variant="success">{labels.active}</Badge>
                    ) : (
                      <Badge variant="secondary">{labels.inactive}</Badge>
                    )}
                    <RatingStars rating={review.rating} showValue />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[review.service?.nameEn, review.application?.trackingId]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {review.contentEn}
                  </p>
                  {review.moderationNote ? (
                    <p className="text-xs text-destructive">{review.moderationNote}</p>
                  ) : null}
                  {rejectingId === review.id ? (
                    <div className="space-y-2 rounded-lg border p-3">
                      <Label>{labels.rejectReason}</Label>
                      <Input
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => reject(review.id)}>
                          {labels.reject}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          {labels.clear}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Button size="icon" variant="outline" onClick={() => move(review, "up")} disabled={isPending} aria-label={labels.moveUp}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => move(review, "down")} disabled={isPending} aria-label={labels.moveDown}>
                    <ArrowDown className="size-4" />
                  </Button>
                  {review.status !== "APPROVED" ? (
                    <Button size="sm" onClick={() => approve(review.id)} disabled={isPending}>
                      <Check className="size-4" />
                      {labels.approve}
                    </Button>
                  ) : null}
                  {review.status !== "REJECTED" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectingId(review.id)}
                      disabled={isPending}
                    >
                      <X className="size-4" />
                      {labels.reject}
                    </Button>
                  ) : null}
                  {review.status === "APPROVED" ? (
                    <Button size="sm" variant="outline" onClick={() => togglePublish(review)} disabled={isPending}>
                      {review.isActive ? labels.inactive : labels.active}
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={() => setDraft(toDraft(review))} disabled={isPending}>
                    <Pencil className="size-4" />
                    {labels.edit}
                  </Button>
                  <Button variant="destructive" onClick={() => remove(review.id)} disabled={isPending}>
                    <Trash2 className="size-4" />
                    {labels.delete}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground">
          <span>{labels.results.replace("{count}", String(filtered.length))}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              {labels.previous}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              {labels.next}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border bg-card p-4 md:p-6">
        <h2 className="font-semibold">{draft.id ? labels.edit : labels.add}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={labels.author}>
            <Input value={draft.authorNameEn} onChange={(event) => updateDraft("authorNameEn", event.target.value)} maxLength={100} />
          </Field>
          <Field label={labels.context}>
            <Input value={draft.authorRoleEn} onChange={(event) => updateDraft("authorRoleEn", event.target.value)} maxLength={120} />
          </Field>
          <Field label={labels.service}>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.serviceId}
              onChange={(event) => updateDraft("serviceId", event.target.value)}
            >
              <option value="">—</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nameEn}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.content} className="md:col-span-2">
            <textarea
              value={draft.contentEn}
              onChange={(event) => updateDraft("contentEn", event.target.value)}
              maxLength={1200}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field label={labels.rating}>
            <div className="space-y-2">
              <Input
                type="number"
                min={1}
                max={5}
                step="0.1"
                value={draft.rating}
                onChange={(event) =>
                  updateDraft("rating", Number(event.target.value))
                }
              />
              <RatingStars rating={draft.rating} showValue />
            </div>
          </Field>
          <Field label={labels.displayOrder}>
            <Input type="number" min={0} max={9999} value={draft.displayOrder} onChange={(event) => updateDraft("displayOrder", Number(event.target.value))} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft("isActive", event.target.checked)} />
            {labels.active}
          </label>
        </div>
        <div className="flex gap-3 border-t pt-4">
          <Button type="button" onClick={save} disabled={isPending}>{labels.save}</Button>
          <Button type="button" variant="outline" onClick={() => setDraft(emptyDraft(nextDisplayOrder))}>{labels.clear}</Button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      {children}
    </div>
  );
}
