"use client";

import { useEffect, useRef } from "react";
import { getAuthCookies, refreshTokenAction } from "@/actions/auth";
import { getAiWebSocketUrl } from "./aiWebSocket";

export type DraftRemoteSyncMessage = {
  v: number;
  type: "draftRemoteSync";
  draftId: number;
  originTabId: string | null;
  draft: {
    title: string;
    format: string;
    content: unknown;
    updatedAt: string;
  };
};

/**
 * WebSocket listener: when the same draft is saved elsewhere (another tab/device),
 * the server pushes the new title/content/updatedAt. Echo to the saving tab is
 * skipped client-side using originTabId from X-Editor-Tab-Id.
 */
export function useDraftRemoteSync(
  draftId: string | undefined,
  collabTabId: string,
  onRemoteSync: (msg: DraftRemoteSyncMessage) => void,
) {
  const onRemoteRef = useRef(onRemoteSync);
  onRemoteRef.current = onRemoteSync;

  useEffect(() => {
    if (!draftId || !collabTabId) return;

    let cancelled = false;
    let reconnectBusy = false;
    let ws: WebSocket | null = null;

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

      const socket = new WebSocket(getAiWebSocketUrl());
      ws = socket;

      socket.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as Record<string, unknown>;
          if (msg.v !== 1) return;
          if (msg.type === "authOk") {
            socket.send(
              JSON.stringify({
                v: 1,
                type: "subscribeDraft",
                id: Number(draftId),
              }),
            );
            return;
          }
          if (msg.type === "subscribeDraftOk") return;
          if (msg.type === "authError") {
            void handleAuthError(socket);
            return;
          }
          if (msg.type === "draftRemoteSync") {
            onRemoteRef.current(msg as unknown as DraftRemoteSyncMessage);
          }
        } catch (e) {
          console.error("[useDraftRemoteSync] message error", e);
        }
      };

      socket.onopen = () => {
        socket.send(JSON.stringify({ v: 1, type: "auth", token: accessToken }));
      };
    }

    void openSocket();

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [draftId, collabTabId]);
}
