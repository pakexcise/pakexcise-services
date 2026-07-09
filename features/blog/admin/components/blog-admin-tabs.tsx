"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BlogAdminTabsProps = {
  labels: {
    posts: string;
    categories: string;
  };
};

export function BlogAdminTabs({ labels }: BlogAdminTabsProps) {
  const pathname = usePathname();
  const isCategories = pathname.startsWith("/admin/blog-categories");

  return (
    <nav
      aria-label="Blog admin sections"
      className="flex flex-wrap gap-2 border-b pb-3"
    >
      <TabLink href="/admin/blog" active={!isCategories}>
        {labels.posts}
      </TabLink>
      <TabLink href="/admin/blog-categories" active={isCategories}>
        {labels.categories}
      </TabLink>
    </nav>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
