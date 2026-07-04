export const ADMIN_BADGES_REFRESH_EVENT = "pakexcise:admin-badges-refresh";

export function dispatchAdminBadgesRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_BADGES_REFRESH_EVENT));
}
