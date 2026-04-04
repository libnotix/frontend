import { useCallback } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ensureTopLevelNodeIds } from "@/components/slate/nodeIds";
import {
  mergeCurrentPageContent,
  normalizeDraftApiResponse,
  normalizeDraftUpdatedAtToIso,
} from "./content";
import { draftKeys } from "./queryKeys";
import { DraftContentEnvelope, DraftEditorModel } from "./types";
import { SlateEditorNode } from "@/components/slate/types";

function toDraftNumericId(draftId: string | undefined): number | null {
  if (!draftId) return null;
  const parsed = Number(draftId);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchDraftById(id: number): Promise<DraftEditorModel> {
  const res = await api.draftsIdGetRaw({ id });
  const payload = await res.raw.json();
  return normalizeDraftApiResponse(payload);
}

export function useDraftQuery(draftId: string | undefined) {
  const numericDraftId = toDraftNumericId(draftId);
  return useQuery({
    queryKey: draftId ? draftKeys.byId(draftId) : draftKeys.all,
    enabled: !!draftId && numericDraftId !== null,
    queryFn: () => fetchDraftById(numericDraftId as number),
  });
}

type SaveDraftInput = {
  content: SlateEditorNode[];
  title: string;
  contentContainer?: DraftContentEnvelope;
  collabTabId?: string;
};

type SaveDraftResult = {
  content: SlateEditorNode[];
  title: string;
  updatedAt: string;
};

export function useDraftSaveMutation(draftId: string | undefined) {
  const queryClient = useQueryClient();
  const numericDraftId = toDraftNumericId(draftId);

  return useMutation({
    mutationFn: async (input: SaveDraftInput): Promise<SaveDraftResult> => {
      if (!draftId || numericDraftId === null) {
        throw new Error("Cannot save draft without a valid id.");
      }

      const contentWithIds = ensureTopLevelNodeIds(input.content);
      const payloadContent = mergeCurrentPageContent(
        input.contentContainer,
        contentWithIds,
      );
      const initOverrides =
        input.collabTabId && input.collabTabId !== ""
          ? { headers: { "X-Editor-Tab-Id": input.collabTabId } }
          : undefined;

      const response = await api.draftsIdPutRaw(
        {
          id: numericDraftId,
          updateDraftRequest: {
            content: payloadContent as object,
            title: input.title,
          },
        },
        initOverrides,
      );

      let updatedAtIso = new Date().toISOString();
      try {
        const responsePayload = await response.raw.json();
        const normalized = normalizeDraftApiResponse(responsePayload);
        updatedAtIso = normalized.updatedAt ?? updatedAtIso;
      } catch {
        // Some backend versions return empty body for update endpoints.
      }

      return {
        content: contentWithIds,
        title: input.title,
        updatedAt: updatedAtIso,
      };
    },
    onSuccess: (data) => {
      if (!draftId) return;
      queryClient.setQueryData<DraftEditorModel | undefined>(
        draftKeys.byId(draftId),
        (previous) => {
          if (!previous) return previous;
          const nextContentContainer = previous.contentContainer
            ? (mergeCurrentPageContent(
                previous.contentContainer,
                data.content,
              ) as DraftContentEnvelope)
            : undefined;
          return {
            ...previous,
            title: data.title,
            content: data.content,
            contentContainer: nextContentContainer,
            updatedAt: data.updatedAt,
          };
        },
      );
    },
  });
}

export function useRefreshDraftLinkedFiles(draftId: string | undefined) {
  const queryClient = useQueryClient();
  const numericDraftId = toDraftNumericId(draftId);

  return useCallback(async () => {
    if (!draftId || numericDraftId === null) return;

    const res = await api.draftLinkIdGetRaw({ id: numericDraftId });
    const payload = await res.raw.json();
    const files = Array.isArray(payload?.files) ? payload.files : [];

    queryClient.setQueryData<DraftEditorModel | undefined>(
      draftKeys.byId(draftId),
      (previous) => (previous ? { ...previous, files } : previous),
    );
  }, [draftId, numericDraftId, queryClient]);
}

export function usePatchDraftUpdatedAt(draftId: string | undefined) {
  const queryClient = useQueryClient();

  return useCallback(
    (value: string) => {
      const updatedAt = normalizeDraftUpdatedAtToIso(value);
      if (!draftId || !updatedAt) return;
      queryClient.setQueryData<DraftEditorModel | undefined>(
        draftKeys.byId(draftId),
        (previous) => (previous ? { ...previous, updatedAt } : previous),
      );
    },
    [draftId, queryClient],
  );
}

