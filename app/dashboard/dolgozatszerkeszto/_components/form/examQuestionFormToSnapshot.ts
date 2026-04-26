import type { ExamQuestionFormSnapshot } from "../examSaveContext";
import { EXAM_TASK_TYPE, type ExamTaskTypeId } from "../examTaskTypes";

function asRecord(value: unknown): Record<string, unknown> | null {
   if (value && typeof value === "object") return value as Record<string, unknown>;
   return null;
}

/**
 * Builds the PUT /exams/{id}/questions row from the local question form values.
 * `serverQuestion` supplies stable ids when the card was loaded from the API (matching / ordering / blanks).
 */
export function formValuesToExamSnapshot(
   typeId: ExamTaskTypeId,
   v: Record<string, unknown>,
   serverQuestion: unknown,
): ExamQuestionFormSnapshot | null {
   const title = typeof v.title === "string" ? v.title : "";
   const description = typeof v.description === "string" ? v.description : null;
   const rubric = typeof v.rubric === "string" ? v.rubric : "";
   const maxPoints = typeof v.points === "number" && Number.isFinite(v.points) ? v.points : 5;

   switch (typeId) {
      case EXAM_TASK_TYPE.Radio: {
         const options = (v.options as { id: string; label: string }[] | undefined) ?? [];
         const optionId = typeof v.correctOptionId === "string" ? v.correctOptionId : "";
         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: { options: options.map((o) => ({ id: o.id, label: o.label })) },
            correctAnswer: { optionId },
         };
      }
      case EXAM_TASK_TYPE.Checkbox: {
         const options = (v.options as { id: string; label: string }[] | undefined) ?? [];
         const optionIds = Array.isArray(v.correctOptionIds) ? (v.correctOptionIds as string[]) : [];
         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: { options: options.map((o) => ({ id: o.id, label: o.label })) },
            correctAnswer: { optionIds },
         };
      }
      case EXAM_TASK_TYPE.TrueFalse: {
         const ca = v.correctAnswer === "hamis" ? false : true;
         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: {},
            correctAnswer: { value: ca },
         };
      }
      case EXAM_TASK_TYPE.ShortAnswer:
      case EXAM_TASK_TYPE.LongAnswer:
         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: {},
            correctAnswer: null,
         };
      case EXAM_TASK_TYPE.Matching: {
         const server = asRecord(serverQuestion);
         const specS = asRecord(server?.spec);
         const origPremises = Array.isArray(specS?.premises) ? specS.premises : [];
         const origResponses = Array.isArray(specS?.responses) ? specS.responses : [];
         const premiseForms = (v.premises as { value: string; correctResponseIndices: number[] }[] | undefined) ?? [];
         const responseForms = (v.responses as { value: string }[] | undefined) ?? [];

         const premises = premiseForms.map((p, i) => {
            const r = asRecord(origPremises[i]);
            const id = typeof r?.id === "string" ? r.id : `p${i}`;
            return { id, label: p.value };
         });
         const responses = responseForms.map((r, i) => {
            const o = asRecord(origResponses[i]);
            const id = typeof o?.id === "string" ? o.id : `r${i}`;
            return { id, label: r.value };
         });

         let pairs = premiseForms.map((p, pi) => ({
            premiseId: premises[pi]?.id ?? `p${pi}`,
            responseIds: (p.correctResponseIndices ?? [])
               .map((idx) => responses[idx]?.id)
               .filter((x): x is string => typeof x === "string"),
         }));

         // Sok backend elvár legalább egy válasz-id-t kifejezésenként; üres kijelölésnél ciklikus alapértelmezés.
         const allPairsEmpty = pairs.every((pair) => pair.responseIds.length === 0);
         if (allPairsEmpty && responses.length > 0 && premises.length > 0) {
            pairs = premises.map((pr, pi) => {
               const rid = responses[pi % responses.length]?.id;
               return {
                  premiseId: pr.id,
                  responseIds: typeof rid === "string" ? [rid] : [],
               };
            });
         }

         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: { premises, responses },
            correctAnswer: { pairs },
         };
      }
      case EXAM_TASK_TYPE.Ordering: {
         const server = asRecord(serverQuestion);
         const specS = asRecord(server?.spec);
         const origItems = Array.isArray(specS?.items) ? specS.items : [];
         const itemForms = (v.items as { value: string }[] | undefined) ?? [];
         const items = itemForms.map((it, i) => {
            const o = asRecord(origItems[i]);
            const id = typeof o?.id === "string" ? o.id : `item${i}`;
            return { id, label: it.value };
         });
         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: { items },
            correctAnswer: { orderedIds: items.map((it) => it.id) },
         };
      }
      case EXAM_TASK_TYPE.Grouping: {
         const server = asRecord(serverQuestion);
         const specS = asRecord(server?.spec);
         const origG = Array.isArray(specS?.groups) ? specS.groups : [];
         const origI = Array.isArray(specS?.items) ? specS.items : [];
         const groupForms = (v.groups as { value: string }[] | undefined) ?? [];
         const itemForms = (v.items as { value: string }[] | undefined) ?? [];
         const groups = groupForms.map((g, i) => {
            const o = asRecord(origG[i]);
            const id = typeof o?.id === "string" ? o.id : `g${i}`;
            return { id, label: g.value };
         });
         const items = itemForms.map((it, i) => {
            const o = asRecord(origI[i]);
            const id = typeof o?.id === "string" ? o.id : `i${i}`;
            return { id, label: it.value };
         });

         const ca = asRecord(server?.correctAnswer);
         const assignmentsRaw = Array.isArray(ca?.assignments) ? ca.assignments : [];
         const itemIdToGroupId = new Map<string, string>();
         for (const a of assignmentsRaw) {
            const ar = asRecord(a);
            if (typeof ar?.itemId === "string" && typeof ar?.groupId === "string") {
               itemIdToGroupId.set(ar.itemId, ar.groupId);
            }
         }
         const assignments = items.map((it) => ({
            itemId: it.id,
            groupId: itemIdToGroupId.get(it.id) ?? groups[0]?.id ?? "g0",
         }));

         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: { groups, items },
            correctAnswer: { assignments },
         };
      }
      case EXAM_TASK_TYPE.FillInTheBlank: {
         const leadText = typeof v.leadText === "string" ? v.leadText : "";
         const blanks = (v.blanks as { text?: string; acceptedAnswers?: string[] }[] | undefined) ?? [];
         const server = asRecord(serverQuestion);
         const specS = asRecord(server?.spec);
         const origSegments = Array.isArray(specS?.segments) ? specS.segments : [];
         const blankIds: string[] = [];
         for (const seg of origSegments) {
            const s = asRecord(seg);
            if (s?.kind === "blank" && typeof s.id === "string") blankIds.push(s.id);
         }

         const segments: Record<string, unknown>[] = [];
         blanks.forEach((b, i) => {
            const t = typeof b.text === "string" ? b.text.trim() : "";
            if (t && t !== " ") segments.push({ kind: "text", text: t });
            const answers = Array.isArray(b.acceptedAnswers)
               ? b.acceptedAnswers.filter((x): x is string => typeof x === "string")
               : [];
            const blankId = blankIds[i] ?? `blank_${i}`;
            segments.push({
               kind: "blank",
               id: blankId,
               acceptedAnswers: answers.length ? answers : [""],
            });
         });
         const tail = leadText.trim();
         if (tail) segments.push({ kind: "text", text: tail });

         return {
            title,
            description,
            rubric,
            maxPoints,
            spec: { segments },
            correctAnswer: null,
         };
      }
      default:
         return null;
   }
}
