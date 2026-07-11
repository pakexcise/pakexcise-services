"use client";

import { useId } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "#2159BA",
  "#FAC515",
  "#0d9488",
  "#7c3aed",
  "#ea580c",
  "#db2777",
  "#64748b",
  "#16a34a",
];

type NamedCount = { name: string; value: number };

type TrendPoint = {
  date: string;
  pageViews: number;
  whatsappClicks: number;
  signups: number;
  applicationsSubmitted: number;
  contactSubmissions: number;
  serviceViews: number;
};

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${month}/${day}`;
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function AnalyticsTrendChart({
  title,
  description,
  data,
  emptyLabel,
  labels,
  className,
  height = 340,
}: {
  title: string;
  description?: string;
  data: TrendPoint[];
  emptyLabel: string;
  labels: {
    pageViews: string;
    whatsappClicks: string;
    signups: string;
    applicationsSubmitted: string;
    contactSubmissions: string;
    serviceViews: string;
  };
  className?: string;
  height?: number;
}) {
  const gradientId = `pvFill-${useId().replace(/:/g, "")}`;
  const hasData = data.some(
    (row) =>
      row.pageViews ||
      row.whatsappClicks ||
      row.signups ||
      row.applicationsSubmitted ||
      row.contactSubmissions ||
      row.serviceViews,
  );

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <ChartEmpty message={emptyLabel} />
        ) : (
          <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2159BA" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2159BA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11 }}
                  minTickGap={20}
                />
                <YAxis
                  yAxisId="views"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                />
                <YAxis
                  yAxisId="events"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  width={36}
                />
                <Tooltip
                  labelFormatter={(value) => String(value)}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  yAxisId="views"
                  type="monotone"
                  dataKey="pageViews"
                  name={labels.pageViews}
                  stroke="#2159BA"
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="events"
                  type="monotone"
                  dataKey="whatsappClicks"
                  name={labels.whatsappClicks}
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="events"
                  type="monotone"
                  dataKey="serviceViews"
                  name={labels.serviceViews}
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="events"
                  type="monotone"
                  dataKey="signups"
                  name={labels.signups}
                  stroke="#FAC515"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="events"
                  type="monotone"
                  dataKey="applicationsSubmitted"
                  name={labels.applicationsSubmitted}
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="events"
                  type="monotone"
                  dataKey="contactSubmissions"
                  name={labels.contactSubmissions}
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDonutChart({
  title,
  description,
  data,
  emptyLabel,
  className,
}: {
  title: string;
  description?: string;
  data: NamedCount[];
  emptyLabel: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty message={emptyLabel} />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsHorizontalBarChart({
  title,
  description,
  data,
  emptyLabel,
  className,
}: {
  title: string;
  description?: string;
  data: NamedCount[];
  emptyLabel: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty message={emptyLabel} />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#2159BA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsVerticalBarChart({
  title,
  description,
  data,
  emptyLabel,
  className,
}: {
  title: string;
  description?: string;
  data: NamedCount[];
  emptyLabel: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty message={emptyLabel} />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
