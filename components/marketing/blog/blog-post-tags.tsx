import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

type BlogPostTagsProps = {
  tags: string[];
  title: string;
};

export function BlogPostTags({ tags, title }: BlogPostTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <section aria-label={title} className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-foreground">{title}</span>
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
          <Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="hover:text-primary">
            {tag}
          </Link>
        </Badge>
      ))}
    </section>
  );
}
