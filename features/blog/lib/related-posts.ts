import type { PublicBlogPostCard } from "@/features/blog/types";

type RelatedPostCandidate = PublicBlogPostCard & {
  categoryEn?: string | null;
  tags?: string[];
};

export function rankRelatedBlogPosts(
  current: Pick<RelatedPostCandidate, "id" | "slug" | "categoryEn" | "tags">,
  candidates: RelatedPostCandidate[],
  limit = 3,
): RelatedPostCandidate[] {
  const currentTags = new Set((current.tags ?? []).map((tag) => tag.toLowerCase()));
  const scored = candidates
    .filter((post) => post.id !== current.id && post.slug !== current.slug)
    .map((post) => {
      let score = 0;

      if (
        current.categoryEn &&
        post.categoryEn &&
        current.categoryEn.toLowerCase() === post.categoryEn.toLowerCase()
      ) {
        score += 100;
      }

      for (const tag of post.tags ?? []) {
        if (currentTags.has(tag.toLowerCase())) {
          score += 10;
        }
      }

      const publishedAt = post.publishedAt?.getTime() ?? 0;
      return { post, score, publishedAt };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.publishedAt - a.publishedAt;
    });

  return scored.slice(0, limit).map((item) => item.post);
}
