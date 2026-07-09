import Image from "next/image";

import { BLOG_IMAGE_SPEC } from "@/features/blog/lib/image-spec";
import { cn } from "@/lib/utils";

type BlogResponsiveImageProps = {
  src: string;
  alt: string;
  title?: string;
  variant?: "hero" | "card" | "content";
  priority?: boolean;
  className?: string;
};

const VARIANTS = {
  hero: {
    width: BLOG_IMAGE_SPEC.featured.width,
    height: BLOG_IMAGE_SPEC.featured.height,
    sizes: `(max-width: 768px) 100vw, (max-width: 1280px) 90vw, ${BLOG_IMAGE_SPEC.displayMaxWidth}px`,
    wrapper: "rounded-2xl border bg-muted/30 shadow-sm",
    image: "h-auto w-full max-w-full object-contain",
  },
  card: {
    width: 800,
    height: 450,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
    wrapper: "overflow-hidden bg-muted/20",
    image: "h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]",
  },
  content: {
    width: BLOG_IMAGE_SPEC.content.width,
    height: BLOG_IMAGE_SPEC.content.height,
    sizes: `(max-width: 768px) 100vw, (max-width: 1280px) 90vw, ${BLOG_IMAGE_SPEC.content.width}px`,
    wrapper: "overflow-hidden rounded-2xl border bg-muted/20 shadow-sm",
    image: "h-auto w-full object-contain",
  },
} as const;

export function BlogResponsiveImage({
  src,
  alt,
  title,
  variant = "hero",
  priority = false,
  className,
}: BlogResponsiveImageProps) {
  const config = VARIANTS[variant];

  if (variant === "card") {
    return (
      <div className={cn("relative aspect-[16/10] w-full", config.wrapper, className)}>
        <Image
          src={src}
          alt={alt}
          title={title}
          fill
          priority={priority}
          quality={90}
          sizes={config.sizes}
          className={config.image}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("mx-auto w-full", config.wrapper, className)}
      style={{ maxWidth: BLOG_IMAGE_SPEC.displayMaxWidth }}
    >
      <Image
        src={src}
        alt={alt}
        title={title}
        width={config.width}
        height={config.height}
        priority={priority}
        quality={90}
        sizes={config.sizes}
        className={config.image}
      />
    </div>
  );
}
