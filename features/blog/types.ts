export type BlogContentFaq = {
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
};

export type BlogTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export type PublicBlogPostCard = {
  id: string;
  slug: string;
  titleEn: string;
  titleUr: string;
  excerptEn?: string | null;
  excerptUr?: string | null;
  categoryEn?: string | null;
  categoryUr?: string | null;
  authorNameEn?: string | null;
  authorNameUr?: string | null;
  readingTimeMinutes?: number | null;
  featuredImagePath?: string | null;
  featuredImageAltEn?: string | null;
  featuredImageAltUr?: string | null;
  isFeatured?: boolean;
  publishedAt?: Date | null;
  updatedAt?: Date;
  tags?: string[];
  seoMeta?: {
    ogImage?: string | null;
  } | null;
};
