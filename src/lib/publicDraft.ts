import { API_BASE_PATH } from "@/lib/api";

export function publicDraftFileUrl(shareToken: string, fileId: number): string {
  const t = encodeURIComponent(shareToken.trim());
  return `${API_BASE_PATH}/public/drafts/${t}/files/${fileId}`;
}

export function createPublicDraftAssetBlobFetcher(shareToken: string) {
  return async (fileId: number): Promise<Blob> => {
    const res = await fetch(publicDraftFileUrl(shareToken, fileId));
    if (!res.ok) {
      throw new Error(`public-asset-${res.status}`);
    }
    return res.blob();
  };
}

export async function fetchPublicDraft(shareToken: string): Promise<unknown> {
  const t = encodeURIComponent(shareToken.trim());
  const res = await fetch(`${API_BASE_PATH}/public/drafts/${t}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error("public-draft-not-found") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return json;
}
