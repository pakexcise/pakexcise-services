import { renderRichTextHtml } from "@/lib/security/rich-text";
import { cn } from "@/lib/utils";

type ProseContentProps = {
  content: string;
  className?: string;
};

export function ProseContent({ content, className }: ProseContentProps) {
  if (!content.trim()) {
    return null;
  }

  const html = renderRichTextHtml(content);

  return (
    <div
      className={cn(
        "prose-content space-y-4 text-muted-foreground [&_a]:text-primary [&_strong]:text-foreground",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
