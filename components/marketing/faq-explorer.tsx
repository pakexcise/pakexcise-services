"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { FaqCollapsibleList } from "@/components/marketing/faq-collapsible-item";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FaqCategoryGroup } from "@/features/marketing/lib/group-faqs-by-category";

type FaqExplorerLabels = {
  searchPlaceholder: string;
  allCategories: string;
  noResults: string;
};

type FaqExplorerProps = {
  groups: FaqCategoryGroup[];
  labels: FaqExplorerLabels;
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function FaqExplorer({ groups, labels }: FaqExplorerProps) {
  const t = useTranslations("marketing.faqs");
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  const normalizedQuery = normalizeQuery(query);

  const filteredGroups = useMemo(() => {
    return groups
      .filter((group) =>
        activeCategoryId === "all" ? true : group.categoryId === activeCategoryId,
      )
      .map((group) => {
        if (!normalizedQuery) {
          return group;
        }

        const items = group.items.filter(
          (item) =>
            item.question.toLowerCase().includes(normalizedQuery) ||
            item.answer.toLowerCase().includes(normalizedQuery),
        );

        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [activeCategoryId, groups, normalizedQuery]);

  const visibleCount = filteredGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  const visibleItems = useMemo(
    () => filteredGroups.flatMap((group) => group.items),
    [filteredGroups],
  );

  const [openId, setOpenId] = useState<string | null>(
    () => groups[0]?.items[0]?.id ?? null,
  );

  useEffect(() => {
    if (!openId || visibleItems.some((item) => item.id === openId)) {
      return;
    }

    setOpenId(visibleItems[0]?.id ?? null);
  }, [openId, visibleItems]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border bg-card/60 p-4 md:p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="ps-9 text-bidi-auto"
            aria-label={labels.searchPlaceholder}
            dir="auto"
          />
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
          <CategoryPill
            active={activeCategoryId === "all"}
            onClick={() => setActiveCategoryId("all")}
          >
            {labels.allCategories}
          </CategoryPill>
          {groups.map((group) => (
            <CategoryPill
              key={group.categoryId}
              active={activeCategoryId === group.categoryId}
              onClick={() => setActiveCategoryId(group.categoryId)}
            >
              {group.categoryName}
            </CategoryPill>
          ))}
        </div>

        <p className="text-bidi-auto text-sm leading-relaxed text-muted-foreground">
          {t("resultsCount", { count: visibleCount })}
        </p>
      </div>

      {filteredGroups.length === 0 ? (
        <p className="text-bidi-auto rounded-xl border border-dashed px-4 py-8 text-center text-sm leading-relaxed text-muted-foreground">
          {labels.noResults}
        </p>
      ) : (
        <div className="space-y-10">
          {filteredGroups.map((group) => (
            <section
              key={group.categoryId}
              id={`faq-category-${group.categorySlug}`}
              className="scroll-mt-24 space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-bidi-auto text-xl font-bold leading-relaxed tracking-normal md:text-2xl">
                  {group.categoryName}
                </h2>
              </div>
              <FaqCollapsibleList
                items={group.items}
                openId={openId}
                onOpenChange={setOpenId}
                defaultOpenFirst={false}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium leading-normal transition-colors text-bidi-auto",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
