import { ResponseError } from "@/api";

/** Maps backend `ApiResponse.message` codes to Hungarian for toasts */
const MESSAGE_HU: Record<string, string> = {
  forbidden:
    "Nincs jogosultságod ehhez a művelethez. Csak az osztály tagjai és a rendszergazdák végezhetik.",
  unauthorized: "Jelentkezz be újra a folytatáshoz.",
  "not-found": "Az elem nem található.",
  "invalid-id": "Érvénytelen azonosító.",
  "invalid-body": "A kérés formátuma érvénytelen.",
  error: "Váratlan hiba történt. Próbáld újra később.",
};

/**
 * Reads a human-readable message from OpenAPI client errors when the API returns JSON with `message`.
 */
export async function getApiErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (error instanceof ResponseError) {
    try {
      const body = (await error.response.json()) as {
        message?: string;
        error?: string;
      };
      const msg = body?.message ?? body?.error;
      if (typeof msg === "string" && msg.trim()) {
        const key = msg.trim();
        if (MESSAGE_HU[key]) return MESSAGE_HU[key];
        return key;
      }
    } catch {
      /* use fallback */
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
