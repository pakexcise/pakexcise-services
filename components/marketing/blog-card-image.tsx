import Image from "next/image";

import { SiteLogo } from "@/components/shared/SiteLogo";
import { resolveBlogFeaturedImage } from "@/lib/i18n/blog-featured-image";
import { cn } from "@/lib/utils";

type BlogCardImageProps = {
  post: {
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
        "relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10",
        className,
      )}
    >
      {!imageUrl ? (
        <div className="flex size-full items-center justify-center p-8">
          <SiteLogo
            variant="icon"
            imageClassName="size-16 sm:size-20"
            priority={false}
          />
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      )}
    </div>
  );
}
