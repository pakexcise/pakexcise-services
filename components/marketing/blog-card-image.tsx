import Image from "next/image";

import { SiteLogo } from "@/components/shared/SiteLogo";
import { resolveBlogFeaturedImage } from "@/lib/i18n/blog-featured-image";
import { cn } from "@/lib/utils";

type BlogCardImageProps = {
  post: {
    featuredImagePath?: string | null;
    seoMeta?: {
      ogImage?: string | null;
    } | null;
  };
  title: string;
  className?: string;
};

export function BlogCardImage({
  post,
  title,
  className,
}: BlogCardImageProps) {
  const imageUrl = resolveBlogFeaturedImage(post);

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden bg-muted/20",
        className,
      )}
    >
      {!imageUrl ? (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8">
          <SiteLogo variant="icon" size="iconLarge" priority={false} />
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={title}
          fill
          quality={90}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
        />
      )}
    </div>
  );
}
