import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSlate } from "slate-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Sparkles, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getAiWebSocketUrl } from "@/lib/aiWebSocket";
import { getEditorTabId } from "@/lib/editorTabId";
import { getAuthCookies, refreshTokenAction } from "@/actions/auth";

import {
  ChatMessage,
  GroupedAiResponse,
  PendingAiEditGroup,
} from "./types";
import { ensureEditorHasTopLevelNodeIds } from "./nodeIds";
import { ALL_BLOCK_TYPES, ALL_MARK_TYPES } from "./constants";
import { selectionToPlainText } from "./utils";
import {
  AIOperation,
  applyAIOperationsToSlate,
  coerceAiSlateNodeForImport,
} from "../../../app/dashboard/vazlatok/slateOperations";
import { acceptAIDiffGroup, rejectAIDiffGroup } from "./utils";
import { extractPartialMessageToClient } from "./streamingAiMessage";
import { Node } from "slate";

type LoadPhase = "idle" | "sending" | "processing";

type SortableOperation = AIOperation & { __sourceIndex: number };
type ParsedAiPayload = Omit<GroupedAiResponse, "operations"> & {
  operations: AIOperation[];
  groups: NonNullable<GroupedAiResponse["groups"]>;
};

function normalizeAction(value: unknown): AIOperation["action"] | null {
  if (
    value === "add" ||
    value === "append" ||
    value === "prepend" ||
    value === "replace" ||
    value === "remove"
  ) {
    return value;
  }
  return null;
}

function normalizeOperationContent(value: unknown): Node | Node[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const nodes = value
      .flatMap((item) => {
        const c = coerceAiSlateNodeForImport(item);
        return Array.isArray(c) ? c : [c];
      })
      .filter((item): item is Node => Node.isNode(item));
    return nodes.length > 0 ? nodes : undefined;
  }
  const coerced = coerceAiSlateNodeForImport(value);
  if (Array.isArray(coerced)) {
    const nodes = coerced.filter((item): item is Node => Node.isNode(item));
    if (nodes.length === 0) return undefined;
    return nodes.length === 1 ? nodes[0] : nodes;
  }
  return Node.isNode(coerced) ? coerced : undefined;
}

function normalizeAiResponsePayload(data: unknown): ParsedAiPayload {
  const root = (data ?? {}) as Record<string, unknown>;
  const response = (root.response ?? {}) as Record<string, unknown>;
  const source =
    Array.isArray(response.operations) || response.changeSetId ? response : root;

  const fallbackChangeSetId = typeof source.changeSetId === "string"
    ? source.changeSetId
    : undefined;
  const baseRevision =
    typeof source.baseRevision === "string" ? source.baseRevision : undefined;
  const resultRevision =
    typeof source.resultRevision === "string"
      ? source.resultRevision
      : undefined;
  const conflicts = Array.isArray(source.conflicts)
    ? (source.conflicts as GroupedAiResponse["conflicts"])
    : [];

  const opsSource = Array.isArray(source.operations) ? source.operations : [];

  const mappedOperations = opsSource
    .map((op, index): SortableOperation | null => {
      if (!op || typeof op !== "object") return null;
      const record = op as Record<string, unknown>;
      const action = normalizeAction(record.action);
      if (!action) return null;

      const target =
        typeof record.target === "object" && record.target !== null
          ? (record.target as Record<string, unknown>)
          : undefined;
      const normalizedPath = Array.isArray(record.path)
        ? (record.path.filter((x) => Number.isInteger(x)) as number[])
        : Array.isArray(target?.path)
          ? (target.path.filter((x) => Number.isInteger(x)) as number[])
          : undefined;

      return {
        action,
        path: normalizedPath,
        content: normalizeOperationContent(record.content),
        oldContent: normalizeOperationContent(record.oldContent),
        newContent: normalizeOperationContent(record.newContent),
        changeSetId:
          typeof record.changeSetId === "string"
            ? record.changeSetId
            : fallbackChangeSetId,
        groupId: typeof record.groupId === "string" ? record.groupId : undefined,
        groupIndex:
          typeof record.groupIndex === "number" ? record.groupIndex : undefined,
        operationId:
          typeof record.operationId === "string"
            ? record.operationId
            : typeof record.opId === "string"
              ? record.opId
              : undefined,
        opIndex: typeof record.opIndex === "number" ? record.opIndex : undefined,
        target: {
          targetNodeId:
            typeof target?.targetNodeId === "string"
              ? target.targetNodeId
              : typeof record.targetNodeId === "string"
                ? record.targetNodeId
                : undefined,
          path: normalizedPath,
          pathVersion:
            typeof target?.pathVersion === "string"
              ? target.pathVersion
              : undefined,
          insertPosition:
            target?.insertPosition === "before" ||
            target?.insertPosition === "after" ||
            target?.insertPosition === "inside"
              ? target.insertPosition
              : undefined,
        },
        __sourceIndex: index,
      };
    })
    .filter((op): op is SortableOperation => op !== null)
    .sort((a, b) => {
      const groupA = a.groupIndex ?? Number.MAX_SAFE_INTEGER;
      const groupB = b.groupIndex ?? Number.MAX_SAFE_INTEGER;
      if (groupA !== groupB) return groupA - groupB;
      const opA = a.opIndex ?? Number.MAX_SAFE_INTEGER;
      const opB = b.opIndex ?? Number.MAX_SAFE_INTEGER;
      if (opA !== opB) return opA - opB;
      return a.__sourceIndex - b.__sourceIndex;
    });

  return {
    changeSetId: fallbackChangeSetId,
    baseRevision,
    resultRevision,
    groups: Array.isArray(source.groups)
      ? source.groups
          .filter(
            (group): group is { groupId: string; groupIndex: number; label?: string } =>
              !!group &&
              typeof group === "object" &&
              typeof (group as Record<string, unknown>).groupId === "string" &&
              typeof (group as Record<string, unknown>).groupIndex === "number",
          )
          .sort((a, b) => a.groupIndex - b.groupIndex)
      : [],
    operations: mappedOperations.map(({ __sourceIndex, ...op }) => op),
    conflicts,
    checksum:
      typeof source.checksum === "string" ? source.checksum : undefined,
    messageToClient:
      typeof source.messageToClient === "string"
        ? source.messageToClient
        : undefined,
  };
}

