import { BlogCard } from "@/components/marketing/blog-card";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type HomeBlogSectionProps = {
  title: string;
  description: string;
  posts: Array<{
    slug: string;
    titleEn: string;
    titleUr: string;
    excerptEn?: string | null;
    excerptUr?: string | null;
    publishedAt?: Date | null;
    seoMeta?: { ogImage?: string | null } | null;
  }>;
  locale: string;
  readMoreLabel: string;
  viewAllLabel: string;
  emptyMessage: string;
  tone?: "default" | "muted" | "accent";
  className?: string;
};

export function HomeBlogSection({
  title,
  description,
  posts,
  locale,
  readMoreLabel,
  viewAllLabel,
  emptyMessage,
  tone = "default",
  className,
}: HomeBlogSectionProps) {
  return (
    <HomeSectionShell tone={tone} className={className}>
      <SectionHeader
        title={title}
        description={description}
        action={
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/blog">
              {viewAllLabel}
              <DirectionalArrow />
            </Link>
          </Button>
        }
      />

      {posts.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
              locale={locale}
              readMoreLabel={readMoreLabel}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center sm:hidden">
        <Button asChild variant="outline">
          <Link href="/blog">
            {viewAllLabel}
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    </HomeSectionShell>
  );
}
