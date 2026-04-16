"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  UploadCloud,
  File as FileIcon,
  Loader2,
  CheckCircle2,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { API_BASE_PATH, api } from "@/lib/api";
import { getAuthCookies } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const ACCEPTED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".md",
]);

function isAcceptedFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.includes(".")
    ? `.${file.name.split(".").pop()!.toLowerCase()}`
    : "";
  return ACCEPTED_EXTENSIONS.has(ext);
}

interface FileDropzoneProps {
  draftId?: string;
  onUploadSuccess?: () => void;
  linkedFiles?: { fileId: number; filename: string }[];
}

type QueueStatus = "pending" | "uploading" | "linking" | "success" | "error";
type UploadQueueItem = {
  id: string;
  file: File;
  status: QueueStatus;
  errorMessage?: string;
};

export const FileDropzone = ({
  draftId,
  onUploadSuccess,
  linkedFiles = [],
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);
  const [unlinkError, setUnlinkError] = useState("");

  const handleUnlink = async (fileId: number) => {
    try {
      setUnlinkingId(fileId);
      setUnlinkError("");
      const { accessToken } = await getAuthCookies();
      const res = await fetch(`${API_BASE_PATH}/draft-link/${draftId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });
      if (!res.ok) throw new Error("Failed to unlink");
      onUploadSuccess?.();
    } catch (e) {
      console.error(e);
      setUnlinkError("Sikertelen törlés.");
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processQueueItem = useCallback(
    async (item: UploadQueueItem) => {
      if (!draftId) {
        setQueue((prev) =>
          prev.map((queued) =>
            queued.id === item.id
              ? {
                  ...queued,
                  status: "error",
                  errorMessage: "Please save the draft before uploading files.",
                }
              : queued,
          ),
        );
        return;
      }

      setQueue((prev) =>
        prev.map((queued) =>
          queued.id === item.id ? { ...queued, status: "uploading" } : queued,
        ),
      );

      try {
        const uploadRes = await api.filesUploadPostRaw({ file: item.file });
        const uploadData = await uploadRes.raw.json();
        const fileId =
          uploadData?.file?.id ||
          uploadData?.id ||
          uploadData?.fileId ||
          uploadData?.data?.id;

        if (!fileId) {
          throw new Error("Mismatched file ID in response");
        }

        setQueue((prev) =>
          prev.map((queued) =>
            queued.id === item.id ? { ...queued, status: "linking" } : queued,
          ),
        );

        await api.draftLinkIdPostRaw({
          id: Number(draftId),
          draftLinkIdPostRequest: { fileId: Number(fileId) },
        });

        setQueue((prev) =>
          prev.map((queued) =>
            queued.id === item.id ? { ...queued, status: "success" } : queued,
          ),
        );
        onUploadSuccess?.();
      } catch (error: any) {
        console.error("Upload failed", error);
        setQueue((prev) =>
          prev.map((queued) =>
            queued.id === item.id
              ? {
                  ...queued,
                  status: "error",
                  errorMessage: error?.message || "Failed to upload or link file",
                }
              : queued,
          ),
        );
      }
    },
    [draftId, onUploadSuccess],
  );

  useEffect(() => {
    const nextPending = queue.find((item) => item.status === "pending");
    const hasRunning = queue.some(
      (item) => item.status === "uploading" || item.status === "linking",
    );
    if (!nextPending || hasRunning) return;
    processQueueItem(nextPending);
  }, [processQueueItem, queue]);

  const addFilesToQueue = useCallback((files: File[]) => {
    const accepted = files.filter(isAcceptedFile);
    if (accepted.length === 0) return;
    const nextItems = accepted.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      status: "pending" as QueueStatus,
    }));
    setQueue((prev) => [...prev, ...nextItems]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFilesToQueue(Array.from(e.dataTransfer.files));
      }
    },
    [addFilesToQueue],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const queueCounts = useMemo(
    () => ({
      running: queue.filter(
        (item) => item.status === "uploading" || item.status === "linking",
      ).length,
      success: queue.filter((item) => item.status === "success").length,
      failed: queue.filter((item) => item.status === "error").length,
    }),
    [queue],
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        className={`relative w-full border-2 border-dashed rounded-xl p-5 transition-all flex flex-col items-center justify-center min-h-[140px] text-center
        ${isDragging ? "border-primary bg-primary/5" : "border-border bg-card"}
      `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,image/*"
          onChange={handleFileSelect}
          disabled={!draftId}
        />

        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <UploadCloud className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium mb-1">Upload knowledge files</p>
        <p className="text-xs text-muted-foreground mb-1">
          Drag and drop files or select multiple files
        </p>
        <p className="text-[11px] text-muted-foreground/70 mb-3">
          PDF, Word, Excel, PowerPoint, képek, szöveges fájlok (.txt, .md)
        </p>
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Select Files
        </label>

        {!draftId && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10 transition-all">
            <p className="text-xs font-medium text-foreground bg-background px-3 py-1.5 rounded-full shadow-sm border border-border">
              Save draft first to attach files
            </p>
          </div>
        )}
      </div>

      {queue.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upload queue
            </p>
            <p className="text-xs text-muted-foreground">
              {queueCounts.running > 0
                ? `${queueCounts.running} processing`
                : `${queueCounts.success} done`}
              {queueCounts.failed > 0 ? ` · ${queueCounts.failed} failed` : ""}
            </p>
          </div>
          <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/80 bg-background/60 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "uploading" || item.status === "linking" ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {item.status === "uploading" ? "Uploading" : "Linking"}
                        </span>
                      </>
                    ) : null}
                    {item.status === "success" ? (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
                    ) : null}
                    {item.status === "error" ? (
                      <>
                        <AlertTriangle className="size-4 text-destructive" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="rounded-md"
                          onClick={() =>
                            setQueue((prev) =>
                              prev.map((queued) =>
                                queued.id === item.id
                                  ? {
                                      ...queued,
                                      status: "pending",
                                      errorMessage: undefined,
                                    }
                                  : queued,
                              ),
                            )
                          }
                          aria-label={`Retry upload for ${item.file.name}`}
                        >
                          <RotateCcw className="size-3.5" />
                        </Button>
                      </>
                    ) : null}
                    {item.status !== "uploading" && item.status !== "linking" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-md"
                        onClick={() =>
                          setQueue((prev) =>
                            prev.filter((queued) => queued.id !== item.id),
                          )
                        }
                        aria-label={`Remove ${item.file.name} from queue`}
                      >
                        <X className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </div>
                {item.errorMessage && (
                  <p className="mt-1 text-xs text-destructive">{item.errorMessage}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {linkedFiles && linkedFiles.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Csatolt Fájlok
          </p>
          <p className="text-xs text-muted-foreground">
            These files are available as context for AI suggestions.
          </p>
          <div className="flex flex-col gap-2">
            {linkedFiles.map((file) => (
              <div
                key={file.fileId}
                className="flex items-center justify-between bg-card border border-border rounded-lg p-2.5 shadow-sm group hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="shrink-0 w-4 h-4 text-primary opacity-80" />
                  <span
                    className="text-sm font-medium truncate"
                    title={file.filename}
                  >
                    {file.filename}
                  </span>
                </div>
                <button
                  onClick={() => handleUnlink(file.fileId)}
                  disabled={unlinkingId === file.fileId}
                  className="shrink-0 p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors opacity-60 group-hover:opacity-100 disabled:opacity-50"
                  title="Törlés"
                >
                  {unlinkingId === file.fileId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
          {unlinkError && <p className="text-xs text-destructive">{unlinkError}</p>}
        </div>
      )}
    </div>
  );
};
