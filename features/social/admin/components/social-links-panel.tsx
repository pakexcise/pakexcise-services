"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useOptimistic, useState, useTransition } from "react";

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
  TableRow,
} from "@/components/ui/table";
import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  reorderSocialLinksAction,
  toggleSocialLinkActiveAction,
  updateSocialLinkAction,
} from "@/features/social/admin/actions/social-actions";
import type { SocialPanelLabels } from "@/features/social/admin/lib/labels";
import type { AdminSocialLinkItem } from "@/server/repositories/admin-social-repository";

type SocialLinksPanelProps = {
  links: AdminSocialLinkItem[];
  labels: SocialPanelLabels;
  nextDisplayOrder: number;
};

type LinkDraft = {
  id?: string;
  platform: string;
  url: string;
  iconName: string;
  labelEn: string;
  labelUr: string;
  isActive: boolean;
  displayOrder: number;
};

function emptyDraft(displayOrder: number): LinkDraft {
  return {
    platform: "",
    url: "",
    iconName: "Link",
    labelEn: "",
    labelUr: "",
    isActive: true,
    displayOrder,
  };
}

function linkToDraft(link: AdminSocialLinkItem): LinkDraft {
  return {
    id: link.id,
    platform: link.platform,
    url: link.url,
    iconName: link.iconName,
    labelEn: link.labelEn,
    labelUr: link.labelUr,
    isActive: link.isActive,
    displayOrder: link.displayOrder,
  };
}

export function SocialLinksPanel({
  links,
  labels,
  nextDisplayOrder,
}: SocialLinksPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<LinkDraft>(emptyDraft(nextDisplayOrder));
  const [error, setError] = useState<string | null>(null);

  function updateDraft<K extends keyof LinkDraft>(key: K, value: LinkDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    setError(null);

    startTransition(async () => {
      try {
        const result = draft.id
          ? await updateSocialLinkAction(draft)
          : await createSocialLinkAction(draft);

        if (!result.success) {
          setError(result.error);
          return;
        }

        setDraft(emptyDraft(nextDisplayOrder));
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
      const result = await deleteSocialLinkAction({ id });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function move(link: AdminSocialLinkItem, direction: "up" | "down") {
    const sorted = [...links].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((item) => item.id === link.id);

    if (index < 0) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= sorted.length) {
      return;
    }

    const current = sorted[index];
    const target = sorted[swapIndex];

    if (!current || !target) {
      return;
    }

    startTransition(async () => {
      await reorderSocialLinksAction({
        items: [
          { id: current.id, displayOrder: target.displayOrder },
          { id: target.id, displayOrder: current.displayOrder },
        ],
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <p className="rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-muted-foreground">
        {labels.whatsappNotice}
      </p>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{labels.existing}</h2>
        </div>
        {links.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labels.displayOrder}</TableHead>
                <TableHead>{labels.platform}</TableHead>
                <TableHead>{labels.url}</TableHead>
                <TableHead>{labels.iconName}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.displayOrder}</TableCell>
                  <TableCell className="font-mono text-xs">{link.platform}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {link.url}
                  </TableCell>
                  <TableCell>{link.iconName}</TableCell>
                  <TableCell>
                    <SocialActiveToggle link={link} labels={labels} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={labels.moveUp}
                        disabled={isPending}
                        onClick={() => move(link, "up")}
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={labels.moveDown}
                        disabled={isPending}
                        onClick={() => move(link, "down")}
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => setDraft(linkToDraft(link))}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                        {labels.edit}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        {labels.delete}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="space-y-4 rounded-xl border p-4 md:p-6">
        <h2 className="text-sm font-semibold">
          {draft.id ? labels.editLink : labels.addLink}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={labels.platform}>
            <Input
              value={draft.platform}
              onChange={(event) => updateDraft("platform", event.target.value)}
              placeholder="facebook"
            />
          </Field>
          <Field label={labels.iconName}>
            <Input
              value={draft.iconName}
              onChange={(event) => updateDraft("iconName", event.target.value)}
              placeholder="Facebook"
            />
          </Field>
          <Field label={labels.url} className="md:col-span-2">
            <Input
              value={draft.url}
              onChange={(event) => updateDraft("url", event.target.value)}
              placeholder="https://"
            />
          </Field>
          <Field label={labels.labelEn}>
            <Input
              value={draft.labelEn}
              onChange={(event) => updateDraft("labelEn", event.target.value)}
            />
          </Field>
          <Field label={labels.labelUr}>
            <Input
              value={draft.labelUr}
              onChange={(event) => updateDraft("labelUr", event.target.value)}
              dir="rtl"
            />
          </Field>
          <Field label={labels.displayOrder}>
            <Input
              type="number"
              min={0}
              value={draft.displayOrder}
              onChange={(event) =>
                updateDraft("displayOrder", Number(event.target.value))
              }
            />
          </Field>
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => updateDraft("isActive", event.target.checked)}
            />
            {labels.isActive}
          </label>
        </div>
        <div className="flex flex-wrap gap-3 border-t pt-4">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {labels.saveLink}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(emptyDraft(nextDisplayOrder))}
          >
            {labels.clear}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SocialActiveToggle({
  link,
  labels,
}: {
  link: AdminSocialLinkItem;
  labels: SocialPanelLabels;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(
    link.isActive,
    (_current, optimisticValue: boolean) => optimisticValue,
  );

  function handleToggle() {
    const next = !optimisticActive;

    startTransition(async () => {
      setOptimisticActive(next);
      const result = await toggleSocialLinkActiveAction({
        id: link.id,
        isActive: next,
      });

      if (!result.success) {
        setOptimisticActive(link.isActive);
        return;
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex"
    >
      <Badge variant={optimisticActive ? "success" : "secondary"}>
        {optimisticActive ? labels.active : labels.inactive}
      </Badge>
    </button>
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
