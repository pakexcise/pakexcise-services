import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  centered?: boolean;
};

export function SectionHeader({
  title,
  description,
  action,
  className,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("space-y-2", centered && "max-w-3xl")}>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
