const STORAGE_KEY = "vazlat:editor-tab-id";

/** Stable id per browser tab for collaborative sync (skip echo on saving tab). */
export function getEditorTabId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `tab-${crypto.randomUUID()}`
          : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `tab-${Date.now()}`;
  }
}
