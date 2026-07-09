"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { SeoFieldsSection } from "@/features/cms/components/seo-fields-section";
import {
  createBlogPostAction,
  updateBlogPostAction,
} from "@/features/blog/admin/actions/blog-actions";
import { BlogContentFormatGuide } from "@/features/blog/admin/components/blog-content-format-guide";
import { BlogImageUploadField } from "@/features/blog/admin/components/blog-image-upload-field";
import { BlogMarkdownEditor } from "@/features/blog/admin/components/blog-markdown-editor";
import {
  mergeBlogEditorDefaults,
} from "@/features/blog/lib/editor-defaults";
import type { BlogContentFaq } from "@/features/blog/types";
import { computeReadingTimeMinutes } from "@/features/blog/lib/reading-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import type { SeoMetaInput } from "@/lib/validations/admin-seo";

export type BlogEditorValues = {
  slug: string;
  titleEn: string;
  titleUr: string;
  excerptEn: string;
  excerptUr: string;
  contentEn: string;
  contentUr: string;
  categoryEn: string;
  categoryUr: string;
  tags: string[];
  authorNameEn: string;
  authorNameUr: string;
  readingTimeMinutes: string;
  featuredImagePath: string;
  featuredImageTitleEn: string;
  featuredImageTitleUr: string;
  featuredImageAltEn: string;
  featuredImageAltUr: string;
  featuredImageCaptionEn: string;
  featuredImageCaptionUr: string;
  focusKeywords: string;
  isFeatured: boolean;
  showTableOfContents: boolean;
  contentFaqs: BlogContentFaq[];
  ctaTitleEn: string;
  ctaTitleUr: string;
  ctaDescriptionEn: string;
  ctaDescriptionUr: string;
  ctaWhatsappLabelEn: string;
  ctaWhatsappLabelUr: string;
  ctaRequestLabelEn: string;
  ctaRequestLabelUr: string;
  ctaAccountLabelEn: string;
  ctaAccountLabelUr: string;
  relatedServiceIds: string[];
  attachedFaqIds: string[];
  isPublished: boolean;
  seo: SeoMetaInput;
};

type Option = { id: string; label: string };

type BlogEditorFormProps = {
  mode: "create" | "edit";
  postId?: string;
  initialValues: BlogEditorValues;
  services: Option[];
  faqs: Option[];
};

function emptyFaq(): BlogContentFaq {
  return {
    questionEn: "",
    questionUr: "",
    answerEn: "",
    answerUr: "",
  };
}

