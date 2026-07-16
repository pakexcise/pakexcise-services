"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SeoFieldsSection } from "@/features/cms/components/seo-fields-section";
import { updateSeoMetaAction } from "@/features/seo/admin/actions/seo-meta-actions";
import { Button } from "@/components/ui/button";
import type { SeoMetaInput } from "@/lib/validations/admin-seo";

type SeoMetaEditorFormProps = {
  seoId: string;
  pageKey: string;
  linkedEntityLabel: string;
  sourceEditHref: Route | null;
  initialValues: SeoMetaInput;
  labels: {
    save: string;
    cancel: string;
    saving: string;
    pageKey: string;
    linkedEntity: string;
    openSource: string;
    sectionTitle: string;
    metaTitleEn: string;
    metaDescriptionEn: string;
    h1En: string;
    focusKeywords: string;
    focusKeywordsHint: string;
    canonicalUrl: string;
    ogTitleEn: string;
    ogDescriptionEn: string;
    ogImage: string;
    twitterCard: string;
    robotsIndex: string;
    robotsFollow: string;
  };
};

export function SeoMetaEditorForm({
  seoId,
  pageKey,
  linkedEntityLabel,
  sourceEditHref,
  initialValues,
  labels,
}: SeoMetaEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await updateSeoMetaAction({ id: seoId, seo: values });
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
      <section className="rounded-xl border p-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{labels.pageKey}</dt>
            <dd className="mt-1 font-mono text-xs">{pageKey}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.linkedEntity}</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <span>{linkedEntityLabel}</span>
              {sourceEditHref ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={sourceEditHref as Route}>{labels.openSource}</Link>
                </Button>
              ) : null}
            </dd>
          </div>
        </dl>
      </section>

      <SeoFieldsSection
        value={values}
        onChange={setValues}
        showFocusKeywords
        labels={{
          title: labels.sectionTitle,
          metaTitleEn: labels.metaTitleEn,
          metaDescriptionEn: labels.metaDescriptionEn,
          h1En: labels.h1En,
          focusKeywords: labels.focusKeywords,
          focusKeywordsHint: labels.focusKeywordsHint,
          canonicalUrl: labels.canonicalUrl,
          ogTitleEn: labels.ogTitleEn,
          ogDescriptionEn: labels.ogDescriptionEn,
          ogImage: labels.ogImage,
          twitterCard: labels.twitterCard,
          robotsIndex: labels.robotsIndex,
          robotsFollow: labels.robotsFollow,
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/seo">{labels.cancel}</Link>
        </Button>
      </div>
    </div>
  );
}
