"use client";

import { useState, useTransition } from "react";

import {
  createRedirectAction,
  updateRedirectAction,
} from "@/features/redirects/admin/actions/redirect-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

type RedirectEditorValues = {
  oldSlug: string;
  newSlug: string;
  statusCode: number;
  isActive: boolean;
};

type RedirectEditorFormProps = {
  mode: "create" | "edit";
  redirectId?: string;
  initialValues: RedirectEditorValues;
};

export function RedirectEditorForm({
  mode,
  redirectId,
  initialValues,
}: RedirectEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload =
        mode === "create"
          ? values
          : { id: redirectId!, ...values };

      const result =
        mode === "create"
          ? await createRedirectAction(payload)
          : await updateRedirectAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/redirects");
      router.refresh();
    });
  }

  return (
    <div className="max-w-xl space-y-4 rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">
        Page redirects use paths: <code>/faqs</code> → <code>/help</code>.
        Service renames use bare slugs: <code>old-service</code> →{" "}
        <code>new-service</code>. Content uses <code>blog:old-slug</code> /{" "}
        <code>guide:old-slug</code>. Built-in legal/region/legacy service aliases
        are already handled by the app.
      </p>
      <div className="space-y-2">
        <Label htmlFor="oldSlug">Old path / slug</Label>
        <Input
          id="oldSlug"
          value={values.oldSlug}
          placeholder="/faqs or old-service-slug"
          onChange={(e) => setValues((c) => ({ ...c, oldSlug: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newSlug">New path / slug</Label>
        <Input
          id="newSlug"
          value={values.newSlug}
          placeholder="/help or new-service-slug"
          onChange={(e) => setValues((c) => ({ ...c, newSlug: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="statusCode">Status code</Label>
        <Input
          id="statusCode"
          type="number"
          value={values.statusCode}
          onChange={(e) =>
            setValues((c) => ({ ...c, statusCode: Number(e.target.value) }))
          }
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => setValues((c) => ({ ...c, isActive: e.target.checked }))}
        />
        Active
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/redirects")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
