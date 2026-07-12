export type BlogContentFaq = {
  questionEn: string;
  answerEn: string;
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
  excerptEn?: string | null;
  categoryEn?: string | null;
  authorNameEn?: string | null;
  readingTimeMinutes?: number | null;
  featuredImagePath?: string | null;
  featuredImageAltEn?: string | null;
  isFeatured?: boolean;
  publishedAt?: Date | null;
  updatedAt?: Date;
  tags?: string[];
  seoMeta?: {
    ogImage?: string | null;
  } | null;
};
