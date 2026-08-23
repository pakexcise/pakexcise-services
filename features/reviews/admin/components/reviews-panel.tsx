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
  allRecordTypes: string;
  recordTypeDummy: string;
  recordTypeReal: string;
  labelDummy: string;
  labelReal: string;
  isDummy: string;
  selectedCount: string;
  bulkApprove: string;
  bulkReject: string;
  bulkDelete: string;
  confirmBulkDelete: string;
  bulkRejectReason: string;
  selectAll: string;
  clearSelection: string;
  downloadCsv: string;
  allCategories: string;
  uncategorized: string;
  sortBy: string;
  sortLatest: string;
  sortDisplayOrder: string;
  sortCategory: string;
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
  isDummy: boolean;
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
    isDummy: true,
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
    isDummy: review.isDummy,
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
  const [recordType, setRecordType] = useState<"ALL" | "DUMMY" | "REAL">("ALL");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"latest" | "displayOrder" | "category">(
    "latest",
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);

  const byDisplayOrder = useMemo(
    () =>
      [...reviews].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      ),
    [reviews],
  );

  const sorted = useMemo(() => {
    const list = [...reviews];

    if (sortBy === "displayOrder") {
      return list.sort(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      );
    }

    if (sortBy === "category") {
      return list.sort((a, b) => {
        const aName = (a.service?.nameEn ?? "").toLocaleLowerCase();
        const bName = (b.service?.nameEn ?? "").toLocaleLowerCase();
        if (!aName && bName) return 1;
        if (aName && !bName) return -1;
        const byName = aName.localeCompare(bName);
        if (byName !== 0) return byName;
        const aTime = new Date(a.moderatedAt ?? a.submittedAt).getTime();
        const bTime = new Date(b.moderatedAt ?? b.submittedAt).getTime();
        return bTime - aTime;
      });
    }

    return list.sort((a, b) => {
      const aTime = new Date(a.moderatedAt ?? a.submittedAt).getTime();
      const bTime = new Date(b.moderatedAt ?? b.submittedAt).getTime();
      return bTime - aTime;
    });
  }, [reviews, sortBy]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sorted.filter((review) => {
      const matchesStatus = status === "ALL" || review.status === status;
      const matchesType =
        recordType === "ALL" ||
        (recordType === "DUMMY" ? review.isDummy : !review.isDummy);
      const matchesService =
        serviceFilter === "ALL" ||
        (serviceFilter === "NONE"
          ? !review.serviceId
          : review.serviceId === serviceFilter);
      const haystack = [
        review.authorNameEn,
        review.authorRoleEn ?? "",
        review.contentEn,
        review.service?.nameEn ?? "",
        review.application?.trackingId ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return (
        matchesStatus &&
        matchesType &&
        matchesService &&
        (!needle || haystack.includes(needle))
      );
    });
  }, [query, recordType, serviceFilter, sorted, status]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleIds = visible.map((review) => review.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
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
    const index = byDisplayOrder.findIndex((item) => item.id === review.id);
    const target = byDisplayOrder[direction === "up" ? index - 1 : index + 1];
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
        `${labels.syncSuccess} [${result.data.provider}] (+${result.data.imported} / ~${result.data.updated})`,
      );
      refreshReviewUi();
    });
  }

  function runBulkApprove() {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const result = await bulkApproveReviewsAction({ ids: selectedIds });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSelectedIds([]);
      refreshReviewUi();
    });
  }

  function runBulkReject() {
    if (selectedIds.length === 0) return;
    if (bulkRejectReason.trim().length < 5) {
      setError(labels.rejectReasonRequired);
      return;
    }
    startTransition(async () => {
      const result = await bulkRejectReviewsAction({
        ids: selectedIds,
        moderationNote: bulkRejectReason.trim(),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSelectedIds([]);
      setBulkRejectOpen(false);
      setBulkRejectReason("");
      refreshReviewUi();
    });
  }

  function runBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(labels.confirmBulkDelete)) return;
    startTransition(async () => {
      const result = await bulkDeleteReviewsAction({ ids: selectedIds });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSelectedIds([]);
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
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" asChild>
              <a href="/api/admin/reviews/export">{labels.downloadCsv}</a>
            </Button>
            <Button type="button" variant="outline" disabled={isPending} onClick={syncGoogle}>
              {isPending ? labels.syncing : labels.syncNow}
            </Button>
          </div>
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Input
              type="search"
              value={query}
              placeholder={labels.searchPlaceholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="sm:col-span-2 lg:col-span-1 xl:col-span-1"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as typeof status);
                setPage(1);
              }}
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              aria-label={labels.allStatuses}
            >
              <option value="ALL">{labels.allStatuses}</option>
              <option value="PENDING">{labels.statusPending}</option>
              <option value="APPROVED">{labels.statusApproved}</option>
              <option value="REJECTED">{labels.statusRejected}</option>
            </select>
            <select
              value={recordType}
              onChange={(event) => {
                setRecordType(event.target.value as typeof recordType);
                setPage(1);
              }}
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              aria-label={labels.allRecordTypes}
            >
              <option value="ALL">{labels.allRecordTypes}</option>
              <option value="DUMMY">{labels.recordTypeDummy}</option>
              <option value="REAL">{labels.recordTypeReal}</option>
            </select>
            <select
              value={serviceFilter}
              onChange={(event) => {
                setServiceFilter(event.target.value);
                setPage(1);
              }}
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              aria-label={labels.allCategories}
            >
              <option value="ALL">{labels.allCategories}</option>
              <option value="NONE">{labels.uncategorized}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nameEn}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as typeof sortBy);
                setPage(1);
              }}
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              aria-label={labels.sortBy}
            >
              <option value="latest">{labels.sortLatest}</option>
              <option value="category">{labels.sortCategory}</option>
              <option value="displayOrder">{labels.sortDisplayOrder}</option>
            </select>
          </div>
          {selectedIds.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {labels.selectedCount.replace("{count}", String(selectedIds.length))}
                </span>
                <Button size="sm" onClick={runBulkApprove} disabled={isPending}>
                  {labels.bulkApprove}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBulkRejectOpen((open) => !open)}
                  disabled={isPending}
                >
                  {labels.bulkReject}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={runBulkDelete}
                  disabled={isPending}
                >
                  {labels.bulkDelete}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                  disabled={isPending}
                >
                  {labels.clearSelection}
                </Button>
              </div>
              {bulkRejectOpen ? (
                <div className="space-y-2">
                  <Label>{labels.bulkRejectReason}</Label>
                  <Input
                    value={bulkRejectReason}
                    onChange={(event) => setBulkRejectReason(event.target.value)}
                  />
                  <Button size="sm" variant="destructive" onClick={runBulkReject} disabled={isPending}>
                    {labels.bulkReject}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="divide-y">
            <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-2 text-sm">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                aria-label={labels.selectAll}
              />
              <span className="text-muted-foreground">{labels.selectAll}</span>
            </div>
            {visible.map((review) => (
              <article key={review.id} className="grid gap-4 p-4 lg:grid-cols-[auto_1fr_auto]">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(review.id)}
                    onChange={() => toggleSelect(review.id)}
                    aria-label={`Select ${review.authorNameEn}`}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{review.authorNameEn}</strong>
                    <Badge variant={review.status === "APPROVED" ? "success" : "secondary"}>
                      {statusLabel(review.status)}
                    </Badge>
                    <Badge variant="outline">{sourceLabel(review.source)}</Badge>
                    <Badge variant={review.isDummy ? "secondary" : "outline"}>
                      {review.isDummy ? labels.labelDummy : labels.labelReal}
                    </Badge>
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.isDummy} onChange={(event) => updateDraft("isDummy", event.target.checked)} />
            {labels.isDummy}
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