export function BlogEditorForm({
  mode,
  postId,
  initialValues,
  services,
  faqs,
}: BlogEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(() => mergeBlogEditorDefaults(initialValues));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const estimatedReadingTime = computeReadingTimeMinutes(
    values.contentEn || values.contentUr,
  );

  function toggleId(list: string[], id: string) {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  }

  function updateFaq(index: number, patch: Partial<BlogContentFaq>) {
    setValues((current) => ({
      ...current,
      contentFaqs: current.contentFaqs.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, ...patch } : faq,
      ),
    }));
  }

  function handleSubmit() {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const payload = {
        ...values,
        excerptEn: values.excerptEn || null,
        excerptUr: values.excerptUr || null,
        categoryEn: values.categoryEn || null,
        categoryUr: values.categoryUr || null,
        authorNameEn: values.authorNameEn || null,
        authorNameUr: values.authorNameUr || null,
        readingTimeMinutes: null,
        featuredImagePath: values.featuredImagePath || null,
        featuredImageTitleEn: values.featuredImageTitleEn || null,
        featuredImageTitleUr: values.featuredImageTitleUr || null,
        featuredImageAltEn: values.featuredImageAltEn || null,
        featuredImageAltUr: values.featuredImageAltUr || null,
        featuredImageCaptionEn: values.featuredImageCaptionEn || null,
        featuredImageCaptionUr: values.featuredImageCaptionUr || null,
        focusKeywords: values.focusKeywords || null,
        ctaTitleEn: values.ctaTitleEn || null,
        ctaTitleUr: values.ctaTitleUr || null,
        ctaDescriptionEn: values.ctaDescriptionEn || null,
        ctaDescriptionUr: values.ctaDescriptionUr || null,
        ctaWhatsappLabelEn: values.ctaWhatsappLabelEn || null,
        ctaWhatsappLabelUr: values.ctaWhatsappLabelUr || null,
        ctaRequestLabelEn: values.ctaRequestLabelEn || null,
        ctaRequestLabelUr: values.ctaRequestLabelUr || null,
        ctaAccountLabelEn: values.ctaAccountLabelEn || null,
        ctaAccountLabelUr: values.ctaAccountLabelUr || null,
        seo: values.seo,
        ...(mode === "edit" ? { id: postId } : {}),
      };

      const result =
        mode === "create"
          ? await createBlogPostAction(payload)
          : await updateBlogPostAction(payload);

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.push("/admin/blog");
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
          <Label htmlFor="titleEn">Title / H1 (English)</Label>
          <Input
            id="titleEn"
            value={values.titleEn}
            onChange={(e) => setValues((c) => ({ ...c, titleEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="titleUr">Title / H1 (Urdu)</Label>
          <Input
            id="titleUr"
            dir="rtl"
            value={values.titleUr}
            onChange={(e) => setValues((c) => ({ ...c, titleUr: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryEn">Category (English)</Label>
          <Input
            id="categoryEn"
            value={values.categoryEn}
            onChange={(e) => setValues((c) => ({ ...c, categoryEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryUr">Category (Urdu)</Label>
          <Input
            id="categoryUr"
            dir="rtl"
            value={values.categoryUr}
            onChange={(e) => setValues((c) => ({ ...c, categoryUr: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorNameEn">Author (English)</Label>
          <Input
            id="authorNameEn"
            value={values.authorNameEn}
            onChange={(e) => setValues((c) => ({ ...c, authorNameEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorNameUr">Author (Urdu)</Label>
          <Input
            id="authorNameUr"
            dir="rtl"
            value={values.authorNameUr}
            onChange={(e) => setValues((c) => ({ ...c, authorNameUr: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={values.tags.join(", ")}
            onChange={(e) =>
              setValues((c) => ({
                ...c,
                tags: e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="excerptEn">Excerpt (English)</Label>
          <Textarea
            id="excerptEn"
            rows={2}
            value={values.excerptEn}
            onChange={(e) => setValues((c) => ({ ...c, excerptEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="excerptUr">Excerpt (Urdu)</Label>
          <Textarea
            id="excerptUr"
            rows={2}
            dir="rtl"
            value={values.excerptUr}
            onChange={(e) => setValues((c) => ({ ...c, excerptUr: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <BlogContentFormatGuide title="Content formatting guide (English & Urdu)" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <BlogMarkdownEditor
            id="contentEn"
            label="Content (English)"
            value={values.contentEn}
            onChange={(contentEn) => setValues((c) => ({ ...c, contentEn }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <BlogMarkdownEditor
            id="contentUr"
            label="Content (Urdu)"
            value={values.contentUr}
            onChange={(contentUr) => setValues((c) => ({ ...c, contentUr }))}
            dir="rtl"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <p className="text-sm text-muted-foreground">
            Estimated reading time: <strong>{estimatedReadingTime} min</strong> (auto-calculated on save)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="focusKeywords">Focus keywords</Label>
          <Input
            id="focusKeywords"
            value={values.focusKeywords}
            onChange={(e) => setValues((c) => ({ ...c, focusKeywords: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(e) =>
              setValues((c) => ({ ...c, isPublished: e.target.checked }))
            }
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) =>
              setValues((c) => ({ ...c, isFeatured: e.target.checked }))
            }
          />
          Featured blog
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={values.showTableOfContents}
            onChange={(e) =>
              setValues((c) => ({ ...c, showTableOfContents: e.target.checked }))
            }
          />
          Show table of contents
        </label>
      </section>

      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <h3 className="text-sm font-semibold md:col-span-2">Featured image</h3>
        <p className="text-xs text-muted-foreground md:col-span-2">
          This image is shown on the blog page and used automatically for social sharing (OG).
          If you leave it empty, your site logo icon is used for OG previews.
        </p>
        <div className="md:col-span-2">
          <BlogImageUploadField
            label="Featured image"
            value={values.featuredImagePath}
            onChange={(featuredImagePath) =>
              setValues((c) => ({ ...c, featuredImagePath }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="featuredImageTitleEn">Image title (EN)</Label>
          <Input
            id="featuredImageTitleEn"
            value={values.featuredImageTitleEn}
            onChange={(e) =>
              setValues((c) => ({ ...c, featuredImageTitleEn: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="featuredImageTitleUr">Image title (UR)</Label>
          <Input
            id="featuredImageTitleUr"
            dir="rtl"
            value={values.featuredImageTitleUr}
            onChange={(e) =>
              setValues((c) => ({ ...c, featuredImageTitleUr: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="featuredImageAltEn">Image alt text (EN)</Label>
          <Input
            id="featuredImageAltEn"
            value={values.featuredImageAltEn}
            onChange={(e) =>
              setValues((c) => ({ ...c, featuredImageAltEn: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="featuredImageAltUr">Image alt text (UR)</Label>
          <Input
            id="featuredImageAltUr"
            dir="rtl"
            value={values.featuredImageAltUr}
            onChange={(e) =>
              setValues((c) => ({ ...c, featuredImageAltUr: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="featuredImageCaptionEn">Image caption (EN)</Label>
          <Textarea
            id="featuredImageCaptionEn"
            rows={2}
            value={values.featuredImageCaptionEn}
            onChange={(e) =>
              setValues((c) => ({ ...c, featuredImageCaptionEn: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="featuredImageCaptionUr">Image caption (UR)</Label>
          <Textarea
            id="featuredImageCaptionUr"
            rows={2}
            dir="rtl"
            value={values.featuredImageCaptionUr}
            onChange={(e) =>
              setValues((c) => ({ ...c, featuredImageCaptionUr: e.target.value }))
            }
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Inline FAQs</h3>
            <p className="text-xs text-muted-foreground">
              Default FAQs are pre-filled. Edit, remove, or add more as needed.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setValues((c) => ({
                ...c,
                contentFaqs: [...c.contentFaqs, emptyFaq()],
              }))
            }
          >
            <Plus className="size-4" />
            Add FAQ
          </Button>
        </div>
        {values.contentFaqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inline FAQs added yet.</p>
        ) : (
          values.contentFaqs.map((faq, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">FAQ {index + 1}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setValues((c) => ({
                      ...c,
                      contentFaqs: c.contentFaqs.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Input
                placeholder="Question (EN)"
                value={faq.questionEn}
                onChange={(e) => updateFaq(index, { questionEn: e.target.value })}
              />
              <Input
                dir="rtl"
                placeholder="Question (UR)"
                value={faq.questionUr}
                onChange={(e) => updateFaq(index, { questionUr: e.target.value })}
              />
              <Textarea
                rows={3}
                placeholder="Answer (EN)"
                value={faq.answerEn}
                onChange={(e) => updateFaq(index, { answerEn: e.target.value })}
              />
              <Textarea
                rows={3}
                dir="rtl"
                placeholder="Answer (UR)"
                value={faq.answerUr}
                onChange={(e) => updateFaq(index, { answerUr: e.target.value })}
              />
            </div>
          ))
        )}
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <h3 className="text-sm font-semibold">CTA section</h3>
        <p className="text-xs text-muted-foreground">
          Default CTA text is pre-filled for all blogs. Edit only if this post needs custom CTA copy.
        </p>
        <div className="space-y-2">
          <Label htmlFor="ctaTitleEn">CTA heading (EN)</Label>
          <Input
            id="ctaTitleEn"
            value={values.ctaTitleEn}
            onChange={(e) => setValues((c) => ({ ...c, ctaTitleEn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaTitleUr">CTA heading (UR)</Label>
          <Input
            id="ctaTitleUr"
            dir="rtl"
            value={values.ctaTitleUr}
            onChange={(e) => setValues((c) => ({ ...c, ctaTitleUr: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ctaDescriptionEn">CTA description (EN)</Label>
          <Textarea
            id="ctaDescriptionEn"
            rows={3}
            value={values.ctaDescriptionEn}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaDescriptionEn: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ctaDescriptionUr">CTA description (UR)</Label>
          <Textarea
            id="ctaDescriptionUr"
            rows={3}
            dir="rtl"
            value={values.ctaDescriptionUr}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaDescriptionUr: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaWhatsappLabelEn">WhatsApp button (EN)</Label>
          <Input
            id="ctaWhatsappLabelEn"
            value={values.ctaWhatsappLabelEn}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaWhatsappLabelEn: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaWhatsappLabelUr">WhatsApp button (UR)</Label>
          <Input
            id="ctaWhatsappLabelUr"
            dir="rtl"
            value={values.ctaWhatsappLabelUr}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaWhatsappLabelUr: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaRequestLabelEn">Submit request button (EN)</Label>
          <Input
            id="ctaRequestLabelEn"
            value={values.ctaRequestLabelEn}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaRequestLabelEn: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaRequestLabelUr">Submit request button (UR)</Label>
          <Input
            id="ctaRequestLabelUr"
            dir="rtl"
            value={values.ctaRequestLabelUr}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaRequestLabelUr: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaAccountLabelEn">Apply with account button (EN)</Label>
          <Input
            id="ctaAccountLabelEn"
            value={values.ctaAccountLabelEn}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaAccountLabelEn: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaAccountLabelUr">Apply with account button (UR)</Label>
          <Input
            id="ctaAccountLabelUr"
            dir="rtl"
            value={values.ctaAccountLabelUr}
            onChange={(e) =>
              setValues((c) => ({ ...c, ctaAccountLabelUr: e.target.value }))
            }
          />
        </div>
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
        <h3 className="text-sm font-semibold">Attached global FAQs</h3>
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
        hideOgImage
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
          ogImage: "OG image (uses featured image automatically)",
          twitterCard: "Twitter card",
          robotsIndex: "Allow indexing",
          robotsFollow: "Allow following",
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {Object.keys(fieldErrors).length > 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <p className="font-medium">Please fix the following:</p>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            {Object.entries(fieldErrors).map(([field, messages]) =>
              (messages ?? []).map((message) => (
                <li key={`${field}-${message}`}>
                  {field}: {message}
                </li>
              )),
            )}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        {values.isPublished && values.slug ? (
          <Button type="button" variant="secondary" asChild>
            <Link href={`/blog/${values.slug}`} target="_blank">
              Preview
            </Link>
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
