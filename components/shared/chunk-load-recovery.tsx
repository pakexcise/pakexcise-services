"use client";

import { useEffect } from "react";

import {
  clearChunkReloadAttempt,
  isChunkLoadError,
  isChunkLoadErrorMessage,
  reloadPageForChunkError,
} from "@/lib/chunk-load-error";

export function ChunkLoadRecovery() {
  useEffect(() => {
    clearChunkReloadAttempt();

    function handleWindowError(event: ErrorEvent) {
      const message = event.message ?? event.error?.message ?? "";
      if (isChunkLoadErrorMessage(message)) {
        reloadPageForChunkError();
      }
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      if (isChunkLoadError(event.reason)) {
        reloadPageForChunkError();
      }
    }

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
