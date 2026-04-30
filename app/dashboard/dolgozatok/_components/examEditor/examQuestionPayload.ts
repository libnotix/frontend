import type { ExamQuestionInput } from "@/api";
import { dedupeCanvasItemsById, newCanvasItemId } from "../dnd/canvasItemsState";
import { isExamTaskTypeId } from "../examTaskTypes";
import type { ExamQuestionFormSnapshot } from "../examSaveContext";
import type { CanvasItem } from "../types";

export function pickExamUpdatedAtFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const exam = p.exam;
  if (exam && typeof exam === "object" && typeof (exam as Record<string, unknown>).updatedAt === "string") {
    return (exam as Record<string, unknown>).updatedAt as string;
  }
  if (typeof p.updatedAt === "string") return p.updatedAt;
  return null;
}

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

export async function parseExamIdFromResponse(response: Response): Promise<number | null> {
  try {
    const payload = await response.clone().json();
    if (typeof payload?.id === "number") return payload.id;
    if (typeof payload?.exam?.id === "number") return payload.exam.id;
  } catch {
    // No JSON body or no id in payload.
  }
  return null;
}

export function mapLoadedQuestionsToCanvasItems(questions: unknown): CanvasItem[] {
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

export function toExamQuestionPayload(
  items: CanvasItem[],
  getQuestionSnapshot: (canvasItemId: string) => ExamQuestionFormSnapshot | null,
): ExamQuestionInput[] {
  return dedupeCanvasItemsById(items).map((item, index) => {
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
}
