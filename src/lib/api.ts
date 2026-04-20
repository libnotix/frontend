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

const tokenRefreshMiddleware: Middleware = {
  pre: async (context) => {
    const { accessToken } = await getAuthCookies();
    if (accessToken) {
      return {
        ...context,
        init: {
          ...context.init,
          headers: {
            ...context.init.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      };
    }
  },
  post: async (context: ResponseContext) => {
    const { response, url, init, fetch: fetchApi } = context;
    if (response.status !== 401) {
      return undefined;
    }
    if (url.includes("/auth/refresh")) {
      return undefined;
    }

    try {
      const newToken = await dedupedRefresh();
      if (newToken) {
        const newInit = {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        return fetchApi(url, newInit);
      }
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
  });

  return new DefaultApi(config);
};
