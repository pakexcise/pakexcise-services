"use client";

import { useState, useTransition } from "react";

import { SeoFieldsSection } from "@/features/cms/components/seo-fields-section";
import { updatePageContentAction } from "@/features/seo/admin/actions/page-content-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import type { LegalPageKey } from "@/lib/validations/admin-page-content";
import type { SeoMetaInput } from "@/lib/validations/admin-seo";

type LegalPageEditorValues = {
  titleEn: string;
  titleUr: string;
  excerptEn: string;
  excerptUr: string;
  contentEn: string;
  contentUr: string;
  seo: SeoMetaInput;
};

type LegalPageEditorFormProps = {
  pageKey: LegalPageKey;
  initialValues: LegalPageEditorValues;
};

export function LegalPageEditorForm({
  pageKey,
  initialValues,
}: LegalPageEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await updatePageContentAction({
        pageKey,
        titleEn: values.titleEn,
        titleUr: values.titleUr,
        excerptEn: values.excerptEn || null,
        excerptUr: values.excerptUr || null,
        contentEn: values.contentEn,
        contentUr: values.contentUr,
        seo: values.seo,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/seo");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Title (EN)</Label>
          <Input
            value={values.titleEn}
            onChange={(e) => setValues((c) => ({ ...c, titleEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Title (UR)</Label>
          <Input
            dir="rtl"
            value={values.titleUr}
            onChange={(e) => setValues((c) => ({ ...c, titleUr: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Content (EN)</Label>
          <Textarea
            rows={14}
            value={values.contentEn}
            onChange={(e) => setValues((c) => ({ ...c, contentEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Content (UR)</Label>
          <Textarea
            rows={14}
            dir="rtl"
            value={values.contentUr}
            onChange={(e) => setValues((c) => ({ ...c, contentUr: e.target.value }))}
          />
        </div>
      </section>

      <SeoFieldsSection
        value={values.seo}
        onChange={(seo) => setValues((c) => ({ ...c, seo }))}
        labels={{
          title: "SEO metadata",
          metaTitleEn: "Meta title (EN)",
          metaTitleUr: "Meta title (UR)",
          metaDescriptionEn: "Meta description (EN)",
          metaDescriptionUr: "Meta description (UR)",
          h1En: "H1 (EN)",
          h1Ur: "H1 (UR)",
          canonicalUrl: "Canonical URL",
          ogTitleEn: "OG title (EN)",
          ogTitleUr: "OG title (UR)",
          ogDescriptionEn: "OG description (EN)",
          ogDescriptionUr: "OG description (UR)",
          ogImage: "OG image URL",
          twitterCard: "Twitter card",
          robotsIndex: "Allow indexing",
          robotsFollow: "Allow following",
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save legal page"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/seo")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