function hasStaleRevisionConflict(payload: { conflicts?: GroupedAiResponse["conflicts"] }): boolean {
  return (payload.conflicts ?? []).some((conflict) => {
    const code = `${conflict?.code ?? ""}`.toLowerCase();
    const type = `${conflict?.type ?? ""}`.toLowerCase();
    return code.includes("stale_revision") || type.includes("stale_revision");
  });
}

const DEFAULT_PAGE_ID = "default-page";

function buildPendingGroups(payload: ParsedAiPayload): PendingAiEditGroup[] {
  const byGroupId = new Map<string, PendingAiEditGroup>();
  const ordered = [...(payload.groups ?? [])].sort(
    (a, b) => a.groupIndex - b.groupIndex,
  );

  for (const group of ordered) {
    byGroupId.set(group.groupId, {
      groupId: group.groupId,
      groupIndex: group.groupIndex,
      label: group.label ?? `Group ${group.groupIndex + 1}`,
      changeSetId: payload.changeSetId,
      pageId: group.pageId ?? DEFAULT_PAGE_ID,
      operationIds: [],
      operationCount: group.operationCount ?? 0,
      targetSummary: "Contextual edit",
      status: "pending",
    });
  }

  for (const operation of payload.operations ?? []) {
    if (!operation.groupId) continue;
    const existing = byGroupId.get(operation.groupId);
    if (!existing) continue;
    const operationId =
      operation.operationId ??
      operation.opId ??
      `${operation.groupId}:${existing.operationCount}`;
    if (!existing.operationIds.includes(operationId)) {
      existing.operationIds.push(operationId);
      existing.operationCount += 1;
    }
    const targetPath = operation.target?.path ?? operation.path;
    if (Array.isArray(targetPath) && Number.isInteger(targetPath[0])) {
      const blockNumber = Number(targetPath[0]) + 1;
      existing.targetSummary = `Around block #${blockNumber}`;
    } else if (typeof operation.target?.targetNodeId === "string") {
      existing.targetSummary = `Around node ${operation.target.targetNodeId.slice(0, 8)}`;
    } else if (
      operation.action === "append" ||
      (operation.action === "add" && operation.target?.insertPosition === "after")
    ) {
      existing.targetSummary = "Document end";
    }
    byGroupId.set(operation.groupId, existing);
  }

  return Array.from(byGroupId.values()).sort((a, b) => a.groupIndex - b.groupIndex);
}

