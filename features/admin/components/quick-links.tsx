import {
  Briefcase,
  CreditCard,
  FileStack,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

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
              href={link.href}
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
  audit: <Shield className="size-4" aria-hidden="true" />,
};
