import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { BlogEditorForm } from "@/features/blog/admin/components/blog-editor-form";
import { seoFromRecord } from "@/features/cms/lib/default-seo";
import { loadCmsEditorOptions } from "@/features/cms/lib/load-editor-options";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminBlogRepository } from "@/server/repositories/admin-blog-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.blog");
  return adminMetadata(`Edit | ${t("title")}`);
}

export default async function AdminBlogEditPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.blog");

  const [post, options] = await Promise.all([
    adminBlogRepository.findById(id),
    loadCmsEditorOptions(),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Edit: ${post.titleEn}`} description={t("description")} />
      <BlogEditorForm
        mode="edit"
        postId={post.id}
        initialValues={{
          slug: post.slug,
          titleEn: post.titleEn,
          titleUr: post.titleUr,
          excerptEn: post.excerptEn ?? "",
          excerptUr: post.excerptUr ?? "",
          contentEn: post.contentEn,
          contentUr: post.contentUr,
          relatedServiceIds: post.relatedServiceIds,
          attachedFaqIds: post.attachedFaqIds,
          isPublished: post.isPublished,
          seo: seoFromRecord(post.seoMeta),
        }}
        services={options.services}
        faqs={options.faqs}
      />
    </div>
  );
}
