import { cache } from "react";
import { getServerApi } from "./api";
import { AuthSessionGet200Response } from "@/api";

export const getSession = cache(async (): Promise<AuthSessionGet200Response | null> => {
  try {
    const api = await getServerApi();
    const session = await api.authSessionGet();
    return session || null;
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return null;
  }
});
