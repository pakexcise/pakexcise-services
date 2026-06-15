import { cn } from "@/lib/utils";

type HomeSectionTone = "default" | "muted" | "accent";

type HomeSectionShellProps = {
  children: React.ReactNode;
  tone?: HomeSectionTone;
  className?: string;
  containerClassName?: string;
  id?: string;
};

const toneClasses: Record<HomeSectionTone, string> = {
  default: "bg-background",
  muted: "border-y border-border/60 bg-muted/25",
  accent: "bg-linear-to-b from-primary/[0.04] via-background to-background",
};

export function HomeSectionShell({
  children,
  tone = "default",
  className,
  containerClassName,
  id,
}: HomeSectionShellProps) {
  return (
    <section id={id} className={cn(toneClasses[tone], className)}>
      <div
        className={cn(
          "container-site py-14 md:py-20",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
