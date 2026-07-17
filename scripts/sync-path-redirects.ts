import "server-only";

import { syncPathRedirectCache } from "@/features/redirects/lib/path-redirects";

async function main() {
  const count = await syncPathRedirectCache();
  console.log(`[sync-path-redirects] cached ${count} path redirect(s)`);
}

main().catch((error) => {
  console.error("[sync-path-redirects] failed", error);
  process.exitCode = 1;
});
