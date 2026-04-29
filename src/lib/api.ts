import {
  DefaultApi,
  Configuration,
  Middleware,
  ResponseContext,
} from "../api";
import { getAuthCookies, refreshTokenAction } from "../actions/auth";
import { API_BASE_PATH } from "./apiBase";

export { API_BASE_PATH };

let refreshInFlight: Promise<string | null> | null = null;

function dedupedRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokenAction().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/** Retry must use plain `fetch`: calling `fetchApi` runs `pre` again, which reads cookies via another server-action round-trip and can still see the *old* access token before Set-Cookie from refresh commits — overwriting the fresh Bearer from refresh. */
const tokenRefreshMiddleware: Middleware = {
  pre: async (context) => {
    const { accessToken } = await getAuthCookies();
    if (!accessToken) {
      return undefined;
    }
    const headers = new Headers(context.init.headers ?? undefined);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return {
      url: context.url,
      init: {
        ...context.init,
        headers,
      },
    };
  },
  post: async (context: ResponseContext) => {
    const { response, url, init } = context;
    if (response.status !== 401) {
      return undefined;
    }
    if (url.includes("/auth/refresh")) {
      return undefined;
    }

    try {
      const newToken = await dedupedRefresh();
      if (!newToken) {
        return undefined;
      }
      const headers = new Headers(init.headers ?? undefined);
      headers.set("Authorization", `Bearer ${newToken}`);
      const retryInit: RequestInit = {
        ...init,
        headers,
      };
      return fetch(url, retryInit);
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return undefined;
  },
};

export const api = new DefaultApi(
  new Configuration({
    basePath: API_BASE_PATH,
    middleware: [tokenRefreshMiddleware],
  }),
);

export const getServerApi = async () => {
  const { accessToken } = await getAuthCookies();

  const config = new Configuration({
    basePath: API_BASE_PATH,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    middleware: [tokenRefreshMiddleware],
  });

  return new DefaultApi(config);
};
