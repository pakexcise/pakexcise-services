import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { SeoHealthSnapshot } from "@/features/seo/admin/lib/seo-health";

type SeoHealthPanelProps = {
  health: SeoHealthSnapshot;
  labels: {
    title: string;
    description: string;
    appEnv: string;
    indexing: string;
    indexingOn: string;
    indexingOff: string;
    canonicalBase: string;
    sitemap: string;
    sitemapOn: string;
    sitemapOff: string;
    robots: string;
    llms: string;
    googleVerification: string;
    bingVerification: string;
    ga4: string;
    gtm: string;
    configured: string;
    missing: string;
    seoRecords: string;
    missingTitles: string;
    missingDescriptions: string;
  };
};

function StatusBadge({ ok, okLabel, badLabel }: { ok: boolean; okLabel: string; badLabel: string }) {
  return <Badge variant={ok ? "default" : "secondary"}>{ok ? okLabel : badLabel}</Badge>;
}

export function SeoHealthPanel({ health, labels }: SeoHealthPanelProps) {
  const rows: Array<{ label: string; value: ReactNode }> = [
    {
      label: labels.appEnv,
      value: <span className="font-mono text-sm">{health.appEnv}</span>,
    },
    {
      label: labels.indexing,
      value: (
        <StatusBadge
          ok={health.indexingAllowed}
          okLabel={labels.indexingOn}
          badLabel={labels.indexingOff}
        />
      ),
    },
    {
      label: labels.canonicalBase,
      value: (
        <a
          href={health.canonicalBaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-primary underline-offset-2 hover:underline"
        >
          {health.canonicalBaseUrl}
        </a>
      ),
    },
    {
      label: labels.sitemap,
      value: (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            ok={health.sitemapEnabled && health.indexingAllowed}
            okLabel={labels.sitemapOn}
            badLabel={labels.sitemapOff}
          />
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            /sitemap.xml
          </a>
        </div>
      ),
    },
    {
      label: labels.robots,
      value: (
        <a
          href="/robots.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          /robots.txt
        </a>
      ),
    },
    {
      label: labels.llms,
      value: (
        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          /llms.txt
        </a>
      ),
    },
    {
      label: labels.googleVerification,
      value: (
        <StatusBadge
          ok={health.googleVerificationConfigured}
          okLabel={labels.configured}
          badLabel={labels.missing}
        />
      ),
    },
    {
      label: labels.bingVerification,
      value: (
        <StatusBadge
          ok={health.bingVerificationConfigured}
          okLabel={labels.configured}
          badLabel={labels.missing}
        />
      ),
    },
    {
      label: labels.ga4,
      value: (
        <StatusBadge
          ok={health.ga4Configured}
          okLabel={labels.configured}
          badLabel={labels.missing}
        />
      ),
    },
    {
      label: labels.gtm,
      value: (
        <StatusBadge
          ok={health.gtmConfigured}
          okLabel={labels.configured}
          badLabel={labels.missing}
        />
      ),
    },
    {
      label: labels.seoRecords,
      value: <span className="text-sm">{health.seoRecordCount}</span>,
    },
    {
      label: labels.missingTitles,
      value: <span className="text-sm">{health.missingMetaTitleCount}</span>,
    },
    {
      label: labels.missingDescriptions,
      value: <span className="text-sm">{health.missingMetaDescriptionCount}</span>,
    },
  ];

  return (
    <section className="rounded-xl border p-4">
      <h2 className="text-sm font-semibold">{labels.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{labels.description}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border bg-muted/20 p-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {row.label}
            </dt>
            <dd className="mt-1">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
