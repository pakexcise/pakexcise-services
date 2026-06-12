import type { ActionResult } from "@/lib/validations/common";

export function formatActionErrorMessage(
  result: Extract<ActionResult<unknown>, { success: false }>,
  fallback: string,
): string {
  if (result.fieldErrors) {
    const messages = Object.values(result.fieldErrors).flat().filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return result.error || fallback;
}
