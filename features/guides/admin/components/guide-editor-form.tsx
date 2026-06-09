"use client";

import { useState, useTransition } from "react";

import { SeoFieldsSection } from "@/features/cms/components/seo-fields-section";
import { emptySeoInput } from "@/features/cms/lib/default-seo";
import {
  createGuideAction,
  updateGuideAction,
} from "@/features/guides/admin/actions/guide-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import type { SeoMetaInput } from "@/lib/validations/admin-seo";

export type GuideEditorValues = {
  slug: string;
  titleEn: string;
  titleUr: string;
  excerptEn: string;
  excerptUr: string;
  contentEn: string;
  contentUr: string;
  relatedServiceIds: string[];
  attachedFaqIds: string[];
  isPublished: boolean;
  seo: SeoMetaInput;
};

type Option = { id: string; label: string };

type GuideEditorFormProps = {
  mode: "create" | "edit";
  guideId?: string;
  initialValues: GuideEditorValues;
  services: Option[];
  faqs: Option[];
};

export function GuideEditorForm({
  mode,
  guideId,
  initialValues,
  services,
  faqs,
}: GuideEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleId(list: string[], id: string) {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload = {
        ...values,
        excerptEn: values.excerptEn || null,
        excerptUr: values.excerptUr || null,
        seo: values.seo,
        ...(mode === "edit" ? { id: guideId } : {}),
      };

      const result =
        mode === "create"
          ? await createGuideAction(payload)
          : await updateGuideAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/guides");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={values.slug}
            onChange={(e) => setValues((c) => ({ ...c, slug: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="titleEn">Title (English)</Label>
          <Input
            id="titleEn"
            value={values.titleEn}
            onChange={(e) => setValues((c) => ({ ...c, titleEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="titleUr">Title (Urdu)</Label>
          <Input
            id="titleUr"
            dir="rtl"
            value={values.titleUr}
            onChange={(e) => setValues((c) => ({ ...c, titleUr: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contentEn">Content (English)</Label>
          <Textarea
            id="contentEn"
            rows={12}
            value={values.contentEn}
            onChange={(e) => setValues((c) => ({ ...c, contentEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contentUr">Content (Urdu)</Label>
          <Textarea
            id="contentUr"
            rows={12}
            dir="rtl"
            value={values.contentUr}
            onChange={(e) => setValues((c) => ({ ...c, contentUr: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(e) =>
              setValues((c) => ({ ...c, isPublished: e.target.checked }))
            }
          />
          Published
        </label>
      </section>

      <section className="space-y-3 rounded-xl border p-4">
        <h3 className="text-sm font-semibold">Related services</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label key={service.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.relatedServiceIds.includes(service.id)}
                onChange={() =>
                  setValues((c) => ({
                    ...c,
                    relatedServiceIds: toggleId(c.relatedServiceIds, service.id),
                  }))
                }
              />
              {service.label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border p-4">
        <h3 className="text-sm font-semibold">Attached FAQs</h3>
        <div className="grid gap-2">
          {faqs.map((faq) => (
            <label key={faq.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.attachedFaqIds.includes(faq.id)}
                onChange={() =>
                  setValues((c) => ({
                    ...c,
                    attachedFaqIds: toggleId(c.attachedFaqIds, faq.id),
                  }))
                }
              />
              {faq.label}
            </label>
          ))}
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
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/guides")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function createEmptyGuideValues(): GuideEditorValues {
  return {
    slug: "",
    titleEn: "",
    titleUr: "",
    excerptEn: "",
    excerptUr: "",
    contentEn: "",
    contentUr: "",
    relatedServiceIds: [],
    attachedFaqIds: [],
    isPublished: false,
    seo: { ...emptySeoInput },
  };
}
