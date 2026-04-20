"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Link2, Loader2, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteDraftShare, postDraftShare } from "@/lib/draftShareClient";

const buttonSpring = {
  type: "spring" as const,
  stiffness: 700,
  damping: 14,
  mass: 0.4,
};

function buildShareUrl(token: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/share/vazlatok/${token}`;
}

export const DraftShareMenu = memo(function DraftShareMenu({
  draftId,
  shareToken,
  onTokenChange,
}: {
  draftId: number;
  shareToken: string | null | undefined;
  onTokenChange: (token: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const activeToken =
    typeof shareToken === "string" && shareToken.length > 0 ? shareToken : null;

  const handleEnable = useCallback(async () => {
    setBusy(true);
    try {
      const res = await postDraftShare(draftId);
      if (res.code === 200 && res.shareToken) {
        onTokenChange(res.shareToken);
        toast.success("Megosztás bekapcsolva");
      } else {
        toast.error("Nem sikerült bekapcsolni a megosztást");
      }
    } catch {
      toast.error("Nem sikerült bekapcsolni a megosztást");
    } finally {
      setBusy(false);
    }
  }, [draftId, onTokenChange]);

  const handleDisable = useCallback(async () => {
    setBusy(true);
    try {
      const res = await deleteDraftShare(draftId);
      if (res.code === 200) {
        onTokenChange(null);
        toast.success("Megosztás kikapcsolva");
        setOpen(false);
      } else {
        toast.error("Nem sikerült kikapcsolni a megosztást");
      }
    } catch {
      toast.error("Nem sikerült kikapcsolni a megosztást");
    } finally {
      setBusy(false);
    }
  }, [draftId, onTokenChange]);

  const handleCopy = useCallback(async () => {
    if (!activeToken) return;
    const url = buildShareUrl(activeToken);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link a vágólapra másolva");
    } catch {
      toast.error("Nem sikerült másolni");
    }
  }, [activeToken]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          transition={buttonSpring}
          aria-label="Megosztás"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin text-white/80" />
          ) : (
            <Link2 className="size-3.5" />
          )}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[min(100vw-2rem,22rem)]">
        <DropdownMenuLabel>Megosztás</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!activeToken ? (
          <DropdownMenuItem
            disabled={busy}
            onSelect={(e) => {
              e.preventDefault();
              void handleEnable();
            }}
          >
            Megosztás bekapcsolása
          </DropdownMenuItem>
        ) : (
          <>
            <div className="flex flex-col gap-2 px-2 py-1.5">
              <p className="text-xs text-muted-foreground">
                Bárki megtekintheti ezt a linket bejelentkezés nélkül.
              </p>
              <Input
                readOnly
                value={buildShareUrl(activeToken)}
                className="font-mono text-xs"
                onFocus={(e) => e.target.select()}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => void handleCopy()}
                >
                  <Copy className="mr-1.5 size-3.5" />
                  Másolás
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onSelect={(e) => {
                e.preventDefault();
                void handleDisable();
              }}
            >
              <Trash2 className="size-4" />
              Megosztás kikapcsolása
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
