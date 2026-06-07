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
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <Button key={link.href} asChild variant="outline" className="justify-start">
            <Link href={link.href}>
              {link.icon}
              {link.label}
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
