import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { UseFormReset } from "react-hook-form";
import { SlateEditorNode } from "@/components/slate/types";
import { getEditorTabId } from "@/lib/editorTabId";
import { normalizeDraftUpdatedAtToIso } from "./content";
import { DraftEditorFormValues, DraftEditorModel } from "./types";
import {
  EMPTY_DRAFT_CONTENT,
  toDraftFormValues,
} from "./useDraftForm";

type UseDraftEditorSessionArgs = {
  draftId: string | undefined;
  draft: DraftEditorModel | undefined;
  reset: UseFormReset<DraftEditorFormValues>;
};

export function useDraftEditorSession({
  draftId,
  draft,
  reset,
}: UseDraftEditorSessionArgs) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRailOpen, setIsRailOpen] = useState(true);
  const [collabTabId, setCollabTabId] = useState("");
  const [editorMountKey, setEditorMountKey] = useState(0);

  const collabTabIdRef = useRef("");
  const isApplyingRemoteRef = useRef(false);
  const draftRevisionRef = useRef("");
  const currentContentRef = useRef<SlateEditorNode[]>(EMPTY_DRAFT_CONTENT);
  const hasInitializedFormRef = useRef(false);

  useLayoutEffect(() => {
    const id = getEditorTabId();
    collabTabIdRef.current = id;
    setCollabTabId(id);
  }, []);

  useEffect(() => {
    hasInitializedFormRef.current = false;
    draftRevisionRef.current = "";
    currentContentRef.current = EMPTY_DRAFT_CONTENT;
    setLastSaved(null);
    setEditorMountKey(0);
    reset({ title: "", content: EMPTY_DRAFT_CONTENT });
  }, [draftId, reset]);

  useEffect(() => {
    if (!draft || hasInitializedFormRef.current) return;
    reset(toDraftFormValues(draft));
    currentContentRef.current = draft.content;
    hasInitializedFormRef.current = true;

    const revisionIso = normalizeDraftUpdatedAtToIso(draft.updatedAt);
    if (!revisionIso) return;
    draftRevisionRef.current = revisionIso;
    setLastSaved(new Date(revisionIso));
  }, [draft, reset]);

  return {
    lastSaved,
    setLastSaved,
    isRailOpen,
    setIsRailOpen,
    collabTabId,
    editorMountKey,
    setEditorMountKey,
    collabTabIdRef,
    isApplyingRemoteRef,
    draftRevisionRef,
    currentContentRef,
    hasInitializedFormRef,
  };
}

