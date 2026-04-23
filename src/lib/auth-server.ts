import { cache } from "react";
import { getServerApi } from "./api";
import { AuthSessionGet200Response, ResponseError } from "@/api";
import { refreshTokenAction } from "@/actions/auth";

export const getSession = cache(
  async (): Promise<AuthSessionGet200Response | null> => {
    try {
      const api = await getServerApi();
      const session = await api.authSessionGet();

      return session || null;
    } catch (error) {
      if (
        error instanceof ResponseError &&
        error.response.status === 401
      ) {
        const refreshed = await refreshTokenAction();
        if (refreshed) {
          try {
            const api = await getServerApi();
            const session = await api.authSessionGet();
            return session || null;
          } catch {
            return null;
          }
        }
      }
      console.error("Failed to fetch session:", error);
      return null;
    }
  },
);
