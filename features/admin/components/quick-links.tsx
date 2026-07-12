import {
  ArrowRightLeft,
  Bell,
  BookOpen,
  Briefcase,
  CreditCard,
  FileStack,
  Newspaper,
  Search,
  Settings,
  UserCog,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Route } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type QuickLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type QuickLinksProps = {
  title: string;
  links: QuickLink[];
};

export function QuickLinks({ title, links }: QuickLinksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        {links.map((link) => (
          <Button
            key={link.href}
            asChild
            variant="outline"
            className="h-auto min-h-10 w-full min-w-0 justify-start whitespace-normal py-2.5"
          >
            <Link
              href={link.href as Route}
              className="flex w-full min-w-0 items-start gap-2 text-left"
            >
              <span className="mt-0.5 shrink-0">{link.icon}</span>
              <span className="min-w-0 flex-1 break-words leading-snug">
                {link.label}
              </span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export const quickLinkIcons = {
  services: <Briefcase className="size-4" aria-hidden="true" />,
  applications: <FileStack className="size-4" aria-hidden="true" />,
  payments: <CreditCard className="size-4" aria-hidden="true" />,
  notifications: <Bell className="size-4" aria-hidden="true" />,
  audit: <Shield className="size-4" aria-hidden="true" />,
  seo: <Search className="size-4" aria-hidden="true" />,
  blog: <Newspaper className="size-4" aria-hidden="true" />,
  redirects: <ArrowRightLeft className="size-4" aria-hidden="true" />,
  guides: <BookOpen className="size-4" aria-hidden="true" />,
  settings: <Settings className="size-4" aria-hidden="true" />,
  users: <UserCog className="size-4" aria-hidden="true" />,
};
