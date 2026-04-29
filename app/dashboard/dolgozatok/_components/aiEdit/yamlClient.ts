import { parse as parseYaml } from "yaml";
import type { ExamTaskTypeId } from "../examTaskTypes";
import { isExamTaskTypeId } from "../examTaskTypes";
import { serverQuestionToFormDefaults } from "../form/serverQuestionToFormDefaults";

export function stripYamlCodeFences(raw: string): string {
   let s = raw.trim();
   if (s.startsWith("```")) {
      const nl = s.indexOf("\n");
      if (nl !== -1) {
         s = s.slice(nl + 1);
      }
      const end = s.lastIndexOf("```");
      if (end !== -1) s = s.slice(0, end);
   }
   return s.trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
   if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
   return null;
}

/**
 * Parse AI question YAML into a `{ type, … }` object suitable for {@link serverQuestionToFormDefaults}.
 */
export function buildServerQuestionFromYamlBlob(
   typeId: ExamTaskTypeId,
   blob: Record<string, unknown>,
): Record<string, unknown> {
   const title = typeof blob.title === "string" ? blob.title : "";
   const description = typeof blob.description === "string" ? blob.description : "";
   const maxPoints =
      typeof blob.maxPoints === "number" && Number.isFinite(blob.maxPoints) ? blob.maxPoints : 5;
   const rubric = typeof blob.rubric === "string" ? blob.rubric : "";
   const specFromBlob = blob.spec ?? {};
   const specObj = asRecord(specFromBlob) ?? {};
   const lineRoot = blob.answerLineCount;
   const aclFromYaml =
      typeof lineRoot === "number" && Number.isFinite(lineRoot)
         ? Math.min(80, Math.max(1, Math.round(lineRoot)))
         : undefined;
   const specMerged =
      aclFromYaml === undefined ? specFromBlob : { ...specObj, answerLineCount: aclFromYaml };

   return {
      type: typeId,
      title,
      description,
      maxPoints,
      rubric,
      spec: specMerged,
      correctAnswer:
         blob.correctAnswer === undefined
            ? null
            : (blob.correctAnswer as Record<string, unknown> | null),
   };
}

export function yamlToFormDefaults(
   typeId: ExamTaskTypeId,
   yamlString: string,
): { ok: true; values: Record<string, unknown> } | { ok: false; error: string } {
   const stripped = stripYamlCodeFences(yamlString);
   if (!stripped) return { ok: false, error: "Üres YAML." };
   try {
      const parsed = parseYaml(stripped);
      const rec = asRecord(parsed);
      if (!rec) return { ok: false, error: "A YAML nem objektum." };
      const raw = buildServerQuestionFromYamlBlob(typeId, rec);
      const values = serverQuestionToFormDefaults(typeId, raw);
      if (!values || Object.keys(values).length === 0)
         return { ok: false, error: "A kérdés nem alakítható űrlapértékre." };
      return { ok: true, values };
   } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
   }
}

export function parseExamYamlSnippet(raw: string): unknown {
   const stripped = stripYamlCodeFences(raw);
   return stripped ? parseYaml(stripped) : null;
}

/**
 * Validates a `type` string from the envelope (handles API enums).
 */
export function coerceExamTaskTypeId(value: string | null | undefined): ExamTaskTypeId | null {
   if (typeof value !== "string") return null;
   return isExamTaskTypeId(value) ? value : null;
}

/** Raw question row for {@link serverQuestionToFormDefaults} / card `loadedQuestion`. */
export function yamlStringToLoadedQuestion(typeId: ExamTaskTypeId, yaml: string): unknown | null {
   const stripped = stripYamlCodeFences(yaml);
   if (!stripped) return null;
   try {
      const parsed = parseYaml(stripped);
      const rec = asRecord(parsed);
      if (!rec) return null;
      return buildServerQuestionFromYamlBlob(typeId, rec);
   } catch {
      return null;
   }
}

export function ghostCreateClientId(operationId: string): string {
   return `ghost-${operationId}`;
}
