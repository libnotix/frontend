import {
  DefaultApi,
  Configuration,
  Middleware,
  ResponseContext,
  ErrorContext,
} from "../api";
import { getAuthCookies, refreshTokenAction } from "../actions/auth";

const BASE_PATH = "http://localhost:3020";

const tokenRefreshMiddleware: Middleware = {
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
    basePath: BASE_PATH,
    middleware: [tokenRefreshMiddleware],
  }),
);

export const getServerApi = async () => {
  const { accessToken } = await getAuthCookies();

  const config = new Configuration({
    basePath: BASE_PATH,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return new DefaultApi(config);
};
