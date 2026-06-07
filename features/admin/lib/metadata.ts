import type { Metadata } from "next";

export function adminMetadata(title: string): Metadata {
  return {
    title: `${title} | Admin | PakExcise.com`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}
