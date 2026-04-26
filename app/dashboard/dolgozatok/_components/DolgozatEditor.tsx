"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DragDropManager } from "@dnd-kit/dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ExamQuestionInput } from "@/api";
import { useParams, useRouter } from "next/navigation";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { ArrowLeft, Plus } from "lucide-react";
import { AVAILABLE_TASK_TYPES, CANVAS_SORTABLE_GROUP } from "./constants";
import { isExamTaskTypeId } from "./examTaskTypes";
import { CanvasDroppable } from "./CanvasDroppable";
import { dedupeCanvasItemsById, mergeCanvasOrder, newCanvasItemId } from "./dnd/canvasItemsState";
import { getOrderedCanvasItemIds } from "./dnd/getOrderedCanvasItemIds";
import { DolgozatMetaFields } from "./form/DolgozatMetaFields";
import { dolgozatMetaSchema, type DolgozatMetaFormValues } from "./form/dolgozatMetaSchema";
import { PaletteDraggable } from "./PaletteDraggable";
import { SortableQuestionItem } from "./SortableQuestionItem";
import type { CanvasItem } from "./types";
import { ExamSaveProvider, useExamSave } from "./examSaveContext";
import { pickExamTitleFromPayload } from "./savedExamsList";

const LIST_HREF = "/dashboard/dolgozatok";
const NEW_SEGMENT = "uj";

