import type { ExamTaskTypeId } from "../examTaskTypes";
import { EXAM_TASK_TYPE } from "../examTaskTypes";

function asRecord(value: unknown): Record<string, unknown> | null {
   if (value && typeof value === "object") return value as Record<string, unknown>;
   return null;
}

/**
 * Maps a question object from GET /exams/{id} into react-hook-form default values
 * for the dolgozat editor question cards.
 */
export function serverQuestionToFormDefaults(typeId: ExamTaskTypeId, raw: unknown): Record<string, unknown> | null {
   const q = asRecord(raw);
   if (!q) return null;

   const title = typeof q.title === "string" ? q.title : "";
   const description = typeof q.description === "string" ? q.description : "";
   const points = typeof q.maxPoints === "number" && Number.isFinite(q.maxPoints) ? q.maxPoints : 5;
   const rubric = typeof q.rubric === "string" ? q.rubric : "";

   switch (typeId) {
      case EXAM_TASK_TYPE.Radio: {
         const spec = asRecord(q.spec);
         const optionsRaw = spec?.options;
         const options = Array.isArray(optionsRaw)
            ? optionsRaw
                 .map((o) => {
                    const r = asRecord(o);
                    if (!r) return null;
                    const id = typeof r.id === "string" ? r.id : "";
                    const label = typeof r.label === "string" ? r.label : "";
                    if (!id || !label) return null;
                    return { id, label };
                 })
                 .filter((x): x is { id: string; label: string } => x !== null)
            : [];
         const ca = asRecord(q.correctAnswer);
         const optionId = typeof ca?.optionId === "string" ? ca.optionId : options[0]?.id ?? "";
         return { title, description, points, options, correctOptionId: optionId };
      }
      case EXAM_TASK_TYPE.Checkbox: {
         const spec = asRecord(q.spec);
         const optionsRaw = spec?.options;
         const options = Array.isArray(optionsRaw)
            ? optionsRaw
                 .map((o) => {
                    const r = asRecord(o);
                    if (!r) return null;
                    const id = typeof r.id === "string" ? r.id : "";
                    const label = typeof r.label === "string" ? r.label : "";
                    if (!id || !label) return null;
                    return { id, label };
                 })
                 .filter((x): x is { id: string; label: string } => x !== null)
            : [];
         const ca = asRecord(q.correctAnswer);
         const rawIds = ca?.optionIds;
         const optionIds = Array.isArray(rawIds)
            ? rawIds.filter((x): x is string => typeof x === "string")
            : options[0]
              ? [options[0].id]
              : [];
         return { title, description, points, options, correctOptionIds: optionIds };
      }
      case EXAM_TASK_TYPE.TrueFalse: {
         const ca = asRecord(q.correctAnswer);
         const value = ca?.value === false ? "hamis" : "igaz";
         return { title, description, points, correctAnswer: value };
      }
      case EXAM_TASK_TYPE.Matching: {
         const spec = asRecord(q.spec);
         const premisesRaw = spec?.premises;
         const responsesRaw = spec?.responses;
         const premises = Array.isArray(premisesRaw)
            ? premisesRaw
                 .map((p) => {
                    const r = asRecord(p);
                    return typeof r?.label === "string" ? r.label : "";
                 })
                 .filter((s) => s.length > 0)
            : [];
         const responses = Array.isArray(responsesRaw)
            ? responsesRaw
                 .map((p) => {
                    const r = asRecord(p);
                    return typeof r?.label === "string" ? r.label : "";
                 })
                 .filter((s) => s.length > 0)
            : [];

         const responseIdToIndex = new Map<string, number>();
         if (Array.isArray(responsesRaw)) {
            responsesRaw.forEach((item, idx) => {
               const r = asRecord(item);
               if (typeof r?.id === "string") responseIdToIndex.set(r.id, idx);
            });
         }

         const ca = asRecord(q.correctAnswer);
         const pairsRaw = ca?.pairs;
         const pairs = Array.isArray(pairsRaw) ? pairsRaw : [];

         const premiseIdToIndex = new Map<string, number>();
         if (Array.isArray(premisesRaw)) {
            premisesRaw.forEach((item, idx) => {
               const r = asRecord(item);
               if (typeof r?.id === "string") premiseIdToIndex.set(r.id, idx);
            });
         }

         const correctResponseIndices = premises.map(() => [] as number[]);
         for (const pair of pairs) {
            const p = asRecord(pair);
            const premiseId = typeof p?.premiseId === "string" ? p.premiseId : "";
            const pIdx = premiseIdToIndex.get(premiseId);
            if (pIdx === undefined) continue;
            const responseIds = Array.isArray(p?.responseIds) ? p.responseIds : [];
            for (const rid of responseIds) {
               if (typeof rid !== "string") continue;
               const rIdx = responseIdToIndex.get(rid);
               if (rIdx === undefined) continue;
               correctResponseIndices[pIdx].push(rIdx);
            }
         }

         return {
            title,
            description,
            points,
            premises: premises.map((value, i) => ({
               value,
               correctResponseIndices: correctResponseIndices[i] ?? [],
            })),
            responses: responses.map((value) => ({ value })),
         };
      }
      case EXAM_TASK_TYPE.Ordering: {
         const spec = asRecord(q.spec);
         const itemsRaw = spec?.items;
         const items = Array.isArray(itemsRaw)
            ? itemsRaw
                 .map((it) => {
                    const r = asRecord(it);
                    return typeof r?.label === "string" ? r.label : "";
                 })
                 .filter((s) => s.length > 0)
            : [];
         const ca = asRecord(q.correctAnswer);
         const orderedIds = Array.isArray(ca?.orderedIds) ? ca.orderedIds.filter((x): x is string => typeof x === "string") : [];

         const idToLabel = new Map<string, string>();
         if (Array.isArray(itemsRaw)) {
            for (const it of itemsRaw) {
               const r = asRecord(it);
               if (typeof r?.id === "string" && typeof r?.label === "string") idToLabel.set(r.id, r.label);
            }
         }

         const orderedLabels =
            orderedIds.length > 0
               ? orderedIds.map((id) => idToLabel.get(id)).filter((x): x is string => typeof x === "string" && x.length > 0)
               : items;

         return {
            title,
            description,
            points,
            items: orderedLabels.map((value) => ({ value })),
         };
      }
      case EXAM_TASK_TYPE.Grouping: {
         const spec = asRecord(q.spec);
         const groupsRaw = spec?.groups;
         const itemsRaw = spec?.items;
         const groups = Array.isArray(groupsRaw)
            ? groupsRaw
                 .map((g) => {
                    const r = asRecord(g);
                    return typeof r?.label === "string" ? r.label : "";
                 })
                 .filter((s) => s.length > 0)
            : [];
         const items = Array.isArray(itemsRaw)
            ? itemsRaw
                 .map((g) => {
                    const r = asRecord(g);
                    return typeof r?.label === "string" ? r.label : "";
                 })
                 .filter((s) => s.length > 0)
            : [];
         return {
            title,
            description,
            points,
            groups: groups.map((value) => ({ value })),
            items: items.map((value) => ({ value })),
         };
      }
      case EXAM_TASK_TYPE.FillInTheBlank: {
         const spec = asRecord(q.spec);
         const segmentsRaw = spec?.segments;
         const segments = Array.isArray(segmentsRaw) ? segmentsRaw : [];

         let leadText = "";
         const blanks: { text: string; acceptedAnswers: string[] }[] = [];
         let pendingText = "";

         for (const seg of segments) {
            const s = asRecord(seg);
            if (!s) continue;
            const kind = typeof s.kind === "string" ? s.kind : "";
            if (kind === "text") {
               pendingText += typeof s.text === "string" ? s.text : "";
            } else if (kind === "blank") {
               const answers = Array.isArray(s.acceptedAnswers)
                  ? s.acceptedAnswers.filter((x): x is string => typeof x === "string" && x.length > 0)
                  : [];
               blanks.push({
                  text: pendingText.trim() || " ",
                  acceptedAnswers: answers.length ? answers : [""],
               });
               pendingText = "";
            }
         }
         leadText = pendingText;

         if (blanks.length === 0) {
            return { title, description, points, leadText, blanks: [{ text: " ", acceptedAnswers: [""] }] };
         }
         return { title, description, points, leadText, blanks };
      }
      case EXAM_TASK_TYPE.ShortAnswer:
         return { title, description, points, rubric };
      case EXAM_TASK_TYPE.LongAnswer:
         return { title, description, points, rubric: rubric || " " };
      default:
         return { title, description, points };
   }
}
