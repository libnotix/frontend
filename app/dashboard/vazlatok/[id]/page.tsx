"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ensureTopLevelNodeIds } from "@/components/slate/nodeIds";
import { SlateEditorNode } from "@/components/slate/types";
import { ChatPanel } from "@/components/slate/ChatPanel";
import { Button } from "@/components/ui/button";
import {
  extractCurrentPageContent,
  normalizeDraftUpdatedAtToIso,
} from "@/features/drafts/content";
import { DraftShareMenu } from "@/features/drafts/DraftShareMenu";
import { draftKeys } from "@/features/drafts/queryKeys";
import { DraftEditorModel } from "@/features/drafts/types";
import {
  useDraftQuery,
  useDraftSaveMutation,
  usePatchDraftUpdatedAt,
} from "@/features/drafts/useDraftData";
import { useDraftForm } from "@/features/drafts/useDraftForm";
import { useDraftEditorSession } from "@/features/drafts/useDraftEditorSession";
import {
  DraftRemoteSyncMessage,
  useDraftRemoteSync,
} from "@/lib/useDraftRemoteSync";

import SlateEditor from "../SlateEditor";
import DraftDynamicIsland from "./DraftDynamicIsland";
import FloatingChatToggle, { type ChatMode } from "./FloatingChatToggle";

function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number,
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}

const bouncySpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 22,
  mass: 0.8,
};

const DraftEditorPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const draftId = typeof params?.id === "string" ? params.id : undefined;

  const form = useDraftForm();
  const { control, getValues, reset, setValue } = form;
  const title = useWatch({ control, name: "title" }) ?? "";

  const draftQuery = useDraftQuery(draftId);
  const saveMutation = useDraftSaveMutation(draftId);
  const patchDraftUpdatedAt = usePatchDraftUpdatedAt(draftId);
  const draft = draftQuery.data;

  const {
    lastSaved,
    setLastSaved,
    setIsRailOpen,
    collabTabId,
    editorMountKey,
    setEditorMountKey,
    collabTabIdRef,
    isApplyingRemoteRef,
    draftRevisionRef,
    currentContentRef,
    hasInitializedFormRef,
  } = useDraftEditorSession({
    draftId,
    draft,
    reset,
  });

  const [chatOpen, setChatOpen] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>("floating");

  // Stable portal target for the ChatPanel (rendered inside Slate context, portaled to the chat container)
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [chatContainer, setChatContainer] = useState<HTMLDivElement | null>(null);
  const chatContainerCallback = useCallback((node: HTMLDivElement | null) => {
    chatContainerRef.current = node;
    setChatContainer(node);
  }, []);

  const saveDraft = useCallback(
    async (nextContent?: SlateEditorNode[], nextTitle?: string) => {
      if (!draft) return;

      const resolvedContent = ensureTopLevelNodeIds(
        nextContent ?? currentContentRef.current ?? getValues("content"),
      );
      const resolvedTitle = nextTitle ?? getValues("title") ?? "";
      currentContentRef.current = resolvedContent;

      try {
        const result = await saveMutation.mutateAsync({
          content: resolvedContent,
          title: resolvedTitle,
          contentContainer: draft.contentContainer,
          collabTabId: collabTabIdRef.current,
        });

        draftRevisionRef.current = result.updatedAt;
        setLastSaved(new Date(result.updatedAt));
        setValue("title", result.title, {
          shouldDirty: false,
          shouldTouch: false,
        });
        setValue("content", result.content, {
          shouldDirty: false,
          shouldTouch: false,
        });
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    },
    [draft, getValues, saveMutation, setValue],
  );

  const debouncedContentSave = useDebouncedCallback(
    (content: SlateEditorNode[]) => {
      if (isApplyingRemoteRef.current) return;
      void saveDraft(content);
    },
    1000,
  );

  const debouncedTitleSave = useDebouncedCallback((nextTitle: string) => {
    if (isApplyingRemoteRef.current) return;
    void saveDraft(undefined, nextTitle);
  }, 700);

  const applyRemoteDraftSync = useCallback(
    (msg: DraftRemoteSyncMessage) => {
      if (
        msg.originTabId != null &&
        msg.originTabId !== "" &&
        msg.originTabId === collabTabIdRef.current
      ) {
        return;
      }
      if (!draftId) return;

      const revisionIso =
        normalizeDraftUpdatedAtToIso(msg.draft.updatedAt) ?? msg.draft.updatedAt;
      if (
        revisionIso === draftRevisionRef.current &&
        draftRevisionRef.current !== ""
      ) {
        return;
      }

      const parsed = extractCurrentPageContent(msg.draft.content);
      isApplyingRemoteRef.current = true;
      currentContentRef.current = parsed.content;

      queryClient.setQueryData<DraftEditorModel | undefined>(
        draftKeys.byId(draftId),
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            title: msg.draft.title ?? previous.title,
            format: msg.draft.format ?? previous.format,
            content: parsed.content,
            contentContainer: parsed.container,
            updatedAt: revisionIso,
          };
        },
      );

      reset(
        { title: msg.draft.title ?? "", content: parsed.content },
        { keepDirty: false, keepTouched: false },
      );

      draftRevisionRef.current = revisionIso;
      setLastSaved(new Date(revisionIso));
      setEditorMountKey((value) => value + 1);

      window.setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 500);
    },
    [draftId, queryClient, reset],
  );

  useDraftRemoteSync(draftId, collabTabId, applyRemoteDraftSync);

  const applyServerDraftTimestamp = useCallback(
    (updatedAtIso: string) => {
      const normalized = normalizeDraftUpdatedAtToIso(updatedAtIso);
      if (!normalized) return;
      draftRevisionRef.current = normalized;
      setLastSaved(new Date(normalized));
      patchDraftUpdatedAt(normalized);
    },
    [patchDraftUpdatedAt],
  );

  const handleEditorChange = useCallback(
    (content: SlateEditorNode[]) => {
      const contentWithIds = ensureTopLevelNodeIds(content);
      currentContentRef.current = contentWithIds;
      setValue("content", contentWithIds, { shouldDirty: true });
      debouncedContentSave(contentWithIds);
    },
    [debouncedContentSave, setValue],
  );

  const handleTitleChange = useCallback(
    (nextTitle: string) => {
      setValue("title", nextTitle, { shouldDirty: true });
      debouncedTitleSave(nextTitle);
    },
    [debouncedTitleSave, setValue],
  );

  const handleShareTokenChange = useCallback(
    (token: string | null) => {
      if (!draftId) return;
      queryClient.setQueryData<DraftEditorModel | undefined>(
        draftKeys.byId(draftId),
        (prev) => (prev ? { ...prev, shareToken: token } : prev),
      );
    },
    [draftId, queryClient],
  );

  const renderExternalChat = useCallback(() => {
    if (!chatContainer) return null;
    return createPortal(
      <ChatPanel
        draftId={draftId}
        revision={normalizeDraftUpdatedAtToIso(draft?.updatedAt)}
        density={chatMode === "docked" ? "comfortable" : "compact"}
        onDraftServerTouch={applyServerDraftTimestamp}
      />,
      chatContainer,
    );
  }, [chatContainer, draftId, draft?.updatedAt, chatMode, applyServerDraftTimestamp]);

  if (draftQuery.isLoading || (draft && !hasInitializedFormRef.current)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={bouncySpring}
        className="flex flex-col items-center justify-center p-20 h-[80vh]"
      >
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Vázlat betöltése...</p>
      </motion.div>
    );
  }

  if (!draft) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={bouncySpring}
        className="flex flex-col items-center justify-center p-20 h-[80vh] gap-3"
      >
        <p className="text-muted-foreground">
          Nem sikerült betölteni ezt a vázlatot.
        </p>
        <Button type="button" onClick={() => router.push("/dashboard/vazlatok")}>
          Vissza a vázlatokhoz
        </Button>
      </motion.div>
    );
  }

  const isDocked = chatOpen && chatMode === "docked";

  return (
    <div className="relative flex flex-1 min-h-0 w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-[20%] -left-[10%] w-[45%] h-[50%] rounded-full bg-blue-400/15 dark:bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-[10%] right-[5%] w-[35%] h-[40%] rounded-full bg-emerald-400/12 dark:bg-emerald-500/8 blur-[100px]" />
        <div className="absolute top-[50%] -left-[5%] w-[30%] h-[35%] rounded-full bg-orange-400/12 dark:bg-orange-500/8 blur-[110px]" />
        <div className="absolute bottom-[5%] right-[15%] w-[40%] h-[35%] rounded-full bg-rose-400/10 dark:bg-rose-500/7 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[25%] w-[35%] h-[30%] rounded-full bg-yellow-400/10 dark:bg-yellow-500/7 blur-[90px]" />
      </div>

      {/* Navbar Dynamic Island content */}
      <DraftDynamicIsland
        title={title}
        onTitleChange={handleTitleChange}
        isSaving={saveMutation.isPending}
        isSaveError={saveMutation.isError}
        lastSaved={lastSaved}
        onSave={() => void saveDraft()}
        shareMenu={
          typeof draft?.id === "number" ? (
            <DraftShareMenu
              draftId={draft.id}
              shareToken={draft.shareToken}
              onTokenChange={handleShareTokenChange}
            />
          ) : null
        }
      />

      {/* Main editor area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SlateEditor
          key={`draft-editor-${draftId}-${editorMountKey}`}
          draftId={draftId}
          revision={normalizeDraftUpdatedAtToIso(draft.updatedAt)}
          onDraftServerTouch={applyServerDraftTimestamp}
          isRailOpen={false}
          onRailOpenChange={setIsRailOpen}
          initialValue={currentContentRef.current}
          onChange={handleEditorChange}
          onSave={(content) => void saveDraft(content)}
          externalChat
          renderExternalChat={renderExternalChat}
          scrollClassName="pt-24"
        />
      </div>

      {/* Docked chat panel */}
      <AnimatePresence>
        {isDocked && (
          <motion.div
            key="docked-rail"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={bouncySpring}
            className="shrink-0 overflow-hidden h-full bg-background/50 pt-24"
          >
            <FloatingChatToggle
              chatContent={<div ref={chatContainerCallback} className="flex flex-col h-full min-h-0" />}
              isOpen={chatOpen}
              onOpenChange={setChatOpen}
              mode={chatMode}
              onModeChange={setChatMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating chat window (non-docked modes: floating, minimized, closed) */}
      {!isDocked && (
        <FloatingChatToggle
          chatContent={<div ref={chatContainerCallback} className="flex flex-col h-full min-h-0" />}
          isOpen={chatOpen}
          onOpenChange={setChatOpen}
          mode={chatMode}
          onModeChange={setChatMode}
        />
      )}
    </div>
  );
};

export default memo(DraftEditorPage);
