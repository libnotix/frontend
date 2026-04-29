/**
 * CSS width for a student-style fill-in underline: roughly the longest accepted
 * answer, plus a little extra room (ch ≈ width of "0" in the current font).
 */
export function fillInBlankUnderlineWidthCh(acceptedAnswers: unknown): string {
   let longest = 0;
   if (Array.isArray(acceptedAnswers)) {
      for (const a of acceptedAnswers) {
         if (typeof a === "string") {
            const len = a.trim().length;
            if (len > longest) longest = len;
         }
      }
   }
   const ch = longest > 0 ? Math.max(3, longest + 1.35) : 3.75;
   return `${ch}ch`;
}