export const ChatPanel = ({
  draftId,
  revision,
  density = "comfortable",
  onDraftServerTouch,
}: {
  draftId?: string;
  revision?: string;
  density?: "compact" | "comfortable";
  /** Called when the server bumps draft activity (chat save); keeps parent revision / last-saved in sync. */
  onDraftServerTouch?: (updatedAtIso: string) => void;
}) => {
  const editor = useSlate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [loadPhase, setLoadPhase] = useState<LoadPhase>("idle");
  const [pendingGroups, setPendingGroups] = useState<PendingAiEditGroup[]>([]);
  const revisionRef = useRef<string | undefined>(undefined);
  const streamBufferRef = useRef("");
  const wsRef = useRef<WebSocket | null>(null);
  const wsReadyRef = useRef(false);
  const inflightRef = useRef<{
    requestId: string;
    resolve: (result: unknown) => void;
    reject: (e: Error) => void;
  } | null>(null);
  const compact = density === "compact";
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchChatHistory = useCallback(async () => {
    if (!draftId) return;
    try {
      const res = await api.draftChatsIdGetRaw({ id: Number(draftId) });
      const data = await res.raw.json();
      const msgs = Array.isArray(data) ? data : data?.messages;
      if (Array.isArray(msgs)) {
        setMessages(
          msgs.map((msg: any) => {
            let textContent = msg.message || msg.content || msg.text || "";
            if (
              typeof msg.content === "object" &&
              msg.content?.messageToClient
            ) {
              textContent = msg.content.messageToClient;
            }

            const role =
              msg.role === "ai" || msg.role === "assistant" ? "ai" : "user";
            if (role === "user" && typeof textContent === "string") {
              textContent = textContent.split("\n\nSelected Context: ")[0];
            }

            return {
              role,
              text: textContent,
            };
          }),
        );
      }
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  }, [draftId]);

  const onDraftServerTouchRef = useRef(onDraftServerTouch);
  useEffect(() => { onDraftServerTouchRef.current = onDraftServerTouch; }, [onDraftServerTouch]);
  const fetchChatHistoryRef = useRef(fetchChatHistory);
  useEffect(() => { fetchChatHistoryRef.current = fetchChatHistory; }, [fetchChatHistory]);

  useEffect(() => {
    if (!draftId) return;

    let cancelled = false;
    wsReadyRef.current = false;
    let reconnectBusy = false;

    async function handleAuthError(failedWs: WebSocket) {
      if (cancelled || reconnectBusy) return;
      reconnectBusy = true;
      try {
        const refreshed = await refreshTokenAction();
        if (cancelled) return;
        if (!refreshed) {
          failedWs.close();
          return;
        }
        failedWs.close();
        await openSocket();
      } finally {
        reconnectBusy = false;
      }
    }

    async function openSocket() {
      if (cancelled) return;
      const { accessToken } = await getAuthCookies();
      if (!accessToken || cancelled) return;

      const ws = new WebSocket(getAiWebSocketUrl());
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as Record<string, unknown>;
          if (msg.type === "authOk") {
            ws.send(
              JSON.stringify({
                v: 1,
                type: "subscribeDraft",
                id: Number(draftId),
              }),
            );
            return;
          }
          if (msg.type === "subscribeDraftOk") {
            wsReadyRef.current = true;
            return;
          }
          if (msg.type === "authError") {
            wsReadyRef.current = false;
            console.error("[ChatPanel] WebSocket auth failed");
            void handleAuthError(ws);
            return;
          }

          if (msg.v !== 1) return;
          const type = msg.type;
          const requestId =
            typeof msg.requestId === "string" ? msg.requestId : undefined;

          if (type === "draftChatSync") {
            const syncDraftId =
              typeof msg.draftId === "number"
                ? msg.draftId
                : typeof msg.draftId === "string"
                  ? parseInt(msg.draftId, 10)
                  : NaN;
            if (Number.isNaN(syncDraftId) || String(syncDraftId) !== String(draftId)) {
              return;
            }
            void fetchChatHistoryRef.current();
            return;
          }

          if (type === "chunk" && requestId && inflightRef.current?.requestId === requestId) {
            const text = typeof msg.text === "string" ? msg.text : "";
            streamBufferRef.current += text;
            const extracted = extractPartialMessageToClient(streamBufferRef.current);
            setStreamingText(extracted);
            return;
          }

          if (type === "draftChatResult" && requestId && inflightRef.current?.requestId === requestId) {
            const draftUpdatedAt =
              typeof msg.draftUpdatedAt === "string" ? msg.draftUpdatedAt : undefined;
            if (draftUpdatedAt) onDraftServerTouchRef.current?.(draftUpdatedAt);
            inflightRef.current.resolve(msg.result);
            inflightRef.current = null;
            return;
          }

          if (
            type === "error" &&
            requestId &&
            inflightRef.current?.requestId === requestId
          ) {
            const message =
              typeof msg.message === "string" ? msg.message : "WebSocket error";
            inflightRef.current.reject(new Error(message));
            inflightRef.current = null;
          }
        } catch (e) {
          console.error("[ChatPanel] WebSocket message parse error", e);
        }
      };

      ws.onopen = () => {
        ws.send(JSON.stringify({ v: 1, type: "auth", token: accessToken }));
      };

      ws.onclose = () => {
        wsReadyRef.current = false;
        if (wsRef.current === ws) wsRef.current = null;
        const pending = inflightRef.current;
        if (pending) {
          pending.reject(new Error("WebSocket closed"));
          inflightRef.current = null;
        }
      };

      ws.onerror = () => {
        const pending = inflightRef.current;
        if (pending) {
          pending.reject(new Error("WebSocket error"));
          inflightRef.current = null;
        }
      };
    }

    void openSocket();

    return () => {
      cancelled = true;
      wsReadyRef.current = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [draftId]);

  useEffect(() => {
    if (typeof revision === "string" && revision.length > 0) {
      revisionRef.current = revision;
    }
  }, [revision]);

  useEffect(() => {
    void fetchChatHistory();
  }, [fetchChatHistory]);

  const displayedMessages = [...messages].reverse();
  const pendingEditGroups = pendingGroups.filter((item) => item.status === "pending");

    const send = async () => {
    const userMessage = input.trim();
    if ((!userMessage && attachedFiles.length === 0) || loading) return;

    const selectedText = selectionToPlainText(editor);
    const finalMessage = selectedText
      ? `${userMessage}\n\nSelected Context: ${selectedText}`
      : userMessage;

    setMessages((prev) => [...prev, { role: "user", text: userMessage || "Csatolt fájlok küldése..." }]);
    setInput("");
    setLoading(true);
    setLoadPhase("sending");
    setStreamingText("");
    streamBufferRef.current = "";

    try {
      if (draftId && attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const uploadRes = await api.filesUploadPostRaw({ file });
          const uploadData = await uploadRes.raw.json();
          const fileId =
            uploadData?.file?.id ||
            uploadData?.id ||
            uploadData?.fileId ||
            uploadData?.data?.id;

          if (fileId) {
            await api.draftLinkIdPostRaw({
              id: Number(draftId),
              draftLinkIdPostRequest: { fileId: Number(fileId) },
            });
          }
        }
        setAttachedFiles([]);
        // Optional: trigger refresh on parent if needed
        // onDraftServerTouch?.();
      }
    } catch (err) {
      console.error("Failed to upload attached files", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Hiba történt a fájlok feltöltésekor." },
      ]);
      setLoading(false);
      setLoadPhase("idle");
      return;
    }

    const waitForWsReady = async (maxMs = 8000) => {
      const start = Date.now();
      while (Date.now() - start < maxMs) {
        if (
          wsRef.current?.readyState === WebSocket.OPEN &&
          wsReadyRef.current
        ) {
          return;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      throw new Error("WebSocket not ready");
    };

    const postAiEditRequest = async (baseRevision?: string) => {
      if (!draftId) return null;
      setLoadPhase("sending");
      streamBufferRef.current = "";
      setStreamingText("");
      await waitForWsReady();
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket not connected");
      }

      const requestId = `ui-req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      return new Promise<unknown>((resolve, reject) => {
        inflightRef.current = { requestId, resolve, reject };
        try {
          ws.send(
            JSON.stringify({
              v: 1,
              type: "draftChat",
              id: Number(draftId),
              clientTabId: getEditorTabId(),
              requestId,
              payload: {
                message: finalMessage,
                currentContext: editor.children,
                editorOptions: [...ALL_BLOCK_TYPES, ...ALL_MARK_TYPES],
                responseMode: "grouped",
                baseRevision,
                requestId,
                idempotencyKey: `draft-${draftId}-edit-${Date.now()}`,
              },
            }),
          );
          setLoadPhase("processing");
        } catch (e) {
          inflightRef.current = null;
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      });
    };

    const fetchLatestRevision = async (): Promise<string | undefined> => {
      if (!draftId) return undefined;
      const latest = await api.draftsIdGetRaw({ id: Number(draftId) });
      const payload = await latest.raw.json();
      const latestDraft = payload?.draft ?? payload;
      if (typeof latestDraft?.updatedAt !== "string") return undefined;
      return new Date(latestDraft.updatedAt).toISOString();
    };

    try {
      ensureEditorHasTopLevelNodeIds(editor);
      if (!draftId) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Kérlek, előbb mentsd el a vázlatot az AI használatához." },
        ]);
        setLoading(false);
        setLoadPhase("idle");
        setStreamingText("");
        streamBufferRef.current = "";
        return;
      }

      let data = (await postAiEditRequest(revisionRef.current)) as Record<
        string,
        unknown
      > | null;
      if (!data) return;

      if (typeof data.code === "number" && data.code !== 200) {
        const msg =
          typeof data.message === "string"
            ? data.message
            : "AI request failed";
        throw new Error(msg);
      }

      let normalizedPayload = normalizeAiResponsePayload(data);

      if (hasStaleRevisionConflict(normalizedPayload)) {
        const latestRevision = await fetchLatestRevision();
        if (latestRevision) {
          revisionRef.current = latestRevision;
          data = (await postAiEditRequest(latestRevision)) as Record<
            string,
            unknown
          > | null;
          if (!data) return;
          if (typeof data.code === "number" && data.code !== 200) {
            const msg =
              typeof data.message === "string"
                ? data.message
                : "AI request failed";
            throw new Error(msg);
          }
          normalizedPayload = normalizeAiResponsePayload(data);
        }
      }

      if (hasStaleRevisionConflict(normalizedPayload)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Nem sikerült alkalmazni a módosításokat. Kérlek, próbáld újra.",
          },
        ]);
        return;
      }

      const parsedOps = (normalizedPayload.operations ?? []) as AIOperation[];
      if (parsedOps && Array.isArray(parsedOps)) {
        applyAIOperationsToSlate(editor, parsedOps);
      }
      const nextPendingGroups = buildPendingGroups(normalizedPayload);
      setPendingGroups((prev) => {
        const preserved = prev.filter((item) => item.status === "pending");
        return [...preserved, ...nextPendingGroups];
      });
      revisionRef.current = normalizedPayload.resultRevision ?? revisionRef.current;

      const replyMessage =
        normalizedPayload.messageToClient ||
        (data.response as { messageToClient?: string } | undefined)
          ?.messageToClient ||
        (data as { messageToClient?: string }).messageToClient ||
        (data as { message?: string }).message ||
        "I've applied the changes to your document!";

      setMessages((prev) => [...prev, { role: "ai", text: replyMessage }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            error?.message?.includes("file-context-too-large")
              ? "A csatolt fajlok tul nagyok az AI kontextushoz. Torolj nehany fajlt, vagy tolts fel kisebb valtozatot."
              : "Error: could not reach the AI.",
        },
      ]);
    } finally {
      setLoading(false);
      setLoadPhase("idle");
      setStreamingText("");
      streamBufferRef.current = "";
    }
  };

  const markGroupStatus = (
    groupId: string,
    status: PendingAiEditGroup["status"],
  ) => {
    setPendingGroups((prev) =>
      prev.map((group) =>
        group.groupId === groupId ? { ...group, status } : group,
      ),
    );
  };

  const onAcceptGroup = (group: PendingAiEditGroup) => {
    acceptAIDiffGroup(editor, {
      aiGroupId: group.groupId,
      aiChangeSetId: group.changeSetId,
    });
    markGroupStatus(group.groupId, "accepted");
  };

  const onRejectGroup = (group: PendingAiEditGroup) => {
    rejectAIDiffGroup(editor, {
      aiGroupId: group.groupId,
      aiChangeSetId: group.changeSetId,
    });
    markGroupStatus(group.groupId, "rejected");
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [overscroll, setOverscroll] = useState(0);
  const overscrollRaf = useRef(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    cancelAnimationFrame(overscrollRaf.current);
    overscrollRaf.current = requestAnimationFrame(() => {
      const atBottom = el.scrollTop >= 0;
      const atTop = el.scrollTop <= -(el.scrollHeight - el.clientHeight);
      if (atBottom) {
        setOverscroll(Math.min(el.scrollTop, 30));
      } else if (atTop) {
        const over = -(el.scrollHeight - el.clientHeight) - el.scrollTop;
        setOverscroll(Math.max(-over, -30));
      } else {
        setOverscroll(0);
      }
    });
  }, []);

  const handleScrollEnd = useCallback(() => {
    setOverscroll(0);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseLeave={handleScrollEnd}
        className={cn(
          "flex min-h-0 flex-1 flex-col-reverse overflow-y-auto",
          compact ? "gap-1.5 px-3 py-3" : "gap-2 px-4 py-4",
        )}
        style={{
          transform: overscroll !== 0 ? `translateY(${overscroll * 0.3}px)` : undefined,
          transition: overscroll === 0 ? "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
        }}
      >
        {loading && loadPhase === "sending" && (
          <div className="flex w-full justify-start" aria-live="polite" aria-busy="true">
            <div className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-muted-foreground rounded-[1.25rem] rounded-bl-[0.35rem] bg-muted/50">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Küldés...</span>
            </div>
          </div>
        )}
        {loading && loadPhase === "processing" && streamingText.length === 0 && (
          <div className="flex w-full justify-start" aria-live="polite" aria-busy="true">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[1.25rem] rounded-bl-[0.35rem] bg-muted/50">
              <div className="flex gap-1">
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-foreground/20 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        {loading && loadPhase === "processing" && streamingText.length > 0 && (
          <div className="flex w-full justify-start">
            <div
              className={cn(
                "px-3.5 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap rounded-[1.25rem] rounded-bl-[0.35rem] bg-muted/50 text-foreground",
                compact ? "max-w-[92%]" : "max-w-[85%]",
              )}
            >
              {streamingText}
              <span
                className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 rounded-sm bg-primary align-middle animate-pulse"
                aria-hidden
              />
            </div>
          </div>
        )}
        {pendingEditGroups.length > 0 && (
          <div className="mx-1 rounded-2xl bg-muted/30 p-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Függőben lévő AI módosítások
            </p>
            <div className="space-y-1.5">
              {pendingEditGroups.map((group) => (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  key={group.groupId}
                  className="rounded-xl bg-background/60 p-2.5"
                >
                  <p className="text-sm font-medium text-foreground">
                    {group.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {group.operationCount} módosítás - {group.targetSummary}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors"
                      onClick={() => onAcceptGroup(group)}
                    >
                      Elfogadás
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors"
                      onClick={() => onRejectGroup(group)}
                    >
                      Elutasítás
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        {displayedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
            <Sparkles className="size-8 mb-3" />
            <p className="text-xs text-center">
              Kérdezz bármit a dokumentumról...
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {displayedMessages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              key={i}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "px-3.5 py-2 text-[0.9375rem] leading-relaxed whitespace-pre-wrap",
                  compact ? "max-w-[92%]" : "max-w-[85%]",
                  msg.role === "user"
                    ? "bg-[#007aff] text-white rounded-[1.25rem] rounded-br-[0.35rem]"
                    : "bg-muted/50 text-foreground rounded-[1.25rem] rounded-bl-[0.35rem]",
                )}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div
        className={cn(
          "shrink-0 flex flex-col bg-background",
          compact ? "px-2.5 py-2" : "px-3 py-2.5",
        )}
      >
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-1 bg-muted/40 text-xs px-2 py-1 rounded-full">
                <Paperclip className="w-3 h-3 text-muted-foreground" />
                <span className="truncate max-w-[120px] text-foreground">{file.name}</span>
                <button
                  type="button"
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <X className="w-2.5 h-2.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1.5 items-end">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
              }
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full transition-colors shrink-0"
            title="Fájl csatolása"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <textarea
            rows={1}
            className="flex-1 resize-none bg-transparent px-1 py-1.5 text-[0.9375rem] outline-none placeholder:text-muted-foreground/60"
            placeholder="Üzenet..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || (!input.trim() && attachedFiles.length === 0)}
            aria-busy={loading}
            className={cn(
              "shrink-0 flex items-center justify-center size-8 rounded-full transition-all",
              "cursor-pointer active:scale-90",
              input.trim() || attachedFiles.length > 0
                ? "bg-[#007aff] text-white"
                : "text-muted-foreground/40",
              "disabled:cursor-not-allowed disabled:opacity-40",
              loading && "pointer-events-none",
            )}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            <span className="sr-only">{loading ? "Küldés..." : "Üzenet küldése"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
