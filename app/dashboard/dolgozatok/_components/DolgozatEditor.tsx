"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { api } from "@/lib/api";
import type { ExamLeftViewMode } from "../[id]/ExamDynamicIsland";
import { usePendingExamEditsStore } from "./aiEdit/pendingExamEditsStore";
import { coerceExamTaskTypeId, ghostCreateClientId, yamlStringToLoadedQuestion } from "./aiEdit/yamlClient";
import { dedupeCanvasItemsById, newCanvasItemId } from "./dnd/canvasItemsState";
import { dolgozatMetaSchema, type DolgozatMetaFormValues } from "./form/dolgozatMetaSchema";
import { ExamSaveProvider, useExamSave } from "./examSaveContext";
import { pickExamTitleFromPayload } from "./savedExamsList";
import type { CanvasItem } from "./types";
import { applyExamAiOperation } from "./examEditor/examAiOperations";
import { DolgozatEditorWorkspaceView } from "./examEditor/DolgozatEditorWorkspaceView";
import {
  mapLoadedQuestionsToCanvasItems,
  parseExamIdFromResponse,
  pickExamUpdatedAtFromPayload,
  toExamQuestionPayload,
} from "./examEditor/examQuestionPayload";
import { useDebouncedCallback } from "./examEditor/useDebouncedCallback";
import { useExamCanvasDnd } from "./examEditor/useExamCanvasDnd";

const LIST_HREF = "/dashboard/dolgozatok";
const NEW_SEGMENT = "uj";

function useSyncedRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

function DolgozatEditorWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useSyncedRef(pathname);
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
  const [examId, setExamId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [leftViewMode, setLeftViewMode] = useState<ExamLeftViewMode>("editor");
  const [rightRailTab, setRightRailTab] = useState<"tasks" | "chat">("tasks");
  const [examUpdatedAt, setExamUpdatedAt] = useState<string | null>(null);

  const hasSeenTitleChangeRef = useRef(false);
  const isSavingRef = useRef(false);
  const needsSaveRef = useRef(false);
  const leftItemsRef = useSyncedRef(leftItems);
  const saveExamRef = useRef<(() => Promise<void>) | undefined>(undefined);

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

  const toQuestionPayload = useCallback(() => {
    return toExamQuestionPayload(leftItemsRef.current, getQuestionSnapshot);
  }, [getQuestionSnapshot, leftItemsRef]);

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
      if (!Number.isFinite(parsedId) || parsedId <= 0) return;

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

  const saveExam = useCallback(async () => {
    if (!isValidRoute) return;
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
      const nextTitle = metaForm.getValues("title")?.trim() || "Új dolgozat";
      let resolvedExamId = examId;

      if (!resolvedExamId) {
        const created = await api.examsPostRaw({ examsPostRequest: { title: nextTitle } });
        const createdId = await parseExamIdFromResponse(created.raw);
        if (!createdId) {
          throw new Error("A backend nem adott vissza dolgozat azonosítót.");
        }
        if (editorSessionActiveRef.current) {
          setExamId(createdId);
        }
        resolvedExamId = createdId;
      } else {
        await api.examsIdPutRaw({ id: resolvedExamId, examsIdPutRequest: { title: nextTitle } });
      }

      await api.examsIdQuestionsPutRaw({
        id: resolvedExamId,
        examsIdQuestionsPutRequest: { questions: toQuestionPayload() },
      });

      const stillHere = editorSessionActiveRef.current && pathnameRef.current === routeAtSaveStart;
      if (!stillHere) return;

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
      const stillOnSaveRoute = editorSessionActiveRef.current && pathnameRef.current === routeAtSaveStart;
      if (needsSaveRef.current) {
        needsSaveRef.current = false;
        if (stillOnSaveRoute) {
          void saveExamRef.current?.();
        }
      }
    }
  }, [examId, invalidQuestionIds.length, isValidRoute, metaForm, pathnameRef, router, toQuestionPayload]);

  useEffect(() => {
    saveExamRef.current = saveExam;
  }, [saveExam]);

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
    const ctx = {
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
          usePendingExamEditsStore.getState().byExam[examId]?.response.edits.questionEdits ?? [];
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

  const deleteExam = useCallback(async () => {
    if (!examId) return;
    const routeAtDeleteStart = pathnameRef.current;
    setIsSaving(true);
    setSaveStatusMessage("Dolgozat törlése...");
    try {
      await api.examsIdDeleteRaw({ id: examId });
      const stillHere = editorSessionActiveRef.current && pathnameRef.current === routeAtDeleteStart;
      if (!stillHere) return;
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
  }, [examId, metaForm, pathnameRef, router]);

  const dnd = useExamCanvasDnd({
    leftViewMode,
    setLeftViewMode,
    setLeftItems,
    debouncedSave,
  });

  const deleteQuestion = useCallback(
    (canvasItemId: string) => {
      setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((i) => i.id !== canvasItemId)));
      debouncedSave();
    },
    [debouncedSave],
  );

  const duplicateQuestion = useCallback(
    (item: CanvasItem) => {
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
    },
    [debouncedSave, getQuestionSnapshot],
  );

  const moveQuestionToTop = useCallback(
    (canvasItemId: string) => {
      setLeftItems((prev) => {
        const clean = dedupeCanvasItemsById(prev);
        const idx = clean.findIndex((i) => i.id === canvasItemId);
        if (idx <= 0) return clean;
        const next = [...clean];
        const [moved] = next.splice(idx, 1);
        next.unshift(moved);
        debouncedSave();
        return next;
      });
    },
    [debouncedSave],
  );

  const deleteGhostOperation = useCallback(
    (operationId: string) => {
      if (!examId) return;
      usePendingExamEditsStore.getState().removePendingOperation(examId, operationId);
    },
    [examId],
  );

  return (
    <DolgozatEditorWorkspaceView
      isValidRoute={isValidRoute}
      listHref={LIST_HREF}
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
      dnd={dnd}
      leftItems={leftItems}
      ghostItems={ghostItems}
      examId={examId}
      examUpdatedAt={examUpdatedAt}
      examClientQuestions={examClientQuestions}
      rightRailTab={rightRailTab}
      onRightRailTabChange={setRightRailTab}
      getQuestionSnapshot={getQuestionSnapshot}
      onQuestionChange={debouncedSave}
      onQuestionDelete={deleteQuestion}
      onQuestionDuplicate={duplicateQuestion}
      onQuestionMoveToTop={moveQuestionToTop}
      onGhostDelete={deleteGhostOperation}
    />
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
