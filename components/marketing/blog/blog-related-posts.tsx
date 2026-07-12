import { BlogCard } from "@/components/marketing/blog-card";

type BlogRelatedPostsProps = {
  posts: Array<{
    slug: string;
    titleEn: string;
    excerptEn?: string | null;
    categoryEn?: string | null;
    authorNameEn?: string | null;
    readingTimeMinutes?: number | null;
    featuredImagePath?: string | null;
    featuredImageAltEn?: string | null;
    publishedAt?: Date | null;
    seoMeta?: {
      ogImage?: string | null;
    } | null;
  }>;
  locale: string;
  title: string;
  readMoreLabel: string;
  readingTimeLabel: string;
};

export function BlogRelatedPosts({
  posts,
  locale,
  title,
  readMoreLabel,
  readingTimeLabel,
}: BlogRelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
            locale={locale}
            readMoreLabel={readMoreLabel}
            readingTimeLabel={readingTimeLabel}
          />
        ))}
      </div>
    </section>
  );
}
