import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type InsightStatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  /** Signed percent change vs previous period, e.g. 12.5 or -4. */
  deltaPercent?: number | null;
  deltaLabel?: string;
  href?: string;
  accent?: "default" | "primary" | "warning" | "success";
  className?: string;
};

const accentClasses: Record<
  NonNullable<InsightStatCardProps["accent"]>,
  string
> = {
  default: "border-border",
  primary: "border-primary/30 bg-primary/5",
  warning: "border-secondary/40 bg-secondary/10",
  success: "border-emerald-500/30 bg-emerald-500/5",
};

export function InsightStatCard({
  title,
  value,
  subtitle,
  deltaPercent,
  deltaLabel,
  href,
  accent = "default",
  className,
}: InsightStatCardProps) {
  const hasDelta =
    typeof deltaPercent === "number" && Number.isFinite(deltaPercent);
  const deltaPositive = hasDelta && deltaPercent > 0;
  const deltaNegative = hasDelta && deltaPercent < 0;

  const card = (
    <Card
      className={cn(
        accentClasses[accent],
        href && "transition-colors hover:bg-muted/20",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold leading-tight tabular-nums break-words tracking-tight">
          {value}
        </p>
        {hasDelta ? (
          <p
            className={cn(
              "text-xs font-medium tabular-nums",
              deltaPositive && "text-emerald-600 dark:text-emerald-400",
              deltaNegative && "text-rose-600 dark:text-rose-400",
              !deltaPositive && !deltaNegative && "text-muted-foreground",
            )}
          >
            {deltaPercent > 0 ? "+" : ""}
            {deltaPercent}%
            {deltaLabel ? (
              <span className="ms-1 font-normal text-muted-foreground">
                {deltaLabel}
              </span>
            ) : null}
          </p>
        ) : null}
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {card}
      </Link>
    );
  }

  return card;
}
