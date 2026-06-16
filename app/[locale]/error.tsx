"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { isChunkLoadError, reloadPageForChunkError } from "@/lib/chunk-load-error";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  const isChunkError = isChunkLoadError(error);

  useEffect(() => {
    if (!isChunkError) {
      return;
    }

    reloadPageForChunkError();
  }, [error, isChunkError]);

  return (
    <div className="container-site flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold">
        {isChunkError ? t("chunkLoadTitle") : t("errorTitle")}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {isChunkError ? t("chunkLoadDescription") : t("errorDescription")}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => {
            if (isChunkError) {
              window.location.reload();
              return;
            }

            reset();
          }}
        >
          {t("retry")}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