function DolgozatEditorWorkspace() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idParam = typeof params?.id === "string" ? params.id : "";
  const isNewRoute = idParam === NEW_SEGMENT;
  const isValidRoute = isNewRoute || /^\d+$/.test(idParam);

  const metaForm = useFormContext<DolgozatMetaFormValues>();
  const { getQuestionSnapshot } = useExamSave();

  const [leftItems, setLeftItems] = useState<CanvasItem[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [examId, setExamId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  const buildQuestionContent = (item: CanvasItem, index: number): Pick<ExamQuestionInput, "spec" | "correctAnswer"> => {
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
            ],
          },
          correctAnswer: null,
        };
      case "short_answer":
      case "long_answer":
        return { spec: {}, correctAnswer: null };
    }
  };

  const toQuestionPayload = (): ExamQuestionInput[] => {
    return leftItems.map((item, index) => {
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
  };

  const parseExamIdFromResponse = async (response: Response): Promise<number | null> => {
    try {
      const payload = await response.clone().json();
      if (typeof payload?.id === "number") return payload.id;
      if (typeof payload?.exam?.id === "number") return payload.exam.id;
    } catch {
      // No JSON body or no id in payload.
    }
    return null;
  };

  const mapLoadedQuestionsToCanvasItems = (questions: unknown): CanvasItem[] => {
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
  };

  useEffect(() => {
    if (!isValidRoute) return;

    let isMounted = true;

    const run = async () => {
      if (isNewRoute) {
        setExamId(null);
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
        const loadedTitle = pickExamTitleFromPayload(payload) ?? `Dolgozat #${parsedId}`;
        metaForm.setValue("title", loadedTitle, { shouldDirty: false });
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

  const saveExam = async () => {
    const isMetaValid = await metaForm.trigger();
    if (!isMetaValid) return;

    setIsSaving(true);
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
        setExamId(createdId);
        resolvedExamId = createdId;
      } else {
        await api.examsIdPutRaw({ id: resolvedExamId, examsIdPutRequest: { title } });
      }

      await api.examsIdQuestionsPutRaw({
        id: resolvedExamId,
        examsIdQuestionsPutRequest: { questions: toQuestionPayload() },
      });

      setSaveStatusMessage(`Mentve ${new Date().toLocaleTimeString("hu-HU")} - azonosító: ${resolvedExamId}`);
      router.replace(`${LIST_HREF}/${resolvedExamId}`);
    } catch (error) {
      console.error("Exam save failed:", error);
      setSaveStatusMessage("A mentés nem sikerült. Próbáld újra.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExam = async () => {
    if (!examId) return;
    setIsSaving(true);
    setSaveStatusMessage("Dolgozat törlése...");
    try {
      await api.examsIdDeleteRaw({ id: examId });
      setExamId(null);
      setLeftItems([]);
      metaForm.reset({ title: "" });
      setSaveStatusMessage("Dolgozat törölve.");
      router.push(LIST_HREF);
    } catch (error) {
      console.error("Exam delete failed:", error);
      setSaveStatusMessage("A törlés nem sikerült.");
    } finally {
      setIsSaving(false);
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
      onDragStart={(e) => setActiveDragId(e.operation.source?.id != null ? String(e.operation.source.id) : null)}
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
                return newItems;
              }
            }
            return [...clean, newItem];
          });
          return;
        }

        if (!sourceId.startsWith("palette-") && isTargetPaletteItem) {
          setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((item) => item.id !== sourceId)));
          return;
        }

        if (isSortableOperation(event.operation)) {
          setLeftItems((prev) => {
            const orderedIds = getOrderedCanvasItemIds(manager, CANVAS_SORTABLE_GROUP);
            return mergeCanvasOrder(prev, orderedIds);
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
            return newItems;
          });
        }
      }}
    >
      <div className="h-[calc(100vh-4rem)] w-full p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden">
        <Card className="flex-1 w-full border-2 flex flex-col min-h-0">
          <CardContent className="relative flex-1 p-4 pt-14 md:p-8 md:pt-16 flex flex-col overflow-y-auto">
            <div className="absolute left-4 top-4 z-20 md:left-8 md:top-5">
              <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2 text-muted-foreground">
                <Link href={LIST_HREF}>
                  <ArrowLeft className="size-4" />
                  Dolgozatok
                </Link>
              </Button>
            </div>

            <DolgozatMetaFields
              onSave={() => void saveExam()}
              onDelete={examId ? () => void deleteExam() : undefined}
              isSaving={isSaving}
              saveStatusMessage={saveStatusMessage}
            />

            <div className="border-2 border-none flex-1 relative rounded-md">
              {leftItems.length === 0 && (
                <CanvasDroppable id="droppable-1">
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-muted-foreground text-lg z-0">
                    Húzd ide a feladatot...
                  </div>
                </CanvasDroppable>
              )}

              <div className="space-y-4 w-full z-10 relative flex flex-col">
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
                    onDelete={() => setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((i) => i.id !== item.id)))}
                  />
                ))}

                {leftItems.length > 0 && (
                  <CanvasDroppable id="droppable-1">
                    <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-card hover:bg-muted/30 transition-colors cursor-pointer mt-8 w-full min-h-[150px]">
                      {activeDragId?.startsWith("palette-") && hoveredTargetId === "droppable-1" && (
                        <div className="absolute -top-1 left-0 right-0 h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none transition-all" />
                      )}
                      <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                        <Plus className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold">Új kérdés hozzáadása</h3>
                      <p className="text-sm text-muted-foreground mt-1">Húzz be egy újabb kérdést a hozzáadáshoz</p>
                    </div>
                  </CanvasDroppable>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 md:flex-none w-full md:w-96 md:max-w-sm border-2 flex min-h-0 flex-col shrink-0 overflow-hidden">
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pt-6">
            <p className="shrink-0 text-2xl font-semibold">Feladattípusok</p>
            <p className="mt-2 mb-4 shrink-0">Húzd balra a feladat hozzáadásához</p>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <CanvasDroppable id="droppable-2" fillParent={false}>
                {AVAILABLE_TASK_TYPES.map((item) => (
                  <PaletteDraggable key={`palette-${item.id}`} id={`palette-${item.id}`} typeId={item.id} />
                ))}
              </CanvasDroppable>
            </div>
          </CardContent>
        </Card>
      </div>
    </DragDropProvider>
  );
}

function DolgozatEditorInner() {
  const metaForm = useForm<DolgozatMetaFormValues>({
    resolver: zodResolver(dolgozatMetaSchema),
    defaultValues: { title: "" },
    mode: "onBlur",
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
