import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { BlogEditorForm } from "@/features/blog/admin/components/blog-editor-form";
import { mergeBlogEditorDefaults } from "@/features/blog/lib/editor-defaults";
import { parseBlogContentFaqs } from "@/features/blog/lib/content-faqs";
import { seoFromRecord } from "@/features/cms/lib/default-seo";
import { loadBlogCategoryOptions } from "@/features/cms/lib/load-blog-category-options";
import { loadCmsEditorOptions } from "@/features/cms/lib/load-editor-options";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminBlogRepository } from "@/server/repositories/admin-blog-repository";
type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.blog");
  return adminMetadata(`Edit | ${t("title")}`);
}

export default async function AdminBlogEditPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.resources.blog");

  const [post, options, categoryOptions] = await Promise.all([
    adminBlogRepository.findById(id),
    loadCmsEditorOptions(),
    loadBlogCategoryOptions(locale),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Edit: ${post.titleEn}`} description={t("description")} />
      <BlogEditorForm
        mode="edit"
        postId={post.id}
        initialValues={mergeBlogEditorDefaults({
          slug: post.slug,
          titleEn: post.titleEn,
          excerptEn: post.excerptEn ?? "",
          contentEn: post.contentEn,
          categoryEn: post.categoryEn ?? "",
          categoryId: post.categoryId ?? "",
          subCategoryId: post.subCategoryId ?? "",
          tags: post.tags ?? [],
          authorNameEn: post.authorNameEn ?? "",
          readingTimeMinutes: post.readingTimeMinutes?.toString() ?? "",
          featuredImagePath: post.featuredImagePath ?? "",
          featuredImageTitleEn: post.featuredImageTitleEn ?? "",
          featuredImageAltEn: post.featuredImageAltEn ?? "",
          featuredImageCaptionEn: post.featuredImageCaptionEn ?? "",
          focusKeywords: post.focusKeywords ?? "",
          isFeatured: post.isFeatured,
          showTableOfContents: post.showTableOfContents,
          contentFaqs: parseBlogContentFaqs(post.contentFaqs),
          ctaTitleEn: post.ctaTitleEn ?? "",
          ctaDescriptionEn: post.ctaDescriptionEn ?? "",
          ctaWhatsappLabelEn: post.ctaWhatsappLabelEn ?? "",
          ctaRequestLabelEn: post.ctaRequestLabelEn ?? "",
          ctaAccountLabelEn: post.ctaAccountLabelEn ?? "",
          relatedServiceIds: post.relatedServiceIds.filter((id) =>
            options.services.some((service) => service.id === id),
          ),
          attachedFaqIds: post.attachedFaqIds.filter((id) =>
            options.faqs.some((faq) => faq.id === id),
          ),
          isPublished: post.isPublished,
          seo: seoFromRecord(post.seoMeta),
        })}
        services={options.services}
        faqs={options.faqs}
        categoryParents={categoryOptions.parents}
        categoryChildrenByParent={categoryOptions.childrenByParent}
      />
    </div>
  );
}
