"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DragDropManager } from "@dnd-kit/dom";
import { Button } from "@/components/ui/button";
import { DashboardAmbientBackdrop } from "@/components/dashboard/DashboardAmbientBackdrop";
import { api } from "@/lib/api";
import type { ExamQuestionEdit, ExamQuestionInput } from "@/api";
import { useParams, usePathname, useRouter } from "next/navigation";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { LayoutList, MessageSquareText, Plus } from "lucide-react";
import ExamDynamicIsland, { type ExamLeftViewMode } from "../[id]/ExamDynamicIsland";
import { cn } from "@/lib/utils";
import { AVAILABLE_TASK_TYPES, CANVAS_SORTABLE_GROUP } from "./constants";
import { isExamTaskTypeId } from "./examTaskTypes";
import { CanvasDroppable } from "./CanvasDroppable";
import { dedupeCanvasItemsById, mergeCanvasOrder, newCanvasItemId } from "./dnd/canvasItemsState";
import { getOrderedCanvasItemIds } from "./dnd/getOrderedCanvasItemIds";
import { dolgozatMetaSchema, type DolgozatMetaFormValues } from "./form/dolgozatMetaSchema";
import { PaletteDraggable } from "./PaletteDraggable";
import { SortableQuestionItem } from "./SortableQuestionItem";
import type { CanvasItem } from "./types";
import { ExamSaveProvider, useExamSave } from "./examSaveContext";
import { pickExamTitleFromPayload } from "./savedExamsList";
import { ExamPreviewPanel } from "./ExamPreviewPanel";
import { ExamChatPanel } from "./aiEdit/ExamChatPanel";
import { useShallow } from "zustand/react/shallow";
import { usePendingExamEditsStore } from "./aiEdit/pendingExamEditsStore";
import { coerceExamTaskTypeId, ghostCreateClientId, yamlToFormDefaults, yamlStringToLoadedQuestion } from "./aiEdit/yamlClient";

function pickExamUpdatedAtFromPayload(payload: unknown): string | null {
   if (!payload || typeof payload !== "object") return null;
   const p = payload as Record<string, unknown>;
   const exam = p.exam;
   if (exam && typeof exam === "object" && typeof (exam as Record<string, unknown>).updatedAt === "string") {
      return (exam as Record<string, unknown>).updatedAt as string;
   }
   if (typeof p.updatedAt === "string") return p.updatedAt;
   return null;
}

function reorderExamCanvas(
   items: CanvasItem[],
   clientId: string,
   afterClientId: string | null,
): CanvasItem[] {
   const clean = dedupeCanvasItemsById(items);
   const from = clean.findIndex((i) => i.id === clientId);
   if (from < 0) return items;
   const next = [...clean];
   const [moved] = next.splice(from, 1);
   if (afterClientId == null || afterClientId === "") {
      next.unshift(moved);
      return next;
   }
   const anchor = next.findIndex((i) => i.id === afterClientId);
   if (anchor < 0) {
      next.push(moved);
      return next;
   }
   next.splice(anchor + 1, 0, moved);
   return dedupeCanvasItemsById(next);
}

type AcceptCtx = {
   examId: number;
   applyQuestionDefaults: (canvasItemId: string, formDefaults: Record<string, unknown>) => void;
   setLeftItems: Dispatch<SetStateAction<CanvasItem[]>>;
   debouncedSave: () => void;
};

