"use client";

import { useState, useTransition } from "react";

import { SeoFieldsSection } from "@/features/cms/components/seo-fields-section";
import { MarkdownContentEditor } from "@/features/cms/components/markdown-content-editor";
import type { MarkdownContentEditorLabels } from "@/features/cms/components/markdown-content-editor";
import {
  createLegalPageAction,
  updateLegalPageAction,
} from "@/features/legal-pages/admin/actions/legal-page-actions";
import { isCanonicalLegalPageSlug } from "@/features/legal-pages/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import type { SeoMetaInput } from "@/lib/validations/admin-seo";

export type LegalPageEditorValues = {
  slug: string;
  titleEn: string;
  titleUr: string;
  excerptEn: string;
  excerptUr: string;
  contentEn: string;
  contentUr: string;
  isPublished: boolean;
  isActive: boolean;
  displayOrder: number;
  seo: SeoMetaInput;
};

type LegalPageEditorFormProps = {
  mode: "create" | "edit";
  pageId?: string;
  initialValues: LegalPageEditorValues;
  labels: {
    slug: string;
    slugLockedNote: string;
    titleEn: string;
    titleUr: string;
    excerptEn: string;
    excerptUr: string;
    contentEn: string;
    contentUr: string;
    contentHint: string;
    contentEditor: MarkdownContentEditorLabels;
    published: string;
    active: string;
    displayOrder: string;
    save: string;
    saved: string;
    saving: string;
    cancel: string;
    seoTitle: string;
    metaTitleEn: string;
    metaTitleUr: string;
    metaDescriptionEn: string;
    metaDescriptionUr: string;
    h1En: string;
    h1Ur: string;
    canonicalUrl: string;
    ogTitleEn: string;
    ogTitleUr: string;
    ogDescriptionEn: string;
    ogDescriptionUr: string;
    ogImage: string;
    twitterCard: string;
    robotsIndex: string;
    robotsFollow: string;
  };
};

export function LegalPageEditorForm({
  mode,
  pageId,
  initialValues,
  labels,
}: LegalPageEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const slugLocked = mode === "edit" && isCanonicalLegalPageSlug(initialValues.slug);

  function handleSubmit() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const payload = {
        ...values,
        excerptEn: values.excerptEn || null,
        excerptUr: values.excerptUr || null,
        seo: values.seo,
        ...(mode === "edit" ? { id: pageId } : {}),
      };

      const result =
        mode === "create"
          ? await createLegalPageAction(payload)
          : await updateLegalPageAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (mode === "create") {
        router.push(`/admin/legal-pages/${result.data.id}/edit`);
        router.refresh();
        return;
      }

      setSuccess(labels.saved);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="slug">{labels.slug}</Label>
          <Input
            id="slug"
            value={values.slug}
            disabled={slugLocked}
            onChange={(e) => setValues((current) => ({ ...current, slug: e.target.value }))}
          />
          {slugLocked ? (
            <p className="text-xs text-muted-foreground">{labels.slugLockedNote}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleEn">{labels.titleEn}</Label>
          <Input
            id="titleEn"
            value={values.titleEn}
            onChange={(e) => setValues((current) => ({ ...current, titleEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="titleUr">{labels.titleUr}</Label>
          <Input
            id="titleUr"
            dir="rtl"
            value={values.titleUr}
            onChange={(e) => setValues((current) => ({ ...current, titleUr: e.target.value }))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="excerptEn">{labels.excerptEn}</Label>
          <Textarea
            id="excerptEn"
            rows={3}
            value={values.excerptEn}
            onChange={(e) => setValues((current) => ({ ...current, excerptEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="excerptUr">{labels.excerptUr}</Label>
          <Textarea
            id="excerptUr"
            rows={3}
            dir="rtl"
            value={values.excerptUr}
            onChange={(e) => setValues((current) => ({ ...current, excerptUr: e.target.value }))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contentEn">{labels.contentEn}</Label>
          <MarkdownContentEditor
            id="contentEn"
            value={values.contentEn}
            onChange={(contentEn) => setValues((current) => ({ ...current, contentEn }))}
            labels={{ ...labels.contentEditor, hint: labels.contentHint }}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contentUr">{labels.contentUr}</Label>
          <MarkdownContentEditor
            id="contentUr"
            value={values.contentUr}
            onChange={(contentUr) => setValues((current) => ({ ...current, contentUr }))}
            dir="rtl"
            labels={{ ...labels.contentEditor, hint: labels.contentHint }}
          />
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="isPublished"
            type="checkbox"
            checked={values.isPublished}
            onChange={(e) =>
              setValues((current) => ({ ...current, isPublished: e.target.checked }))
            }
            className="size-4 rounded border"
          />
          <Label htmlFor="isPublished">{labels.published}</Label>
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="isActive"
            type="checkbox"
            checked={values.isActive}
            onChange={(e) =>
              setValues((current) => ({ ...current, isActive: e.target.checked }))
            }
            className="size-4 rounded border"
          />
          <Label htmlFor="isActive">{labels.active}</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayOrder">{labels.displayOrder}</Label>
          <Input
            id="displayOrder"
            type="number"
            min={0}
            value={values.displayOrder}
            onChange={(e) =>
              setValues((current) => ({
                ...current,
                displayOrder: Number(e.target.value) || 0,
              }))
            }
          />
        </div>
      </section>

      <SeoFieldsSection
        value={values.seo}
        onChange={(seo) => setValues((current) => ({ ...current, seo }))}
        labels={{
          title: labels.seoTitle,
          metaTitleEn: labels.metaTitleEn,
          metaTitleUr: labels.metaTitleUr,
          metaDescriptionEn: labels.metaDescriptionEn,
          metaDescriptionUr: labels.metaDescriptionUr,
          h1En: labels.h1En,
          h1Ur: labels.h1Ur,
          canonicalUrl: labels.canonicalUrl,
          ogTitleEn: labels.ogTitleEn,
          ogTitleUr: labels.ogTitleUr,
          ogDescriptionEn: labels.ogDescriptionEn,
          ogDescriptionUr: labels.ogDescriptionUr,
          ogImage: labels.ogImage,
          twitterCard: labels.twitterCard,
          robotsIndex: labels.robotsIndex,
          robotsFollow: labels.robotsFollow,
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/legal-pages")}>
          {labels.cancel}
        </Button>
      </div>
    </div>
  );
}
