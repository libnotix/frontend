import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import type { DragDropManager } from "@dnd-kit/dom";
import { DragDropProvider, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/react";
import { LayoutList, MessageSquareText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardAmbientBackdrop } from "@/components/dashboard/DashboardAmbientBackdrop";
import { cn } from "@/lib/utils";
import ExamDynamicIsland, { type ExamLeftViewMode } from "../../[id]/ExamDynamicIsland";
import { ExamChatPanel } from "../aiEdit/ExamChatPanel";
import { AVAILABLE_TASK_TYPES } from "../constants";
import { CanvasDroppable } from "../CanvasDroppable";
import type { ExamQuestionFormSnapshot } from "../examSaveContext";
import { ExamPreviewPanel } from "../ExamPreviewPanel";
import { PaletteDraggable } from "../PaletteDraggable";
import { SortableQuestionItem } from "../SortableQuestionItem";
import type { CanvasItem } from "../types";

type ExamClientQuestion = {
  clientId: string;
  serverId: number | null;
  questionId?: number;
};

type DolgozatEditorWorkspaceViewProps = {
  isValidRoute: boolean;
  listHref: string;
  title: string;
  onTitleChange: (nextTitle: string) => void;
  leftViewMode: ExamLeftViewMode;
  onLeftViewModeChange: Dispatch<SetStateAction<ExamLeftViewMode>>;
  titleError?: string;
  invalidQuestionCount: number;
  isSaving: boolean;
  isSaveError: boolean;
  lastSaved: Date | null;
  saveStatusMessage: string | null;
  canSave: boolean;
  onSave: () => void;
  onDelete?: () => void;
  dnd: {
    activeDragId: string | null;
    hoveredTargetId: string | null;
    onDragStart: (event: DragStartEvent) => void;
    onDragOver: (event: DragOverEvent) => void;
    onDragEnd: (event: DragEndEvent, manager: DragDropManager) => void;
  };
  leftItems: CanvasItem[];
  ghostItems: CanvasItem[];
  examId: number | null;
  examUpdatedAt: string | null;
  examClientQuestions: ExamClientQuestion[];
  rightRailTab: "tasks" | "chat";
  onRightRailTabChange: Dispatch<SetStateAction<"tasks" | "chat">>;
  getQuestionSnapshot: (canvasItemId: string) => ExamQuestionFormSnapshot | null;
  onQuestionChange: () => void;
  onQuestionDelete: (canvasItemId: string) => void;
  onQuestionDuplicate: (item: CanvasItem) => void;
  onQuestionMoveToTop: (canvasItemId: string) => void;
  onGhostDelete: (operationId: string) => void;
};

export function DolgozatEditorWorkspaceView({
  isValidRoute,
  listHref,
  title,
  onTitleChange,
  leftViewMode,
  onLeftViewModeChange,
  titleError,
  invalidQuestionCount,
  isSaving,
  isSaveError,
  lastSaved,
  saveStatusMessage,
  canSave,
  onSave,
  onDelete,
  dnd,
  leftItems,
  ghostItems,
  examId,
  examUpdatedAt,
  examClientQuestions,
  rightRailTab,
  onRightRailTabChange,
  getQuestionSnapshot,
  onQuestionChange,
  onQuestionDelete,
  onQuestionDuplicate,
  onQuestionMoveToTop,
  onGhostDelete,
}: DolgozatEditorWorkspaceViewProps) {
  if (!isValidRoute) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-muted-foreground">Érvénytelen dolgozat-cím. Ellenőrizd a hivatkozást.</p>
        <Button type="button" asChild>
          <Link href={listHref}>Vissza a dolgozatokhoz</Link>
        </Button>
      </div>
    );
  }

  return (
    <DragDropProvider onDragStart={dnd.onDragStart} onDragOver={dnd.onDragOver} onDragEnd={dnd.onDragEnd}>
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden print:h-auto print:overflow-visible">
        <DashboardAmbientBackdrop className="print:hidden" />
        <ExamDynamicIsland
          title={title}
          onTitleChange={onTitleChange}
          leftViewMode={leftViewMode}
          onLeftViewModeChange={onLeftViewModeChange}
          titleError={titleError}
          invalidQuestionCount={invalidQuestionCount}
          isSaving={isSaving}
          isSaveError={isSaveError}
          lastSaved={lastSaved}
          saveStatusMessage={saveStatusMessage}
          canSave={canSave}
          onSave={onSave}
          onDelete={onDelete}
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
                          dnd.activeDragId?.startsWith("palette-") && dnd.hoveredTargetId === item.id ? (
                            <div className="pointer-events-none absolute -top-2 left-0 right-0 z-10 h-1.5 translate-y-[-50%] rounded-full border border-primary/50 bg-primary shadow" />
                          ) : null
                        }
                        onQuestionChange={onQuestionChange}
                        examId={examId ?? undefined}
                        onDelete={() => onQuestionDelete(item.id)}
                        onDuplicate={() => onQuestionDuplicate(item)}
                        onMoveToTop={() => onQuestionMoveToTop(item.id)}
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
                        onDelete={item.ghostOperationId ? () => onGhostDelete(item.ghostOperationId!) : undefined}
                        canMoveToTop={false}
                      />
                    ))}

                    {(leftItems.length > 0 || ghostItems.length > 0) && (
                      <CanvasDroppable id="droppable-1">
                        <div className="relative mt-8 flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-6 transition-colors hover:bg-muted/30">
                          {dnd.activeDragId?.startsWith("palette-") && dnd.hoveredTargetId === "droppable-1" && (
                            <div className="pointer-events-none absolute -top-1 left-0 right-0 h-1.5 border border-primary/50 bg-primary shadow transition-all" />
                          )}
                          <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                            <Plus className="h-6 w-6" />
                          </div>
                          <h3 className="text-base font-semibold">Új kérdés hozzáadása</h3>
                          <p className="mt-1 text-sm leading-snug text-muted-foreground">
                            Húzz be egy újabb kérdést a hozzáadáshoz
                          </p>
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
                onClick={() => onRightRailTabChange("tasks")}
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
                onClick={() => onRightRailTabChange("chat")}
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
                  <p className="mb-3 shrink-0 text-xs leading-snug text-muted-foreground">
                    Húzd balra a feladat hozzáadásához
                  </p>
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
