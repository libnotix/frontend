"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { getAiWebSocketUrl } from "@/lib/aiWebSocket";
import { getEditorTabId } from "@/lib/editorTabId";
import { getAuthCookies, refreshTokenAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ExamAiEditResponse } from "@/api";
import {
   ExamAttachmentMetaItemKindEnum,
   type ExamAttachmentMetaItem,
   ResponseError,
} from "@/api";
import { extractPartialReplyFromExamEditBuffer } from "./extractPartialExamReply";
import { usePendingExamEditsStore } from "./pendingExamEditsStore";
import { ExamChatAttachPopover } from "./ExamChatAttachPopover";
import { ExamChatAttachmentChip, type ExamChatAttachmentChipItem } from "./ExamChatAttachmentChip";

export type ExamChatPanelProps = {
   examId: number | null;
   examUpdatedAt: string | null;
   clientQuestions?: { clientId: string; serverId?: number | null; questionId?: number }[];
};

export type PersistedAttachment = {
   fileId: number;
   filename: string;
   kind?: "file" | "draft";
   draftId?: number;
};

type ChatAugmented = {
   role: "user" | "ai";
   text: string;
   response?: ExamAiEditResponse;
   idempotencyKey?: string;
   messageId?: string;
   sendStatus?: "sending" | "sent" | "error";
   sendError?: string;
   attachedFiles?: PersistedAttachment[];
};

type LocalAttachment = {
   localId: string;
   kind: "file" | "draft";
   label: string;
   fileId?: number;
   draftId?: number;
   status: "uploading" | "linking" | "ready" | "error";
   errorMessage?: string;
   pendingFile?: File;
};

type StreamPhase = "idle" | "connecting" | "thinking" | "streaming";

function parsePersistedAttachments(raw: unknown): PersistedAttachment[] | undefined {
   if (!Array.isArray(raw)) return undefined;
   const out: PersistedAttachment[] = [];
   for (const row of raw) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      if (typeof r.fileId !== "number" || !Number.isInteger(r.fileId)) continue;
      const filename =
         typeof r.filename === "string" ? r.filename : String(r.fileId);
      const kind = r.kind === "draft" ? ("draft" as const) : ("file" as const);
      const draftId =
         typeof r.draftId === "number" && Number.isInteger(r.draftId) ? r.draftId : undefined;
      out.push(
         draftId !== undefined
            ? { fileId: r.fileId, filename, kind, draftId }
            : { fileId: r.fileId, filename, kind },
      );
   }
   return out.length > 0 ? out : undefined;
}

function localToChipItem(a: LocalAttachment): ExamChatAttachmentChipItem {
   return {
      localId: a.localId,
      kind: a.kind,
      label: a.label,
      status: a.status,
      errorMessage: a.errorMessage,
   };
}

