import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";

type StatCardProps = {
  title: string;
  value: number;
  href?: string;
  className?: string;
};

export function StatCard({ title, value, href, className }: StatCardProps) {
  const card = (
    <Card className={cn(href && "transition-colors hover:bg-muted/30", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium break-words text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href as Route} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {card}
      </Link>
    );
  }

  return card;
}
