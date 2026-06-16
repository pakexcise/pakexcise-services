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
  href,
  accent = "default",
  className,
}: InsightStatCardProps) {
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
        <p className="text-xl font-bold leading-tight break-words">{value}</p>
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
