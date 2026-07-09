import { BlogSidebarCta } from "@/components/marketing/blog/blog-sidebar-cta";
import { BlogTableOfContents } from "@/components/marketing/blog/blog-table-of-contents";
import type { BlogTocItem } from "@/features/blog/types";
import { cn } from "@/lib/utils";

type BlogPostSidebarProps = {
  tocItems: BlogTocItem[];
  tableOfContentsTitle: string;
  sidebarTitle: string;
  sidebarDescription: string;
  servicesLabel: string;
  whatsappLabel: string;
  className?: string;
};

export function BlogPostSidebar({
  tocItems,
  tableOfContentsTitle,
  sidebarTitle,
  sidebarDescription,
  servicesLabel,
  whatsappLabel,
  className,
}: BlogPostSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-full lg:block lg:sticky lg:top-24 lg:z-10 lg:self-start",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        {tocItems.length > 0 ? (
          <BlogTableOfContents
            items={tocItems}
            title={tableOfContentsTitle}
            compact
          />
        ) : null}
        <BlogSidebarCta
          title={sidebarTitle}
          description={sidebarDescription}
          servicesLabel={servicesLabel}
          whatsappLabel={whatsappLabel}
        />
      </div>
    </aside>
  );
}
