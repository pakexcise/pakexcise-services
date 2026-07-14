"use client";

import { ArrowDown, ArrowUp, Pencil, Star, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createReviewAction,
  deleteReviewAction,
  reorderReviewsAction,
  toggleReviewActiveAction,
  updateReviewAction,
} from "@/features/reviews/admin/actions/review-actions";
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
  previous: string;
  next: string;
  results: string;
};

type ReviewDraft = {
  id?: string;
  authorNameEn: string;
  authorRoleEn: string;
  contentEn: string;
  rating: number;
  isActive: boolean;
  displayOrder: number;
};

function emptyDraft(displayOrder: number): ReviewDraft {
  return {
    authorNameEn: "",
    authorRoleEn: "",
    contentEn: "",
    rating: 5,
    isActive: false,
    displayOrder,
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
  };
}

export function ReviewsPanel({
  reviews,
  nextDisplayOrder,
  labels,
}: {
  reviews: AdminReviewItem[];
  nextDisplayOrder: number;
  labels: ReviewPanelLabels;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ReviewDraft>(emptyDraft(nextDisplayOrder));
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const sorted = useMemo(
    () =>
      [...reviews].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          a.createdAt.getTime() - b.createdAt.getTime(),
      ),
    [reviews],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sorted.filter((review) => {
      const matchesStatus =
        status === "all" ||
        (status === "published" ? review.isActive : !review.isActive);
      const matchesQuery =
        !needle ||
        [review.authorNameEn, review.authorRoleEn ?? "", review.contentEn].some(
          (value) => value.toLowerCase().includes(needle),
        );
      return matchesStatus && matchesQuery;
    });
  }, [query, sorted, status]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateDraft<K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const result = draft.id
          ? await updateReviewAction(draft)
          : await createReviewAction(draft);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setDraft(emptyDraft(nextDisplayOrder + (draft.id ? 0 : 1)));
        router.refresh();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : labels.saveFailed);
      }
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
      router.refresh();
    });
  }

  function toggle(review: AdminReviewItem) {
    startTransition(async () => {
      const result = await toggleReviewActiveAction({
        id: review.id,
        isActive: !review.isActive,
      });
      if (!result.success) setError(result.error);
      router.refresh();
    });
  }

  function move(review: AdminReviewItem, direction: "up" | "down") {
    const index = sorted.findIndex((item) => item.id === review.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const target = sorted[swapIndex];
    if (index < 0 || !target) return;

    startTransition(async () => {
      const result = await reorderReviewsAction({
        items: [
          { id: review.id, displayOrder: target.displayOrder },
          { id: target.id, displayOrder: review.displayOrder },
        ],
      });
      if (!result.success) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-secondary/40 bg-secondary/10 p-4 text-sm leading-relaxed">
        {labels.authenticityNotice}
      </p>
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
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
              }}
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as typeof status);
                setPage(1);
              }}
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">{labels.allStatuses}</option>
              <option value="published">{labels.active}</option>
              <option value="draft">{labels.inactive}</option>
            </select>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="divide-y">
            {visible.map((review) => (
              <article key={review.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{review.authorNameEn}</strong>
                    <Badge variant={review.isActive ? "success" : "secondary"}>
                      {review.isActive ? labels.active : labels.inactive}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-sm text-secondary">
                      {review.rating}
                      <Star className="size-3.5 fill-current" aria-hidden="true" />
                    </span>
                  </div>
                  {review.authorRoleEn ? (
                    <p className="text-xs text-muted-foreground">{review.authorRoleEn}</p>
                  ) : null}
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {review.contentEn}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Button size="icon" variant="outline" onClick={() => move(review, "up")} disabled={isPending} aria-label={labels.moveUp}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => move(review, "down")} disabled={isPending} aria-label={labels.moveDown}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setDraft(toDraft(review))} disabled={isPending}>
                    <Pencil className="size-4" />
                    {labels.edit}
                  </Button>
                  <Button variant="outline" onClick={() => toggle(review)} disabled={isPending}>
                    {review.isActive ? labels.inactive : labels.active}
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
            <Input type="number" min={1} max={5} value={draft.rating} onChange={(event) => updateDraft("rating", Number(event.target.value))} />
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
