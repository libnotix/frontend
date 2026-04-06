/** Backend API origin (no trailing slash). Shared by OpenAPI client and server actions. */
export const API_BASE_PATH =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3020";
