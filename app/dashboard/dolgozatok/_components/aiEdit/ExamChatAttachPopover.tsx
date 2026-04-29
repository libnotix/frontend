"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

export type ExamChatAttachPopoverProps = {
   examId: number | null;
   disabled?: boolean;
   /** Pick an exam-linked file — already uploaded & linked */
   onSelectLinkedFile: (fileId: number, filename: string) => void;
   /** User chose a draft — parent calls attach-draft API */
   onSelectDraft: (draftId: number, title: string) => void;
   onPickLocalFiles: (files: File[]) => void;
};

type ExamLinkRow = { fileId: number; filename: string };
type DraftRow = { id: number; title: string };

export function ExamChatAttachPopover({
   examId,
   disabled,
   onSelectLinkedFile,
   onSelectDraft,
   onPickLocalFiles,
}: ExamChatAttachPopoverProps) {
   const [open, setOpen] = useState(false);
   const [linkedFiles, setLinkedFiles] = useState<ExamLinkRow[]>([]);
   const [drafts, setDrafts] = useState<DraftRow[]>([]);
   const [loadingFiles, setLoadingFiles] = useState(false);
   const [loadingDrafts, setLoadingDrafts] = useState(false);
   const fileInputRef = useRef<HTMLInputElement | null>(null);

   const loadLists = useCallback(async () => {
      if (!examId) return;
      setLoadingFiles(true);
      setLoadingDrafts(true);
      try {
         const [examRes, draftRes] = await Promise.all([
            api.examLinkIdGetRaw({ id: examId }),
            api.draftsGetRaw(),
         ]);
         const examJson = (await examRes.raw.json()) as { files?: unknown };
         const rawFiles = examJson?.files;
         const nextLinked: ExamLinkRow[] = [];
         if (Array.isArray(rawFiles)) {
            for (const row of rawFiles) {
               if (
                  row &&
                  typeof row === "object" &&
                  "fileId" in row &&
                  typeof (row as { fileId?: unknown }).fileId === "number"
               ) {
                  const fileId = (row as { fileId: number }).fileId;
                  const fn =
                     typeof (row as { filename?: unknown }).filename === "string"
                        ? (row as { filename: string }).filename
                        : String(fileId);
                  nextLinked.push({ fileId, filename: fn });
               }
            }
         }
         setLinkedFiles(nextLinked);

         const draftJson = (await draftRes.raw.json()) as { drafts?: unknown };
         const rawDrafts =
            draftJson?.drafts && Array.isArray(draftJson.drafts)
               ? draftJson.drafts
               : Array.isArray(draftJson)
                 ? draftJson
                 : [];
         const nextDrafts: DraftRow[] = [];
         for (const d of rawDrafts as { id?: unknown; title?: unknown }[]) {
            if (d?.id === undefined || d?.id === null) continue;
            const idNum = typeof d.id === "number" ? d.id : Number(d.id);
            if (!Number.isFinite(idNum) || idNum < 1) continue;
            const title =
               typeof d.title === "string" && d.title.trim().length > 0
                  ? d.title
                  : `Vázlat #${idNum}`;
            nextDrafts.push({ id: idNum, title });
         }
         setDrafts(nextDrafts.sort((a, b) => a.title.localeCompare(b.title, "hu")));
      } catch {
         setLinkedFiles([]);
         setDrafts([]);
      } finally {
         setLoadingFiles(false);
         setLoadingDrafts(false);
      }
   }, [examId]);

   useEffect(() => {
      if (open && examId) void loadLists();
   }, [open, examId, loadLists]);

   const blocked = disabled || !examId;

   return (
      <>
         <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            disabled={blocked}
            onChange={(e) => {
               const fs = e.target.files;
               if (fs && fs.length > 0) {
                  onPickLocalFiles(Array.from(fs));
               }
               e.target.value = "";
               setOpen(false);
            }}
         />
         <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
               <Button
                  type="button"
                  variant="outline"
                  className="h-[52px] w-12 shrink-0 rounded-lg border-border/70 px-0"
                  disabled={blocked}
                  aria-label="Csatolás"
               >
                  <Paperclip className="size-5" aria-hidden />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
               <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Csatolt fájlok (dolgozat)
               </DropdownMenuLabel>
               {blocked ? (
                  <DropdownMenuItem disabled>Válassz mentett dolgozatot előbb.</DropdownMenuItem>
               ) : loadingFiles ? (
                  <DropdownMenuItem disabled>
                     <Loader2 className="size-4 animate-spin" aria-hidden /> Betöltés…
                  </DropdownMenuItem>
               ) : linkedFiles.length === 0 ? (
                  <DropdownMenuItem disabled className="text-xs">
                     Nincs még feltöltött fájl ehhez a dolgozathoz.
                  </DropdownMenuItem>
               ) : (
                  linkedFiles.map((f) => (
                     <DropdownMenuItem
                        key={f.fileId}
                        onSelect={(e) => {
                           e.preventDefault();
                           onSelectLinkedFile(f.fileId, f.filename);
                           setOpen(false);
                        }}
                     >
                        <span className="truncate">{f.filename}</span>
                     </DropdownMenuItem>
                  ))
               )}

               <DropdownMenuSeparator />

               <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Vázlatok
               </DropdownMenuLabel>
               {blocked ? (
                  <DropdownMenuItem disabled>—</DropdownMenuItem>
               ) : loadingDrafts ? (
                  <DropdownMenuItem disabled>Betöltés…</DropdownMenuItem>
               ) : drafts.length === 0 ? (
                  <DropdownMenuItem disabled className="text-xs">
                     Nincs vázlat a listában.
                  </DropdownMenuItem>
               ) : (
                  drafts.map((d) => (
                     <DropdownMenuItem
                        key={d.id}
                        onSelect={(e) => {
                           e.preventDefault();
                           onSelectDraft(d.id, d.title);
                           setOpen(false);
                        }}
                     >
                        <span className="truncate">{d.title}</span>
                     </DropdownMenuItem>
                  ))
               )}

               <DropdownMenuSeparator />
               <DropdownMenuItem
                  disabled={blocked}
                  onSelect={(e) => {
                     e.preventDefault();
                     fileInputRef.current?.click();
                  }}
               >
                  Új fájl feltöltése…
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </>
   );
}
