"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  deleteChecklistItemAction,
  upsertChecklistItemAction} from "@/features/services/admin/actions/checklist-item-actions";
import type { AdminChecklistItem } from "@/server/repositories/checklist-item-repository";

import { useRouter } from "next/navigation";
type ChecklistItemsPanelProps = {
  items: AdminChecklistItem[];
  labels: Record<string, string>;
};

type ItemDraft = {
  id?: string;
  slug: string;
  nameEn: string;
  descriptionEn: string;
  itemType: AdminChecklistItem["itemType"];
  displayOrder: number;
  isActive: boolean;
};

function emptyDraft(displayOrder: number): ItemDraft {
  return {
    slug: "",
    nameEn: "",
    descriptionEn: "",
    itemType: "DOCUMENT",
    displayOrder,
    isActive: true};
}

export function ChecklistItemsPanel({
  items,
  labels}: ChecklistItemsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ItemDraft>(
    emptyDraft(items.length + 1));
  const [error, setError] = useState<string | null>(null);

  function loadItem(item: AdminChecklistItem) {
    setDraft({
      id: item.id,
      slug: item.slug,
      nameEn: item.nameEn,
      descriptionEn: item.descriptionEn ?? "",
      itemType: item.itemType,
      displayOrder: item.displayOrder,
      isActive: item.isActive});
    setError(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await upsertChecklistItemAction(draft);
      if (!result.success) {
        setError(result.error ?? labels.saveFailed);
        return;
      }
      setDraft(emptyDraft(items.length + 1));
      setError(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteChecklistItemAction({ id });
      if (!result.success) {
        setError(result.error ?? labels.deleteFailed);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {labels.empty}
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.nameEn}</p>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? labels.active : labels.inactive}
                  </Badge>
                  <Badge variant="outline">{item.itemType}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => loadItem(item)}>
                  {labels.edit}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                >
                  {labels.delete}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold">
          {draft.id ? labels.editTitle : labels.createTitle}
        </h2>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="slug">{labels.slug}</Label>
            <Input
              id="slug"
              value={draft.slug}
              onChange={(event) =>
                setDraft((current) => ({ ...current, slug: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="nameEn">{labels.nameEn}</Label>
            <Input
              id="nameEn"
              value={draft.nameEn}
              onChange={(event) =>
                setDraft((current) => ({ ...current, nameEn: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="itemType">{labels.itemType}</Label>
            <select
              id="itemType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={draft.itemType}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  itemType: event.target.value as ItemDraft["itemType"]}))
              }
            >
              {[
                "DOCUMENT",
                "TEXT_FIELD",
                "SELECT_FIELD",
                "NOTE",
                "BIOMETRIC",
                "INSPECTION",
                "DELIVERY_INSTRUCTION"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="descriptionEn">{labels.descriptionEn}</Label>
            <Textarea
              id="descriptionEn"
              value={draft.descriptionEn}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  descriptionEn: event.target.value}))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="displayOrder">{labels.displayOrder}</Label>
            <Input
              id="displayOrder"
              type="number"
              value={draft.displayOrder}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  displayOrder: Number(event.target.value)}))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  isActive: event.target.checked}))
              }
            />
            {labels.active}
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? labels.saving : labels.save}
          </Button>
          {draft.id ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft(emptyDraft(items.length + 1))}
            >
              {labels.cancel}
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{labels.assignHint}</p>
      </div>
    </div>
  );
}
