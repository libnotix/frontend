import { API_BASE_PATH } from "./api";

/** Derive ws/wss origin from the HTTP API base URL (e.g. http://localhost:3020 → ws://localhost:3020). */
export function getAiWebSocketUrl(): string {
  const u = new URL(API_BASE_PATH);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  return `${u.origin}/ws/ai`;
}
