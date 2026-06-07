"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ reset }: AdminErrorProps) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tCommon("errorTitle")}</CardTitle>
        <CardDescription>{t("errorDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={reset}>
          {tCommon("retry")}
        </Button>
      </CardContent>
    </Card>
  );
}
