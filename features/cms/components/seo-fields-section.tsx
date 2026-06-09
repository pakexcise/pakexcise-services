"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SeoMetaInput } from "@/lib/validations/admin-seo";

type SeoFieldsSectionProps = {
  value: SeoMetaInput;
  onChange: (value: SeoMetaInput) => void;
  labels: {
    title: string;
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

export function SeoFieldsSection({
  value,
  onChange,
  labels,
}: SeoFieldsSectionProps) {
  function update<K extends keyof SeoMetaInput>(key: K, next: SeoMetaInput[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <section className="space-y-4 rounded-xl border p-4">
      <h3 className="text-sm font-semibold">{labels.title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="metaTitleEn">{labels.metaTitleEn}</Label>
          <Input
            id="metaTitleEn"
            value={value.metaTitleEn ?? ""}
            onChange={(e) => update("metaTitleEn", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaTitleUr">{labels.metaTitleUr}</Label>
          <Input
            id="metaTitleUr"
            value={value.metaTitleUr ?? ""}
            onChange={(e) => update("metaTitleUr", e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="metaDescriptionEn">{labels.metaDescriptionEn}</Label>
          <Textarea
            id="metaDescriptionEn"
            rows={3}
            value={value.metaDescriptionEn ?? ""}
            onChange={(e) => update("metaDescriptionEn", e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="metaDescriptionUr">{labels.metaDescriptionUr}</Label>
          <Textarea
            id="metaDescriptionUr"
            rows={3}
            value={value.metaDescriptionUr ?? ""}
            onChange={(e) => update("metaDescriptionUr", e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h1En">{labels.h1En}</Label>
          <Input
            id="h1En"
            value={value.h1En ?? ""}
            onChange={(e) => update("h1En", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h1Ur">{labels.h1Ur}</Label>
          <Input
            id="h1Ur"
            value={value.h1Ur ?? ""}
            onChange={(e) => update("h1Ur", e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="canonicalUrl">{labels.canonicalUrl}</Label>
          <Input
            id="canonicalUrl"
            value={value.canonicalUrl ?? ""}
            onChange={(e) => update("canonicalUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ogTitleEn">{labels.ogTitleEn}</Label>
          <Input
            id="ogTitleEn"
            value={value.ogTitleEn ?? ""}
            onChange={(e) => update("ogTitleEn", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ogTitleUr">{labels.ogTitleUr}</Label>
          <Input
            id="ogTitleUr"
            value={value.ogTitleUr ?? ""}
            onChange={(e) => update("ogTitleUr", e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ogImage">{labels.ogImage}</Label>
          <Input
            id="ogImage"
            value={value.ogImage ?? ""}
            onChange={(e) => update("ogImage", e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ogDescriptionEn">{labels.ogDescriptionEn}</Label>
          <Textarea
            id="ogDescriptionEn"
            rows={2}
            value={value.ogDescriptionEn ?? ""}
            onChange={(e) => update("ogDescriptionEn", e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ogDescriptionUr">{labels.ogDescriptionUr}</Label>
          <Textarea
            id="ogDescriptionUr"
            rows={2}
            value={value.ogDescriptionUr ?? ""}
            onChange={(e) => update("ogDescriptionUr", e.target.value)}
            dir="rtl"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.robotsIndex}
            onChange={(e) => update("robotsIndex", e.target.checked)}
          />
          {labels.robotsIndex}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.robotsFollow}
            onChange={(e) => update("robotsFollow", e.target.checked)}
          />
          {labels.robotsFollow}
        </label>
      </div>
    </section>
  );
}