export function ExamChatPanel({ examId, examUpdatedAt, clientQuestions }: ExamChatPanelProps) {
   const [lines, setLines] = useState<ChatAugmented[]>([]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [streaming, setStreaming] = useState("");
   const [streamPhase, setStreamPhase] = useState<StreamPhase>("idle");
   const [retrying, setRetrying] = useState<{ attempt: number; max: number } | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
   const applyEdits = usePendingExamEditsStore((s) => s.applyEdits);
   const streamBuf = useRef("");
   const wsReady = useRef(false);
   const wsRef = useRef<WebSocket | null>(null);
   const chunkStarted = useRef(false);
   const inflight = useRef<{
      requestId: string;
      resolve: (value: unknown) => void;
      reject: (e: Error) => void;
   } | null>(null);

   const attachBusy = attachments.some(
      (a) => a.status === "uploading" || a.status === "linking",
   );

   const loadHistory = useCallback(async () => {
      if (!examId) return;
      try {
         const res = await api.examChatsIdGetRaw({ id: examId });
         const payload = await res.raw.json();
         const rawMessages =
            payload?.messages && Array.isArray(payload.messages)
               ? payload.messages
               : Array.isArray(payload)
                 ? payload
                 : [];
         const next: ChatAugmented[] = [];
         for (const msg of rawMessages as {
            role?: string;
            content?: unknown;
            id?: string;
            idempotencyKey?: string;
            attachedFiles?: unknown;
         }[]) {
            const role = msg.role === "user" || msg.role === "ai" ? msg.role : "user";
            let text = "";
            let response: ExamAiEditResponse | undefined;
            if (typeof msg.content === "string") {
               text = msg.content;
            } else if (
               msg.content &&
               typeof msg.content === "object" &&
               msg.content !== null &&
               "reply" in msg.content
            ) {
               response = msg.content as ExamAiEditResponse;
               text = response.reply ?? "";
            } else if (msg.content != null && typeof msg.content === "object") {
               text = JSON.stringify(msg.content);
            }
            const idempotencyKey =
               typeof msg.idempotencyKey === "string" ? msg.idempotencyKey : undefined;
            const messageId = typeof msg.id === "string" ? msg.id : undefined;
            const attachedFiles = parsePersistedAttachments(msg.attachedFiles);
            next.push({
               role,
               text,
               response,
               idempotencyKey,
               messageId,
               attachedFiles,
            });
         }
         setLines(next);
      } catch {
         setError("A chat előzményei nem tölthetők be.");
      }
   }, [examId]);

   useEffect(() => {
      startTransition(() => {
         if (!examId) {
            setLines([]);
            return;
         }
         void loadHistory();
      });
   }, [examId, loadHistory]);

   useEffect(() => {
      if (!examId) return;

      let cancelled = false;
      wsReady.current = false;
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

         ws.onopen = () => {
            ws.send(JSON.stringify({ v: 1, type: "auth", token: accessToken }));
         };

         ws.onmessage = (ev) => {
            try {
               const msg = JSON.parse(String(ev.data)) as Record<string, unknown>;
               const mType = msg.type;

               if (mType === "authOk") {
                  ws.send(JSON.stringify({ v: 1, type: "subscribeExam", id: examId }));
                  return;
               }
               if (mType === "subscribeExamOk") {
                  wsReady.current = true;
                  return;
               }
               if (mType === "authError") {
                  wsReady.current = false;
                  void handleAuthError(ws);
                  return;
               }

               const requestId = typeof msg.requestId === "string" ? msg.requestId : undefined;

               if (mType === "examChatSync") {
                  void loadHistory();
                  return;
               }

               if (
                  msg.v === 1 &&
                  mType === "examEditRetrying" &&
                  requestId &&
                  inflight.current?.requestId === requestId
               ) {
                  setRetrying({
                     attempt: typeof msg.attempt === "number" ? msg.attempt : 1,
                     max: typeof msg.maxAttempts === "number" ? msg.maxAttempts : 8,
                  });
                  return;
               }

               if (msg.v === 1 && mType === "chunk" && requestId && inflight.current?.requestId === requestId) {
                  if (!chunkStarted.current) {
                     chunkStarted.current = true;
                     setStreamPhase("streaming");
                  }
                  streamBuf.current += typeof msg.text === "string" ? msg.text : "";
                  setStreaming(extractPartialReplyFromExamEditBuffer(streamBuf.current));
                  return;
               }

               if (
                  msg.v === 1 &&
                  mType === "examEditResult" &&
                  requestId &&
                  inflight.current?.requestId === requestId
               ) {
                  setRetrying(null);
                  inflight.current.resolve(msg.result);
                  inflight.current = null;
                  setStreaming("");
                  streamBuf.current = "";
                  return;
               }

               if (msg.v === 1 && mType === "error" && requestId && inflight.current?.requestId === requestId) {
                  setRetrying(null);
                  inflight.current.reject(
                     new Error(typeof msg.message === "string" ? msg.message : "exam-edit-error"),
                  );
                  inflight.current = null;
                  setStreaming("");
                  streamBuf.current = "";
               }
            } catch {
               /* ignore */
            }
         };

         ws.onclose = () => {
            wsReady.current = false;
            const p = inflight.current;
            if (p) {
               p.reject(new Error("WebSocket bezáródott."));
               inflight.current = null;
            }
         };
      }

      void openSocket();

      return () => {
         cancelled = true;
         wsReady.current = false;
         wsRef.current?.close();
         wsRef.current = null;
      };
   }, [examId, loadHistory]);

   const makeLocalId = () => `loc-${crypto.randomUUID()}`;

   const clearAllAttachments = () => setAttachments([]);

   const onSelectLinkedFile = useCallback((fileId: number, filename: string) => {
      setAttachments((prev) => {
         if (prev.some((a) => a.fileId === fileId && a.status === "ready")) return prev;
         return [
            ...prev,
            {
               localId: makeLocalId(),
               kind: "file",
               label: filename,
               fileId,
               status: "ready",
            },
         ];
      });
   }, []);

   const runDraftAttach = useCallback(
      async (draftId: number, title: string) => {
         if (!examId) return;

         let localId = "";
         setAttachments((prev) => {
            if (
               prev.some(
                  (a) =>
                     a.kind === "draft" &&
                     a.draftId === draftId &&
                     (a.status === "ready" || a.status === "uploading" || a.status === "linking"),
               )
            ) {
               return prev;
            }
            localId = makeLocalId();
            const withoutStaleErrors = prev.filter(
               (a) => !(a.kind === "draft" && a.draftId === draftId && a.status === "error"),
            );
            return [
               ...withoutStaleErrors,
               {
                  localId,
                  kind: "draft" as const,
                  label: title,
                  draftId,
                  status: "uploading" as const,
               },
            ];
         });

         // Duplicate pick — skipped inside setState above; nothing to attach
         if (!localId) return;

         try {
            const res = await api.examsIdAttachDraftPostRaw({
               id: examId,
               examsIdAttachDraftPostRequest: { draftId },
            });
            const data = (await res.raw.json()) as {
               code?: number;
               message?: string;
               fileId?: number;
               draftTitle?: string;
            };
            const code = typeof data.code === "number" ? data.code : res.raw.status;
            if (code !== 200 || typeof data.fileId !== "number") {
               throw new Error(
                  typeof data.message === "string" ? data.message : "Vázlat csatolása nem sikerült.",
               );
            }
            setAttachments((prev) =>
               prev.map((a) =>
                  a.localId === localId
                     ? {
                          ...a,
                          status: "ready",
                          fileId: data.fileId,
                          label:
                             typeof data.draftTitle === "string" && data.draftTitle.trim()
                                ? data.draftTitle
                                : title,
                       }
                     : a,
               ),
            );
         } catch (e) {
            let err = e instanceof Error ? e.message : "Hiba";
            if (e instanceof ResponseError) {
               try {
                  const body = (await e.response.json()) as { message?: string };
                  if (typeof body?.message === "string" && body.message.trim()) {
                     err = body.message;
                  }
               } catch {
                  /* keep generic err */
               }
            }
            setAttachments((prev) =>
               prev.map((a) =>
                  a.localId === localId ? { ...a, status: "error", errorMessage: err } : a,
               ),
            );
         }
      },
      [examId],
   );

   const runFileUploadAndLink = useCallback(
      async (file: File, localId: string) => {
         if (!examId) return;
         setAttachments((prev) =>
            prev.map((a) => (a.localId === localId ? { ...a, status: "uploading", pendingFile: file } : a)),
         );
         try {
            const uploadRes = await api.filesUploadPostRaw({ file });
            const uploadData = await uploadRes.raw.json();
            const fileId =
               uploadData?.file?.id ??
               uploadData?.id ??
               uploadData?.fileId ??
               uploadData?.data?.id;
            if (typeof fileId !== "number") throw new Error("Nincs file ID a válaszban.");

            setAttachments((prev) =>
               prev.map((a) =>
                  a.localId === localId ? { ...a, status: "linking", fileId: Number(fileId) } : a,
               ),
            );

            await api.examLinkIdPostRaw({
               id: examId,
               examLinkIdPostRequest: { fileId: Number(fileId) },
            });

            setAttachments((prev) =>
               prev.map((a) =>
                  a.localId === localId
                     ? {
                          ...a,
                          status: "ready",
                          fileId: Number(fileId),
                          label:
                             typeof uploadData?.file?.originalFilename === "string"
                                ? uploadData.file.originalFilename
                                : file.name,
                       }
                     : a,
               ),
            );
         } catch (e) {
            const err = e instanceof Error ? e.message : "Hiba";
            setAttachments((prev) =>
               prev.map((a) =>
                  a.localId === localId
                     ? { ...a, status: "error", errorMessage: err, pendingFile: file }
                     : a,
               ),
            );
         }
      },
      [examId],
   );

   const onPickLocalFiles = useCallback(
      (files: File[]) => {
         for (const file of files) {
            const localId = makeLocalId();
            setAttachments((prev) => [
               ...prev,
               { localId, kind: "file", label: file.name, status: "uploading", pendingFile: file },
            ]);
            void runFileUploadAndLink(file, localId);
         }
      },
      [runFileUploadAndLink],
   );

   const removeAttachment = (localId: string) => {
      setAttachments((prev) => prev.filter((a) => a.localId !== localId));
   };

   const retryAttachment = (a: LocalAttachment) => {
      if (a.kind === "file" && a.pendingFile && a.status === "error") {
         void runFileUploadAndLink(a.pendingFile, a.localId);
      }
      if (a.kind === "draft" && a.draftId && a.status === "error") {
         void runDraftAttach(a.draftId, a.label);
      }
   };

   const send = async () => {
      const trimmed = input.trim();
      if (!trimmed || loading || attachBusy) return;

      let idempotencyKeyForCatch = "";

      setError(null);
      setInput("");
      setLoading(true);
      chunkStarted.current = false;
      setStreaming("");
      setStreamPhase("connecting");
      setRetrying(null);

      if (!examId) {
         setLines((prev) => [
            ...prev,
            { role: "user", text: trimmed },
            {
               role: "ai",
               text: "Előbb mentsd el a dolgozatot, hogy használhasd az AI chatet.",
            },
         ]);
         setLoading(false);
         setStreamPhase("idle");
         return;
      }

      const ready = attachments.filter((a) => a.status === "ready" && a.fileId != null);

      try {
         const deadline = Date.now() + 8000;
         while (Date.now() < deadline) {
            if (wsRef.current?.readyState === WebSocket.OPEN && wsReady.current) break;
            await new Promise((r) => setTimeout(r, 25));
         }

         const ws = wsRef.current;
         if (!ws || ws.readyState !== WebSocket.OPEN || !wsReady.current) throw new Error("WebSocket nem elérhető");

         const requestId = `ee-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
         const idempotencyKey = `exam-${examId}-${requestId}`;
         idempotencyKeyForCatch = idempotencyKey;

         streamBuf.current = "";

         const fileIds =
            ready.length > 0
               ? Array.from(
                    new Set(
                       ready.map((a) => a.fileId).filter((n): n is number => typeof n === "number"),
                    ),
                 )
               : [];

         const attachmentMeta: ExamAttachmentMetaItem[] = ready.map((a) => ({
            fileId: a.fileId!,
            kind:
               a.kind === "draft"
                  ? ExamAttachmentMetaItemKindEnum.Draft
                  : ExamAttachmentMetaItemKindEnum.File,
            ...(a.kind === "draft" && a.draftId != null ? { draftId: a.draftId } : {}),
         }));

         const optimisticAttached: PersistedAttachment[] | undefined =
            ready.length > 0
               ? ready.map((a) => ({
                    fileId: a.fileId!,
                    filename: a.label,
                    kind: a.kind,
                    ...(a.kind === "draft" && a.draftId != null ? { draftId: a.draftId } : {}),
                 }))
               : undefined;

         setLines((prev) => [
            ...prev,
            {
               role: "user",
               text: trimmed,
               idempotencyKey,
               sendStatus: "sending",
               attachedFiles: optimisticAttached,
            },
         ]);

         setStreamPhase("thinking");

         const result = await new Promise<unknown>((resolve, reject) => {
            inflight.current = {
               requestId,
               resolve,
               reject,
            };
            try {
               ws.send(
                  JSON.stringify({
                     v: 1,
                     type: "examEdit",
                     id: examId,
                     clientTabId: getEditorTabId(),
                     requestId,
                     payload: {
                        message: trimmed,
                        baseRevision: examUpdatedAt ?? undefined,
                        requestId,
                        idempotencyKey,
                        clientQuestions: clientQuestions ?? [],
                        ...(fileIds.length > 0 ? { fileIds } : {}),
                        ...(attachmentMeta.length > 0 ? { attachmentMeta } : {}),
                     },
                  }),
               );
            } catch (e) {
               inflight.current = null;
               reject(e instanceof Error ? e : new Error(String(e)));
            }
         });

         setLines((prev) =>
            prev.map((row) =>
               row.role === "user" && row.idempotencyKey === idempotencyKey
                  ? { ...row, sendStatus: "sent" }
                  : row,
            ),
         );

         const payload = typeof result === "object" && result !== null ? (result as Record<string, unknown>) : {};
         const code = typeof payload.code === "number" ? payload.code : 500;
         if (code === 413) {
            throw new Error(
               typeof payload.message === "string" ? payload.message : "A mellékletek kontextusa túl nagy.",
            );
         }
         if (code !== 200) {
            throw new Error(typeof payload.message === "string" ? payload.message : "AI hiba");
         }

         const response = payload.response as ExamAiEditResponse | undefined;
         if (response) {
            applyEdits(examId, { response });
         }

         await loadHistory();
      } catch (e) {
         const msg = e instanceof Error ? e.message : "Ismeretlen hiba";
         setError(msg);
         setLines((prev) => {
            const patched = prev.map((row): ChatAugmented =>
               row.role === "user" && row.idempotencyKey === idempotencyKeyForCatch
                  ? {
                       ...row,
                       sendStatus: "error",
                       sendError: msg,
                    }
                  : row,
            );
            return [...patched, { role: "ai", text: `Hiba: ${msg}` }];
         });
      } finally {
         setLoading(false);
         setStreaming("");
         setStreamPhase("idle");
         setRetrying(null);
         chunkStarted.current = false;
      }
   };

   const showAiBubble = loading;
   const streamLabel =
      streamPhase === "connecting"
         ? "Csatlakozás…"
         : streamPhase === "thinking"
           ? retrying != null
              ? `Terhelés, újrapróbálás (${retrying.attempt}/${retrying.max})…`
              : "Gondolkodik…"
           : "";

   return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
         <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
            {!examId ? (
               <p className="mb-3 text-center text-xs text-muted-foreground">
                  Mentsd a dolgozatot és térj vissza — addig a chat zárolva.
               </p>
            ) : null}
            {error ? (
               <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                  {error}
               </p>
            ) : null}
            <div className="flex min-h-full flex-col justify-end">
               <div className="flex flex-col-reverse gap-3">
                  {showAiBubble ? (
                     <div className="flex w-full justify-start">
                        <div className="w-fit max-w-[95%] rounded-xl border border-border/60 bg-card/90 px-3 py-2 text-sm text-muted-foreground">
                           {streamPhase === "streaming" && streaming ? (
                              <>
                                 {streaming}
                                 <Loader2 className="ml-2 inline size-4 animate-spin" aria-hidden />
                              </>
                           ) : (
                              <>
                                 <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden />
                                 {streamLabel || "AI…"}
                              </>
                           )}
                        </div>
                     </div>
                  ) : null}
                  {lines
                     .slice()
                     .reverse()
                     .map((row, i) => (
                        <div
                           key={`${row.messageId ?? row.idempotencyKey ?? `${row.role}-${i}-${row.text.slice(0, 12)}`}`}
                           className={cn(
                              "flex w-full min-w-0",
                              row.role === "user" ? "justify-end" : "justify-start",
                           )}
                        >
                           <div
                              className={cn(
                                 "w-fit max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                                 row.role === "user"
                                    ? "bg-primary/15 text-foreground"
                                    : "border border-border/60 bg-card/90 text-foreground",
                              )}
                           >
                              <p className="wrap-break-word whitespace-pre-wrap">{row.text}</p>
                              {row.role === "user" && Array.isArray(row.attachedFiles) && row.attachedFiles.length > 0 ? (
                                 <AttachmentChipsReadonly files={row.attachedFiles} />
                              ) : null}
                              {row.role === "user" && row.sendStatus === "sending" ? (
                                 <p className="mt-1.5 text-[10px] text-muted-foreground">Küldés…</p>
                              ) : null}
                              {row.role === "user" && row.sendStatus === "sent" ? (
                                 <p className="mt-1.5 text-[10px] text-muted-foreground">Elküldve</p>
                              ) : null}
                              {row.role === "user" && row.sendStatus === "error" && row.sendError ? (
                                 <p className="mt-1.5 text-[10px] text-destructive">{row.sendError}</p>
                              ) : null}
                              {row.role === "ai" && row.response?.hasEdits ? (
                                 <SuggestedEditsBlock />
                              ) : null}
                           </div>
                        </div>
                     ))}
               </div>
            </div>
         </div>

         <div className="shrink-0 border-t border-border/50 p-3">
            {attachments.length > 0 ? (
               <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((a) => (
                     <ExamChatAttachmentChip
                        key={a.localId}
                        item={localToChipItem(a)}
                        onRemove={() => removeAttachment(a.localId)}
                        onRetry={
                           a.status === "error"
                              ? () => {
                                   retryAttachment(a);
                                }
                              : undefined
                        }
                     />
                  ))}
                  <button
                     type="button"
                     className="self-center text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                     onClick={clearAllAttachments}
                  >
                     Csatolmányok eltávolítása
                  </button>
               </div>
            ) : null}
            <div className="flex gap-2">
               <ExamChatAttachPopover
                  examId={examId}
                  disabled={loading || !examId}
                  onSelectLinkedFile={onSelectLinkedFile}
                  onSelectDraft={(did, title) => void runDraftAttach(did, title)}
                  onPickLocalFiles={onPickLocalFiles}
               />
               <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  rows={2}
                  placeholder={
                     examId ? "Írj üzenetet a dolgozatról…" : "Ments előbb a dolgozatot…"
                  }
                  className="min-h-[52px] flex-1 resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70"
               />
               <Button
                  type="button"
                  size="icon"
                  className="h-[52px] w-12 shrink-0"
                  disabled={
                     loading ||
                     attachBusy ||
                     !examId ||
                     !(input.trim().length > 0)
                  }
                  onClick={() => void send()}
               >
                  {loading ? (
                     <Loader2 className="size-5 animate-spin" aria-hidden />
                  ) : (
                     <Send className="size-5" aria-hidden />
                  )}
               </Button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
               <Sparkles className="size-3" aria-hidden />
               Magyar nyelvű válasz; a szerkesztési csomag a választás után a kártyákon látszik.
            </p>
         </div>
      </div>
   );
}

function AttachmentChipsReadonly({ files }: { files: PersistedAttachment[] }) {
   return (
      <div className="mt-2 flex flex-wrap gap-1.5">
         {files.map((f) => (
            <span
               key={`${f.fileId}-${f.filename}`}
               className="inline-flex max-w-full items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[10px]"
               title={f.filename}
            >
               {f.kind === "draft" ? (
                  <span className="text-muted-foreground">Vázlat</span>
               ) : (
                  <span className="text-muted-foreground">Fájl</span>
               )}
               <span className="truncate font-medium">{f.filename}</span>
            </span>
         ))}
      </div>
   );
}

function SuggestedEditsBlock() {
   return (
      <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-2 text-[11px] text-muted-foreground">
         <strong className="font-semibold text-foreground">Javasolt módosítások:</strong> a jobb oldali szerkesztőben keresd a megjelölt
         feladatkártyákat.
      </div>
   );
}
