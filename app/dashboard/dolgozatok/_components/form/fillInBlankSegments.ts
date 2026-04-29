/**
 * Wire format: alternating text and blank segments. Between two blanks we may have:
 * - one text run (legacy): all of it is the next blank's "before" text
 * - two text runs: first = previous blank's afterText, second = next blank's before
 * - two runs where the second is SENTINEL: afterText only, next before is empty
 */
export const FILL_IN_BLANK_EMPTY_BEFORE_SENTINEL = "\u2060";

function asRecord(value: unknown): Record<string, unknown> | null {
   if (value && typeof value === "object") return value as Record<string, unknown>;
   return null;
}

function extractAcceptedAnswersFromBlankSeg(s: Record<string, unknown>): string[] {
   const raw = s.acceptedAnswers;
   if (!Array.isArray(raw)) return [""];
   const answers = raw.filter((x): x is string => typeof x === "string" && x.length > 0);
   return answers.length ? answers : [""];
}

export type FillInBlankFormRow = {
   text: string;
   afterText: string;
   acceptedAnswers: string[];
};

/**
 * Parse GET /exams spec.segments into per-blank form rows (before / after / answers).
 */
export function parseFillInBlankSegments(segments: unknown): FillInBlankFormRow[] {
   const segArr = Array.isArray(segments) ? segments : [];
   const rows: FillInBlankFormRow[] = [];
   let i = 0;

   const readTextRuns = (): string[] => {
      const runs: string[] = [];
      while (i < segArr.length) {
         const s = asRecord(segArr[i]);
         if (s?.kind === "text" && typeof s.text === "string") {
            runs.push(s.text);
            i++;
         } else break;
      }
      return runs;
   };

   let pendingBefore = readTextRuns().join("");

   while (i < segArr.length) {
      const s = asRecord(segArr[i]);
      if (s?.kind !== "blank") {
         i++;
         continue;
      }
      const answers = extractAcceptedAnswersFromBlankSeg(s);
      i++;
      rows.push({
         text: pendingBefore.trim() || " ",
         acceptedAnswers: answers,
         afterText: "",
      });

      if (i >= segArr.length) break;

      const runs = readTextRuns();
      const next = asRecord(segArr[i]);
      const hasNextBlank = next?.kind === "blank";

      if (!hasNextBlank) {
         rows[rows.length - 1].afterText = runs.join("");
         pendingBefore = "";
         break;
      }

      if (runs.length === 0) {
         pendingBefore = "";
      } else if (runs.length === 1) {
         rows[rows.length - 1].afterText = "";
         pendingBefore = runs[0];
      } else if (runs.length === 2 && runs[1] === FILL_IN_BLANK_EMPTY_BEFORE_SENTINEL) {
         rows[rows.length - 1].afterText = runs[0];
         pendingBefore = "";
      } else if (runs.length === 2) {
         rows[rows.length - 1].afterText = runs[0];
         pendingBefore = runs[1];
      } else {
         rows[rows.length - 1].afterText = runs[0];
         pendingBefore = runs.slice(1).join("");
      }
   }

   return rows;
}

/**
 * Build spec.segments from form blanks + stable blank ids (from server or synthetic).
 */
export function serializeFillInBlankSegments(
   blanks: { text?: string; afterText?: string; acceptedAnswers?: string[] }[],
   blankIds: string[],
): Record<string, unknown>[] {
   const segments: Record<string, unknown>[] = [];

   blanks.forEach((b, i) => {
      // Only the first blank emits its own "before" text here; for every
      // subsequent blank the "before" run was already pushed by the previous
      // iteration's beforeNext handling below (otherwise it duplicates).
      if (i === 0) {
         const t = typeof b.text === "string" ? b.text.trim() : "";
         if (t && t !== " ") {
            segments.push({ kind: "text", text: t });
         }
      }

      const answers = Array.isArray(b.acceptedAnswers)
         ? b.acceptedAnswers.filter((x): x is string => typeof x === "string")
         : [];
      const blankId = blankIds[i] ?? `blank_${i}`;
      segments.push({
         kind: "blank",
         id: blankId,
         acceptedAnswers: answers.length ? answers : [""],
      });

      const hasNext = i < blanks.length - 1;
      const after = typeof b.afterText === "string" ? b.afterText.trim() : "";
      if (hasNext) {
         const beforeNext = typeof blanks[i + 1]?.text === "string" ? blanks[i + 1].text.trim() : "";
         if (after && beforeNext) {
            segments.push({ kind: "text", text: after });
            segments.push({ kind: "text", text: beforeNext });
         } else if (beforeNext) {
            segments.push({ kind: "text", text: beforeNext });
         } else if (after) {
            segments.push({ kind: "text", text: after });
            segments.push({ kind: "text", text: FILL_IN_BLANK_EMPTY_BEFORE_SENTINEL });
         }
      } else if (after) {
         segments.push({ kind: "text", text: after });
      }
   });

   return segments;
}