function applyExamAiOperation(op: ExamQuestionEdit, ctx: AcceptCtx) {
   const st = usePendingExamEditsStore.getState();

   const typeArg = typeof op.type === "string" ? op.type : String(op.type ?? "");

   if (op.op === "update") {
      const tid = coerceExamTaskTypeId(typeArg);
      if (!tid || !op.clientId || !op.yaml?.trim()) return;
      const parsed = yamlToFormDefaults(tid, op.yaml);
      if (!parsed.ok) return;
      ctx.applyQuestionDefaults(op.clientId, parsed.values);
      st.removePendingOperation(ctx.examId, op.operationId);
      ctx.debouncedSave();
      return;
   }

   if (op.op === "create") {
      const tid = coerceExamTaskTypeId(typeArg);
      if (!tid) return;
      const loaded = yamlStringToLoadedQuestion(tid, op.yaml);
      ctx.setLeftItems((prev) => {
         const clean = dedupeCanvasItemsById(prev);
         const newItem: CanvasItem = {
            id: newCanvasItemId(tid),
            typeId: tid,
            loadedQuestion: loaded ?? undefined,
         };
         const after = op.afterClientId;
         if (!after) return [newItem, ...clean];
         const ix = clean.findIndex((i) => i.id === after);
         if (ix < 0) return [...clean, newItem];
         const nx = [...clean];
         nx.splice(ix + 1, 0, newItem);
         return nx;
      });
      st.removePendingOperation(ctx.examId, op.operationId);
      ctx.debouncedSave();
      return;
   }

   if (op.op === "delete") {
      if (!op.clientId) return;
      ctx.setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((i) => i.id !== op.clientId)));
      st.removePendingOperation(ctx.examId, op.operationId);
      ctx.debouncedSave();
      return;
   }

   if (op.op === "reorder") {
      if (!op.clientId) return;
      ctx.setLeftItems((prev) => reorderExamCanvas(prev, op.clientId!, op.afterClientId ?? null));
      st.removePendingOperation(ctx.examId, op.operationId);
      ctx.debouncedSave();
   }
}

const LIST_HREF = "/dashboard/dolgozatok";
const NEW_SEGMENT = "uj";

function buildQuestionContent(item: CanvasItem, index: number): Pick<ExamQuestionInput, "spec" | "correctAnswer"> {
  const baseId = index + 1;

  switch (item.typeId) {
    case "radio":
      return {
        spec: {
          options: [
            { id: `q${baseId}_a`, label: "A" },
            { id: `q${baseId}_b`, label: "B" },
          ],
        },
        correctAnswer: { optionId: `q${baseId}_a` },
      };
    case "checkbox":
      return {
        spec: {
          options: [
            { id: `q${baseId}_a`, label: "A" },
            { id: `q${baseId}_b`, label: "B" },
          ],
        },
        correctAnswer: { optionIds: [`q${baseId}_a`] },
      };
    case "true_false":
      return { spec: {}, correctAnswer: { value: true } };
    case "matching":
      return {
        spec: {
          premises: [{ id: `q${baseId}_p1`, label: "1. Kifejezes" }],
          responses: [{ id: `q${baseId}_r1`, label: "A. Magyarazat" }],
        },
        correctAnswer: { pairs: [{ premiseId: `q${baseId}_p1`, responseIds: [`q${baseId}_r1`] }] },
      };
    case "ordering":
      return {
        spec: {
          items: [{ id: `q${baseId}_i1`, label: "Elso elem" }],
        },
        correctAnswer: { orderedIds: [`q${baseId}_i1`] },
      };
    case "grouping":
      return {
        spec: {
          groups: [{ id: `q${baseId}_g1`, label: "A csoport" }],
          items: [{ id: `q${baseId}_i1`, label: "Elem" }],
        },
        correctAnswer: { assignments: [{ itemId: `q${baseId}_i1`, groupId: `q${baseId}_g1` }] },
      };
    case "fill_in_the_blank":
      return {
        spec: {
          segments: [
            { kind: "text", text: "Minta szoveg " },
            { kind: "blank", id: `q${baseId}_b1`, acceptedAnswers: ["minta"] },
            { kind: "text", text: " folytatas." },
          ],
        },
        correctAnswer: null,
      };
    case "short_answer":
      return { spec: { answerLineCount: 5 }, correctAnswer: null };
    case "long_answer":
      return { spec: { answerLineCount: 18 }, correctAnswer: null };
  }
}

async function parseExamIdFromResponse(response: Response): Promise<number | null> {
  try {
    const payload = await response.clone().json();
    if (typeof payload?.id === "number") return payload.id;
    if (typeof payload?.exam?.id === "number") return payload.exam.id;
  } catch {
    // No JSON body or no id in payload.
  }
  return null;
}

function mapLoadedQuestionsToCanvasItems(questions: unknown): CanvasItem[] {
  if (!Array.isArray(questions)) return [];
  return (questions as unknown[])
    .filter((raw): raw is Record<string, unknown> => {
      const t = (raw as Record<string, unknown>)?.type;
      return typeof t === "string" && isExamTaskTypeId(t);
    })
    .sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : 0;
      const bo = typeof b.order === "number" ? b.order : 0;
      return ao - bo;
    })
    .map((q) => {
      const typeId = q.type as CanvasItem["typeId"];
      return {
        id: newCanvasItemId(typeId),
        typeId,
        questionId: typeof q.id === "number" ? q.id : undefined,
        loadedQuestion: q,
      };
    });
}

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

function DolgozatEditorWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const editorSessionActiveRef = useRef(true);
  useEffect(() => {
    editorSessionActiveRef.current = true;
    return () => {
      editorSessionActiveRef.current = false;
    };
  }, []);

  const params = useParams<{ id: string }>();
  const idParam = typeof params?.id === "string" ? params.id : "";
  const isNewRoute = idParam === NEW_SEGMENT;
  const isValidRoute = isNewRoute || /^\d+$/.test(idParam);

  const metaForm = useFormContext<DolgozatMetaFormValues>();
  const title = useWatch({ control: metaForm.control, name: "title" }) ?? "";
  const { getQuestionSnapshot, invalidQuestionIds, applyQuestionDefaults } = useExamSave();

  const [leftItems, setLeftItems] = useState<CanvasItem[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [examId, setExamId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const hasSeenTitleChangeRef = useRef(false);
  // Save-coalescing: synchronous busy flag avoids parallel PUTs from React state lag,
  // and `needsSaveRef` makes sure changes that arrive during an in-flight save aren't dropped.
  const isSavingRef = useRef(false);
  const needsSaveRef = useRef(false);
  const leftItemsRef = useRef<CanvasItem[]>([]);
  leftItemsRef.current = leftItems;
  const [leftViewMode, setLeftViewMode] = useState<ExamLeftViewMode>("editor");
  const [rightRailTab, setRightRailTab] = useState<"tasks" | "chat">("tasks");
  const [examUpdatedAt, setExamUpdatedAt] = useState<string | null>(null);

  const creationOps = usePendingExamEditsStore(useShallow((s) => s.getCreations(examId)));

  const ghostItems: CanvasItem[] = useMemo(() => {
      return creationOps.flatMap((op) => {
         const tid = coerceExamTaskTypeId(typeof op.type === "string" ? op.type : `${op.type}`);
         if (!tid || !op.operationId) return [];
         const loaded = yamlStringToLoadedQuestion(tid, op.yaml);
         return [
            {
               id: ghostCreateClientId(op.operationId),
               typeId: tid,
               loadedQuestion: loaded ?? undefined,
               ghostOperationId: op.operationId,
            },
         ];
      });
  }, [creationOps]);

  const examClientQuestions = useMemo(
    () =>
      leftItems.map((i) => ({
        clientId: i.id,
        serverId: typeof i.questionId === "number" ? i.questionId : null,
        questionId: i.questionId,
      })),
    [leftItems],
  );

  // Read via the ref so an already-in-flight save still picks up canvas additions/removals
  // (e.g. an AI-accepted create/delete) instead of POSTing the leftItems snapshot it captured.
  const toQuestionPayload = useCallback((): ExamQuestionInput[] => {
    return leftItemsRef.current.map((item, index) => {
      const fromForm = getQuestionSnapshot(item.id);
      if (fromForm) {
        return {
          id: item.questionId,
          type: item.typeId,
          order: index + 1,
          title: fromForm.title?.trim() ? fromForm.title.trim() : `Kérdés ${index + 1}`,
          description: fromForm.description ?? "",
          spec: fromForm.spec,
          correctAnswer: fromForm.correctAnswer,
          rubric: fromForm.rubric ?? "",
          maxPoints: fromForm.maxPoints,
        };
      }
      return {
        ...buildQuestionContent(item, index),
        id: item.questionId,
        type: item.typeId,
        order: index + 1,
        title: `Kérdés ${index + 1}`,
        description: "",
        rubric: "",
        maxPoints: 5,
      };
    });
  }, [getQuestionSnapshot]);

  useEffect(() => {
    if (!isValidRoute) return;

    let isMounted = true;

    const run = async () => {
      if (isNewRoute) {
        setExamId(null);
        setExamUpdatedAt(null);
        setLeftItems([]);
        metaForm.reset({ title: "" });
        if (isMounted) setSaveStatusMessage(null);
        return;
      }

      const parsedId = Number(idParam);
      if (!Number.isFinite(parsedId) || parsedId <= 0) {
        return;
      }

      try {
        if (isMounted) setSaveStatusMessage("Dolgozat betoltese...");
        const response = await api.examsIdGetRaw({ id: parsedId });
        const payload = await response.raw.clone().json();
        if (!isMounted) return;

        setExamId(parsedId);
        setExamUpdatedAt(pickExamUpdatedAtFromPayload(payload));
        const loadedTitle = pickExamTitleFromPayload(payload) ?? `Dolgozat #${parsedId}`;
        metaForm.setValue("title", loadedTitle, { shouldDirty: false, shouldValidate: true });
        setLeftItems(mapLoadedQuestionsToCanvasItems(payload?.questions));
        setSaveStatusMessage(`Betöltve: ${loadedTitle}`);
      } catch (error) {
        console.error("Exam load failed:", error);
        if (isMounted) setSaveStatusMessage("A dolgozat betoltese nem sikerult.");
      }
    };

    void run();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-load only when the route id segment changes
  }, [idParam, isNewRoute, isValidRoute]);

  const saveExamRef = useRef<() => Promise<void>>();

  const saveExam = useCallback(async () => {
    if (!isValidRoute) return;
    // If a save is already running, mark that another one is needed and bail. The in-flight
    // save's `finally` block will re-trigger right after it completes so accepted/typed
    // changes from this window are never silently dropped.
    if (isSavingRef.current) {
      needsSaveRef.current = true;
      return;
    }

    const isMetaValid = await metaForm.trigger();
    if (!isMetaValid) {
      setSaveStatusMessage("Adj címet a dolgozatnak a mentéshez.");
      setIsSaveError(true);
      return;
    }
    if (invalidQuestionIds.length > 0) {
      setSaveStatusMessage(`${invalidQuestionIds.length} kérdés javításra vár.`);
      setIsSaveError(true);
      return;
    }

    isSavingRef.current = true;
    needsSaveRef.current = false;
    const routeAtSaveStart = pathnameRef.current;
    setIsSaving(true);
    setIsSaveError(false);
    setSaveStatusMessage("Mentés folyamatban...");

    try {
      const title = metaForm.getValues("title")?.trim() || "Új dolgozat";
      let resolvedExamId = examId;

      if (!resolvedExamId) {
        const created = await api.examsPostRaw({ examsPostRequest: { title } });
        const createdId = await parseExamIdFromResponse(created.raw);
        if (!createdId) {
          throw new Error("A backend nem adott vissza dolgozat azonosítót.");
        }
        if (editorSessionActiveRef.current) {
          setExamId(createdId);
        }
        resolvedExamId = createdId;
      } else {
        await api.examsIdPutRaw({ id: resolvedExamId, examsIdPutRequest: { title } });
      }

      await api.examsIdQuestionsPutRaw({
        id: resolvedExamId,
        examsIdQuestionsPutRequest: { questions: toQuestionPayload() },
      });

      const stillHere =
        editorSessionActiveRef.current && pathnameRef.current === routeAtSaveStart;
      if (!stillHere) {
        return;
      }

      const savedAt = new Date();
      setLastSaved(savedAt);
      setExamUpdatedAt(savedAt.toISOString());
      setSaveStatusMessage(`Mentve ${savedAt.toLocaleTimeString("hu-HU")} - azonosító: ${resolvedExamId}`);
      router.replace(`${LIST_HREF}/${resolvedExamId}`);
    } catch (error) {
      console.error("Exam save failed:", error);
      if (editorSessionActiveRef.current && pathnameRef.current === routeAtSaveStart) {
        setIsSaveError(true);
        setSaveStatusMessage("A mentés nem sikerült. Próbáld újra.");
      }
    } finally {
      isSavingRef.current = false;
      if (editorSessionActiveRef.current) {
        setIsSaving(false);
      }
      const stillOnSaveRoute =
        editorSessionActiveRef.current && pathnameRef.current === routeAtSaveStart;
      if (needsSaveRef.current) {
        needsSaveRef.current = false;
        if (stillOnSaveRoute) {
          void saveExamRef.current?.();
        }
      }
    }
  }, [examId, invalidQuestionIds.length, isValidRoute, metaForm, router, toQuestionPayload]);

  saveExamRef.current = saveExam;

  const debouncedSave = useDebouncedCallback(() => {
    void saveExam();
  }, 1000);

  const debouncedTitleSave = useDebouncedCallback(() => {
    void saveExam();
  }, 700);

  useEffect(() => {
    if (!hasSeenTitleChangeRef.current) {
      hasSeenTitleChangeRef.current = true;
      return;
    }
    debouncedTitleSave();
  }, [debouncedTitleSave, title]);

  useEffect(() => {
    if (!examId) return;
    const ctx: AcceptCtx = {
      examId,
      applyQuestionDefaults,
      setLeftItems,
      debouncedSave,
    };
    usePendingExamEditsStore.getState().registerExamOpHandlers(examId, {
      acceptOperation: (op) => applyExamAiOperation(op, ctx),
      rejectOperation: (operationId) => {
        usePendingExamEditsStore.getState().removePendingOperation(examId, operationId);
      },
      acceptAll: () => {
        const queued =
           usePendingExamEditsStore.getState().byExam[examId]?.response.edits.questionEdits ??
           [];
        for (const op of [...queued]) {
           applyExamAiOperation(op, ctx);
        }
      },
      rejectAll: () => {
        usePendingExamEditsStore.getState().clearChangeSet(examId);
      },
    });
    return () => {
      usePendingExamEditsStore.getState().registerExamOpHandlers(examId, null);
    };
  }, [applyQuestionDefaults, debouncedSave, examId]);

  const handleTitleChange = useCallback(
    (nextTitle: string) => {
      metaForm.setValue("title", nextTitle, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [metaForm],
  );

  const deleteExam = async () => {
    if (!examId) return;
    const routeAtDeleteStart = pathnameRef.current;
    setIsSaving(true);
    setSaveStatusMessage("Dolgozat törlése...");
    try {
      await api.examsIdDeleteRaw({ id: examId });
      const stillHere =
        editorSessionActiveRef.current && pathnameRef.current === routeAtDeleteStart;
      if (!stillHere) {
        return;
      }
      setExamId(null);
      setLeftItems([]);
      metaForm.reset({ title: "" });
      setSaveStatusMessage("Dolgozat törölve.");
      router.push(LIST_HREF);
    } catch (error) {
      console.error("Exam delete failed:", error);
      if (editorSessionActiveRef.current && pathnameRef.current === routeAtDeleteStart) {
        setSaveStatusMessage("A törlés nem sikerült.");
      }
    } finally {
      if (editorSessionActiveRef.current) {
        setIsSaving(false);
      }
    }
  };

  if (!isValidRoute) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Érvénytelen dolgozat-cím. Ellenőrizd a hivatkozást.</p>
        <Button type="button" asChild>
          <Link href={LIST_HREF}>Vissza a dolgozatokhoz</Link>
        </Button>
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragStart={(e) => {
        const sid = e.operation.source?.id != null ? String(e.operation.source.id) : "";
        if (sid.startsWith("palette-") && leftViewMode === "preview") {
          setLeftViewMode("editor");
        }
        setActiveDragId(sid || null);
      }}
      onDragOver={(e) => setHoveredTargetId(e.operation.target?.id != null ? String(e.operation.target.id) : null)}
      onDragEnd={(event, manager: DragDropManager) => {
        setActiveDragId(null);
        setHoveredTargetId(null);

        if (event.canceled) return;

        const sourceId = event.operation.source?.id != null ? String(event.operation.source.id) : "";
        const targetId = event.operation.target?.id != null ? String(event.operation.target.id) : "";
        if (!sourceId || !targetId) return;

        const isTargetCanvasItem = targetId !== "droppable-1" && targetId !== "droppable-2" && !targetId.startsWith("palette-");
        const isTargetPaletteItem = targetId === "droppable-2" || targetId.startsWith("palette-");

        if (sourceId.startsWith("palette-") && (targetId === "droppable-1" || isTargetCanvasItem)) {
          const typeId = sourceId.replace("palette-", "");
          if (!isExamTaskTypeId(typeId)) return;
          const newItem: CanvasItem = { id: newCanvasItemId(typeId), typeId };

          setLeftItems((prev) => {
            const clean = dedupeCanvasItemsById(prev);
            if (isTargetCanvasItem) {
              const targetIndex = clean.findIndex((i) => i.id === targetId);
              if (targetIndex !== -1) {
                const newItems = [...clean];
                newItems.splice(targetIndex, 0, newItem);
                debouncedSave();
                return newItems;
              }
            }
            debouncedSave();
            return [...clean, newItem];
          });
          return;
        }

        if (!sourceId.startsWith("palette-") && isTargetPaletteItem) {
          setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((item) => item.id !== sourceId)));
          debouncedSave();
          return;
        }

        if (isSortableOperation(event.operation)) {
          setLeftItems((prev) => {
            const orderedIds = getOrderedCanvasItemIds(manager, CANVAS_SORTABLE_GROUP);
            const next = mergeCanvasOrder(prev, orderedIds);
            debouncedSave();
            return next;
          });
          return;
        }

        if (!sourceId.startsWith("palette-") && targetId === "droppable-1") {
          setLeftItems((prev) => {
            const clean = dedupeCanvasItemsById(prev);
            const oldIndex = clean.findIndex((i) => i.id === sourceId);
            if (oldIndex < 0) return clean;
            const newItems = [...clean];
            const [moved] = newItems.splice(oldIndex, 1);
            newItems.push(moved);
            debouncedSave();
            return newItems;
          });
        }
      }}
    >
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden print:h-auto print:overflow-visible">
        <DashboardAmbientBackdrop className="print:hidden" />
        <ExamDynamicIsland
          title={title}
          onTitleChange={handleTitleChange}
          leftViewMode={leftViewMode}
          onLeftViewModeChange={setLeftViewMode}
          titleError={metaForm.formState.errors.title?.message}
          invalidQuestionCount={invalidQuestionIds.length}
          isSaving={isSaving}
          isSaveError={isSaveError}
          lastSaved={lastSaved}
          saveStatusMessage={saveStatusMessage}
          canSave={metaForm.formState.isValid && invalidQuestionIds.length === 0}
          onSave={() => void saveExam()}
          onDelete={examId ? () => void deleteExam() : undefined}
        />
        <div className="relative z-10 flex min-h-0 w-full flex-col md:flex-row print:min-h-0">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden print:overflow-visible">
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-24 md:px-8 print:overflow-visible print:p-0",
                leftViewMode === "preview" && "bg-zinc-800 print:bg-transparent",
              )}
            >
              <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col print:max-w-none">
                <div className="mb-4 min-h-5 print:hidden" aria-live="polite">
                  {saveStatusMessage ? (
                    <p className={`text-xs ${isSaveError ? "text-destructive" : "text-muted-foreground"}`}>
                      {saveStatusMessage}
                    </p>
                  ) : null}
                </div>

                {/* Student-facing sheet for screen preview and for printing (always in DOM so Cmd/Ctrl+P works from szerkesztő too). */}
                <div data-exam-print-sheet className={cn(leftViewMode === "preview" ? "block" : "hidden print:block")}>
                  <ExamPreviewPanel
                    examTitle={title}
                    items={leftItems}
                    getSnapshot={(id) => getQuestionSnapshot(id)}
                    a4PaperPreview={leftViewMode === "preview"}
                  />
                </div>

                <div
                  className={cn(
                    "relative flex-1 rounded-md",
                    leftViewMode === "preview" ? "hidden" : "print:hidden",
                  )}
                  aria-hidden={leftViewMode === "preview"}
                >
                    {leftItems.length === 0 && ghostItems.length === 0 && (
                      <CanvasDroppable id="droppable-1">
                        <div className="absolute inset-0 z-0 flex items-center justify-center p-4 text-base text-muted-foreground">
                          Húzd ide a feladatot...
                        </div>
                      </CanvasDroppable>
                    )}

                    <div className="relative z-10 flex w-full flex-col space-y-4">
                      {leftItems.map((item, index) => (
                        <SortableQuestionItem
                          key={item.id}
                          id={item.id}
                          typeId={item.typeId}
                          loadedQuestion={item.loadedQuestion}
                          index={index}
                          paletteInsertIndicator={
                            activeDragId?.startsWith("palette-") && hoveredTargetId === item.id ? (
                              <div className="absolute -top-2 translate-y-[-50%] left-0 right-0 h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none z-10" />
                            ) : null
                          }
                          onQuestionChange={debouncedSave}
                          examId={examId ?? undefined}
                          onDelete={() => {
                            setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((i) => i.id !== item.id)));
                            debouncedSave();
                          }}
                          onDuplicate={() => {
                            const snapshot = getQuestionSnapshot(item.id);
                            setLeftItems((prev) => {
                              const clean = dedupeCanvasItemsById(prev);
                              const idx = clean.findIndex((i) => i.id === item.id);
                              if (idx < 0) return clean;
                              const newItem: CanvasItem = {
                                id: newCanvasItemId(item.typeId),
                                typeId: item.typeId,
                                loadedQuestion: snapshot ? { type: item.typeId, ...snapshot } : undefined,
                              };
                              const next = [...clean];
                              next.splice(idx + 1, 0, newItem);
                              debouncedSave();
                              return next;
                            });
                          }}
                          onMoveToTop={() => {
                            setLeftItems((prev) => {
                              const clean = dedupeCanvasItemsById(prev);
                              const idx = clean.findIndex((i) => i.id === item.id);
                              if (idx <= 0) return clean;
                              const next = [...clean];
                              const [moved] = next.splice(idx, 1);
                              next.unshift(moved);
                              debouncedSave();
                              return next;
                            });
                          }}
                          canMoveToTop={index > 0}
                        />
                      ))}

                      {ghostItems.map((item, gi) => (
                        <SortableQuestionItem
                          key={item.id}
                          id={item.id}
                          typeId={item.typeId}
                          loadedQuestion={item.loadedQuestion}
                          index={leftItems.length + gi}
                          examId={examId ?? undefined}
                          ghostOperationId={item.ghostOperationId}
                          onQuestionChange={() => {}}
                          onDelete={
                             examId && item.ghostOperationId
                                ? () => {
                                     usePendingExamEditsStore
                                        .getState()
                                        .removePendingOperation(examId, item.ghostOperationId!);
                                  }
                                : undefined
                          }
                          canMoveToTop={false}
                        />
                      ))}

                      {(leftItems.length > 0 || ghostItems.length > 0) && (
                        <CanvasDroppable id="droppable-1">
                          <div className="relative mt-8 flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-6 transition-colors hover:bg-muted/30">
                            {activeDragId?.startsWith("palette-") && hoveredTargetId === "droppable-1" && (
                              <div className="absolute -top-1 left-0 right-0 h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none transition-all" />
                            )}
                            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                              <Plus className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-semibold">Új kérdés hozzáadása</h3>
                            <p className="mt-1 text-sm leading-snug text-muted-foreground">Húzz be egy újabb kérdést a hozzáadáshoz</p>
                          </div>
                        </CanvasDroppable>
                      )}
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-border/60 bg-background/50 pt-24 backdrop-blur md:h-full md:w-[400px] md:border-l md:border-t-0 print:hidden">
            <div className="flex shrink-0 gap-0.5 border-b border-border/50 px-3 pt-2">
              <button
                type="button"
                onClick={() => setRightRailTab("tasks")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-t-lg border-b-2 px-2 py-2.5 text-[12px] font-semibold transition-colors",
                  rightRailTab === "tasks"
                    ? "border-primary bg-card/90 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                )}
              >
                <LayoutList className="size-3.5 opacity-80" aria-hidden />
                Feladattípusok
              </button>
              <button
                type="button"
                onClick={() => setRightRailTab("chat")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-t-lg border-b-2 px-2 py-2.5 text-[12px] font-semibold transition-colors",
                  rightRailTab === "chat"
                    ? "border-primary bg-card/90 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                )}
              >
                <MessageSquareText className="size-3.5 opacity-80" aria-hidden />
                Chat
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {rightRailTab === "tasks" ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-5">
                  <p className="mb-3 shrink-0 text-xs leading-snug text-muted-foreground">Húzd balra a feladat hozzáadásához</p>
                  <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <CanvasDroppable id="droppable-2" fillParent={false}>
                      {AVAILABLE_TASK_TYPES.map((item) => (
                        <PaletteDraggable key={`palette-${item.id}`} id={`palette-${item.id}`} typeId={item.id} />
                      ))}
                    </CanvasDroppable>
                  </div>
                </div>
              ) : (
                <ExamChatPanel
                  examId={examId}
                  examUpdatedAt={examUpdatedAt}
                  clientQuestions={examClientQuestions}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DragDropProvider>
  );
}

function DolgozatEditorInner() {
  const metaForm = useForm<DolgozatMetaFormValues>({
    resolver: zodResolver(dolgozatMetaSchema),
    defaultValues: { title: "" },
    mode: "all",
  });

  return (
    <FormProvider {...metaForm}>
      <ExamSaveProvider>
        <DolgozatEditorWorkspace />
      </ExamSaveProvider>
    </FormProvider>
  );
}

export const DolgozatEditor = memo(DolgozatEditorInner);
