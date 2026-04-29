import { ResponseError } from "@/api";

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
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    } catch {
      /* use fallback */
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
