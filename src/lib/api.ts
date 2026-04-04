import {
  DefaultApi,
  Configuration,
  Middleware,
  ResponseContext,
  ErrorContext,
} from "../api";
import { getAuthCookies, refreshTokenAction } from "../actions/auth";

export const API_BASE_PATH = "http://localhost:3020";

const tokenRefreshMiddleware: Middleware = {
  pre: async (context) => {
    // Dynamically fetch from the server action on the client
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
  onError: async (context: ErrorContext) => {
    const { response } = context;
    if (response && response.status === 401) {
      if (context.url.includes("/auth/refresh")) {
        return response;
      }

      try {
        const newToken = await refreshTokenAction();
        if (newToken) {
          const newInit = {
            ...context.init,
            headers: {
              ...context.init.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          return context.fetch(context.url, newInit);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }
    return response;
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
