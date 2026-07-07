const STORAGE_KEY = "pakexcise.activity_session";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getClientActivitySessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);

    if (existing) {
      return existing;
    }

    const created = createSessionId();
    window.sessionStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return createSessionId();
  }
}
