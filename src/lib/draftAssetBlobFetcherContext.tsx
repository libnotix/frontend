"use client";

import { createContext, useContext } from "react";

/** When set (e.g. public share view), `asset://` images load via this fetcher instead of authenticated download. */
export const DraftAssetBlobFetcherContext = createContext<
  ((fileId: number) => Promise<Blob>) | null
>(null);

export function useDraftAssetBlobFetcher(): ((fileId: number) => Promise<Blob>) | null {
  return useContext(DraftAssetBlobFetcherContext);
}
