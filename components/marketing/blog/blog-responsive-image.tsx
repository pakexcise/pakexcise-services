import Image from "next/image";

import { BLOG_IMAGE_SPEC } from "@/features/blog/lib/image-spec";
import { isUploadedBlogImagePath } from "@/features/blog/lib/blog-image-paths";
import {
  isLocalPublicImagePath,
  type ImageDimensions,
} from "@/features/blog/lib/resolve-image-dimensions";
import { cn } from "@/lib/utils";

type BlogResponsiveImageProps = {
  src: string;
  alt: string;
  title?: string;
  variant?: "hero" | "card" | "content";
  priority?: boolean;
  className?: string;
  naturalDimensions?: ImageDimensions | null;
};

const VARIANTS = {
  hero: {
    fallback: {
      width: BLOG_IMAGE_SPEC.featured.width,
      height: BLOG_IMAGE_SPEC.featured.height,
    },
    maxDisplayWidth: BLOG_IMAGE_SPEC.displayMaxWidth,
    wrapper:
      "overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 shadow-sm ring-1 ring-black/5 dark:ring-white/10",
    image: "object-contain object-center",
    quality: 100,
    padding: "p-2 sm:p-3 md:p-4",
  },
  card: {
    fallback: { width: 800, height: 450 },
    maxDisplayWidth: 400,
    wrapper: "overflow-hidden bg-muted/20",
    image:
      "object-contain object-center transition-transform duration-300 group-hover:scale-[1.01]",
    quality: 92,
    padding: "p-1",
  },
  content: {
    fallback: {
      width: BLOG_IMAGE_SPEC.content.width,
      height: BLOG_IMAGE_SPEC.content.height,
    },
    maxDisplayWidth: BLOG_IMAGE_SPEC.content.width,
    wrapper: "overflow-hidden rounded-2xl border bg-muted/20 shadow-sm",
    image: "object-contain object-center",
    quality: 95,
    padding: "p-2",
  },
} as const;

function resolveRenderDimensions(
  variant: keyof typeof VARIANTS,
  naturalDimensions?: ImageDimensions | null,
) {
  const config = VARIANTS[variant];
  const natural = naturalDimensions ?? null;

  if (!natural?.width || !natural?.height) {
    const width = Math.min(config.fallback.width, config.maxDisplayWidth);
    const height = Math.round(width * (config.fallback.height / config.fallback.width));
    return { width, height, natural };
  }

  if (natural.width <= config.maxDisplayWidth) {
    return { width: natural.width, height: natural.height, natural };
  }

  const scale = config.maxDisplayWidth / natural.width;

  return {
    width: config.maxDisplayWidth,
    height: Math.max(1, Math.round(natural.height * scale)),
    natural,
  };
}

export function BlogResponsiveImage({
  src,
  alt,
  title,
  variant = "hero",
  priority = false,
  className,
  naturalDimensions,
}: BlogResponsiveImageProps) {
  const config = VARIANTS[variant];
  const { width, height, natural } = resolveRenderDimensions(
    variant,
    naturalDimensions,
  );
  const sizes =
    variant === "card"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
      : `(max-width: ${width}px) 100vw, ${width}px`;

  const shouldServeOriginal =
    isUploadedBlogImagePath(src) ||
    (isLocalPublicImagePath(src) &&
      Boolean(natural) &&
      natural!.width <= config.maxDisplayWidth);

  if (variant === "card") {
    return (
      <div
        className={cn("relative aspect-[16/10] w-full", config.wrapper, className)}
      >
        <Image
          src={src}
          alt={alt}
          title={title}
          fill
          priority={priority}
          quality={config.quality}
          unoptimized={shouldServeOriginal}
          sizes={sizes}
          className={cn(config.image, config.padding)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("mx-auto w-full", config.wrapper, className)}
      style={{ maxWidth: width }}
    >
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
        <Image
          src={src}
          alt={alt}
          title={title}
          fill
          priority={priority}
          quality={config.quality}
          unoptimized={shouldServeOriginal}
          sizes={sizes}
          className={cn(config.image, config.padding)}
        />
      </div>
    </div>
  );
}
