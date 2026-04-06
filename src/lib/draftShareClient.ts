import { getAuthCookies } from "@/actions/auth";
import { API_BASE_PATH } from "@/lib/api";

export async function postDraftShare(
  draftId: number,
): Promise<{ code: number; shareToken?: string; message?: string }> {
  const { accessToken } = await getAuthCookies();
  const res = await fetch(`${API_BASE_PATH}/drafts/${draftId}/share`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  return res.json() as Promise<{ code: number; shareToken?: string; message?: string }>;
}

export async function deleteDraftShare(
  draftId: number,
): Promise<{ code: number; message?: string }> {
  const { accessToken } = await getAuthCookies();
  const res = await fetch(`${API_BASE_PATH}/drafts/${draftId}/share`, {
    method: "DELETE",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  return res.json() as Promise<{ code: number; message?: string }>;
}
