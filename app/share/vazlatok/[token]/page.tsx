"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import SlateEditor from "../../../dashboard/vazlatok/SlateEditor";
import { normalizeDraftApiResponse } from "@/features/drafts/content";
import type { DraftEditorModel } from "@/features/drafts/types";
import {
  DraftAssetBlobFetcherContext,
} from "@/lib/draftAssetBlobFetcherContext";
import {
  createPublicDraftAssetBlobFetcher,
  fetchPublicDraft,
} from "@/lib/publicDraft";

export default function PublicSharedDraftPage() {
  const params = useParams<{ token: string }>();
  const tokenParam = params?.token;
  const token = typeof tokenParam === "string" ? tokenParam : tokenParam?.[0];

  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [model, setModel] = useState<DraftEditorModel | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const json = await fetchPublicDraft(token);
        if (cancelled) return;
        const normalized = normalizeDraftApiResponse(json);
        setModel(normalized);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const assetFetcher = useMemo(
    () => (token ? createPublicDraftAssetBlobFetcher(token) : null),
    [token],
  );

  if (!token || status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
        <p className="text-center text-muted-foreground">
          Ez a megosztott vázlat nem elérhető, vagy a link már nem érvényes.
        </p>
      </div>
    );
  }

  if (status === "loading" || !model || !assetFetcher) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Vázlat betöltése…</p>
      </div>
    );
  }

  return (
    <DraftAssetBlobFetcherContext.Provider value={assetFetcher}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[45%] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-500/10" />
        <div className="absolute top-[10%] right-[5%] h-[40%] w-[35%] rounded-full bg-emerald-400/8 blur-[100px] dark:bg-emerald-500/8" />
      </div>

      <header className="relative z-10 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-md">
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          {model.title || "Megosztott vázlat"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Csak megtekintés — a szerkesztéshez jelentkezz be a Tanársegéden.
        </p>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-2 pb-12 pt-4 md:px-4">
        <SlateEditor
          readOnly
          initialValue={model.content}
          isRailOpen={false}
          onRailOpenChange={() => {}}
          scrollClassName="pt-4"
        />
      </main>
    </DraftAssetBlobFetcherContext.Provider>
  );
}
