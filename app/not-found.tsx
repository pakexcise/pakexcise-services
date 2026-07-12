import {
  generateNotFoundMetadata,
  NotFoundPageView,
} from "@/components/marketing/not-found-page";
import { ChunkLoadRecovery } from "@/components/shared/chunk-load-recovery";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const generateMetadata = generateNotFoundMetadata;

export default async function GlobalNotFoundPage() {
  return (
    <>
      <ChunkLoadRecovery />
      <ThemeProvider>
        <NotFoundPageView />
      </ThemeProvider>
    </>
  );
}
