import { cn } from "@/lib/utils";

type ProseContentProps = {
  content: string;
  className?: string;
};

export function ProseContent({ content, className }: ProseContentProps) {
  if (!content.trim()) {
    return null;
  }

  return (
    <div className={cn("space-y-4 text-muted-foreground", className)}>
      {content.split("\n\n").map((paragraph, index) => (
        <p key={index} className="text-sm leading-relaxed sm:text-base">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
