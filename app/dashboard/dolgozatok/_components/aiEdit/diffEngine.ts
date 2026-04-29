import type { ExamQuestionFormSnapshot } from "../examSaveContext";
import { EXAM_TASK_TYPE, type ExamTaskTypeId } from "../examTaskTypes";
import { serverQuestionToFormDefaults } from "../form/serverQuestionToFormDefaults";

export type DiffLeafKind = "changed" | "added" | "removed";

/** Per dotted form path (`options.2.label`, `correctOptionId`, …). */
export type DiffLeaf = {
   kind: DiffLeafKind;
   before?: unknown;
   after?: unknown;
};

export type FieldDiffMap = Record<string, DiffLeaf>;

type GroupingItemFormRow = { value?: string; correctGroupIndex?: number };

function stableStringify(v: unknown): string {
   return JSON.stringify(v, Object.keys(typeof v === "object" && v !== null ? (v as object) : []).sort());
}

function eq(a: unknown, b: unknown): boolean {
   if (Object.is(a, b)) return true;
   if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) return true;
   // YAML often parses integers as numbers while snapshots may compare with strings — avoid noisy diffs.
   if (
      (typeof a === "number" && typeof b === "string") ||
      (typeof a === "string" && typeof b === "number")
   ) {
      const ns = typeof a === "string" ? a.trim() : typeof b === "string" ? b.trim() : "";
      const nn = typeof a === "number" ? a : typeof b === "number" ? b : NaN;
      if (/^-?\d+(\.\d+)?$/.test(ns) && Number.isFinite(nn) && Number(ns) === nn) return true;
   }
   if (typeof a !== typeof b) return false;
   if (a && b && typeof a === "object" && typeof b === "object") {
      try {
         return stableStringify(a) === stableStringify(b);
      } catch {
         return String(a) === String(b);
      }
   }
   return false;
}

/** Build comparable form-shape object from persisted snapshot (matches `serverQuestionToFormDefaults` output shape). */
export function snapshotToComparableForm(
   typeId: ExamTaskTypeId,
   snap: ExamQuestionFormSnapshot | null,
): Record<string, unknown> {
   if (!snap) return {};
   const raw = {
      type: typeId,
      title: snap.title,
      description: snap.description ?? "",
      maxPoints: snap.maxPoints,
      rubric: snap.rubric ?? "",
      spec: snap.spec,
      correctAnswer: snap.correctAnswer,
   };
   return serverQuestionToFormDefaults(typeId, raw) ?? {};
}

function leaf(
   kind: DiffLeafKind,
   before?: unknown,
   after?: unknown,
): DiffLeaf {
   const d: DiffLeaf = { kind };
   if (before !== undefined) d.before = before;
   if (after !== undefined) d.after = after;
   return d;
}

/** Every leaf marked `added` — for create ghosts (index-based dotted paths). */
export function buildAllAddedDiff(_typeId: ExamTaskTypeId, proposed: Record<string, unknown>): FieldDiffMap {
   const flattened = deepFlattenLeaves(proposed);
   const out: FieldDiffMap = {};
   for (const [path, after] of Object.entries(flattened)) {
      out[path] = leaf("added", undefined, after);
   }
   return out;
}

/** Index-based leaf paths (`title`, `options.0.label`, …). */
export function deepFlattenLeaves(value: unknown): Record<string, unknown> {
   const result: Record<string, unknown> = {};

   function walk(path: string, v: unknown) {
      if (v === null || v === undefined) {
         if (path) result[path] = v;
         return;
      }
      if (typeof v !== "object") {
         result[path] = v;
         return;
      }
      if (Array.isArray(v)) {
         v.forEach((item, i) => walk(path ? `${path}.${i}` : String(i), item));
         return;
      }
      const keys = Object.keys(v as Record<string, unknown>);
      if (keys.length === 0) {
         if (path) result[path] = v;
         return;
      }
      for (const key of keys) {
         walk(path ? `${path}.${key}` : key, (v as Record<string, unknown>)[key]);
      }
   }

   walk("", value);
   return result;
}

/** Field-level diff for editor cards. */
export function computeExamFormDiff(
   typeId: ExamTaskTypeId,
   beforeRaw: Record<string, unknown>,
   afterRaw: Record<string, unknown>,
): FieldDiffMap {
   switch (typeId) {
      case EXAM_TASK_TYPE.Radio:
      case EXAM_TASK_TYPE.Checkbox:
         return diffMultipleChoice(typeId, beforeRaw, afterRaw);
      case EXAM_TASK_TYPE.TrueFalse:
      case EXAM_TASK_TYPE.ShortAnswer:
      case EXAM_TASK_TYPE.LongAnswer:
         return diffScalars(beforeRaw, afterRaw);
      case EXAM_TASK_TYPE.Matching:
         return diffMatching(beforeRaw, afterRaw);
      case EXAM_TASK_TYPE.Ordering:
         return diffSimpleListNamed("items", beforeRaw, afterRaw);
      case EXAM_TASK_TYPE.Grouping: {
         const scal = diffScalarsExclude(beforeRaw, afterRaw, new Set(["groups", "items"]));
         const out: FieldDiffMap = {
            ...scal,
            ...diffArrayOfValueObjects("groups", beforeRaw, afterRaw),
         };
         const bi = Array.isArray(beforeRaw.items) ? (beforeRaw.items as GroupingItemFormRow[]) : [];
         const ai = Array.isArray(afterRaw.items) ? (afterRaw.items as GroupingItemFormRow[]) : [];
         const maxI = Math.max(bi.length, ai.length);
         for (let i = 0; i < maxI; i++) {
            const b = bi[i];
            const a = ai[i];
            const pathV = `items.${i}.value`;
            const pathG = `items.${i}.correctGroupIndex`;
            if (a && !b) {
               out[pathV] = leaf("added", undefined, a.value);
               out[pathG] = leaf("added", undefined, a.correctGroupIndex);
            } else if (b && !a) {
               out[pathV] = leaf("removed", b.value, undefined);
               out[pathG] = leaf("removed", b.correctGroupIndex, undefined);
            } else if (b && a) {
               if (!eq(b.value, a.value)) out[pathV] = leaf("changed", b.value, a.value);
               if (!eq(b.correctGroupIndex, a.correctGroupIndex))
                  out[pathG] = leaf("changed", b.correctGroupIndex, a.correctGroupIndex);
            }
         }
         return out;
      }
      case EXAM_TASK_TYPE.FillInTheBlank:
         return diffFillBlanks(beforeRaw, afterRaw);
      default:
         return diffScalars(beforeRaw, afterRaw);
   }
}

function diffScalars(a: Record<string, unknown>, b: Record<string, unknown>): FieldDiffMap {
   const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
   const diff: FieldDiffMap = {};
   for (const k of keys) {
      const va = k in a ? a[k] : undefined;
      const vb = k in b ? b[k] : undefined;
      if (!(k in a)) diff[k] = leaf("added", undefined, vb);
      else if (!(k in b)) diff[k] = leaf("removed", va, undefined);
      else if (!eq(va, vb)) diff[k] = leaf("changed", va, vb);
   }
   return diff;
}

function diffMultipleChoice(
   mode: typeof EXAM_TASK_TYPE.Radio | typeof EXAM_TASK_TYPE.Checkbox,
   beforeRaw: Record<string, unknown>,
   afterRaw: Record<string, unknown>,
): FieldDiffMap {
   const diff: FieldDiffMap = {};
   Object.assign(diff, diffScalarsExclude(beforeRaw, afterRaw, new Set(["options", "correctOptionId", "correctOptionIds"])));

   const bo = Array.isArray(beforeRaw.options) ? (beforeRaw.options as { id: string; label: string }[]) : [];
   const ao = Array.isArray(afterRaw.options) ? (afterRaw.options as { id: string; label: string }[]) : [];
   const bIdToIndex = new Map(bo.map((o, i) => [o.id, i] as const));

   const matchedBefore = new Set<number>();
   const matchedAfter = new Set<number>();
   // AI position → user (rendered-row) position. Lets us project after-side correctness onto live rows.
   const aiPosToUserPos = new Map<number, number>();

   ao.forEach((arow, ai) => {
      const bi = bIdToIndex.get(arow.id);
      if (bi === undefined) return;
      const brow = bo[bi]!;
      matchedBefore.add(bi);
      matchedAfter.add(ai);
      aiPosToUserPos.set(ai, bi);
      if (!eq(brow.label, arow.label)) {
         diff[`options.${bi}.label`] = leaf("changed", brow.label, arow.label);
      }
   });

   const unmatchedBefore: number[] = [];
   for (let bi = 0; bi < bo.length; bi++) if (!matchedBefore.has(bi)) unmatchedBefore.push(bi);
   const unmatchedAfter: number[] = [];
   for (let ai = 0; ai < ao.length; ai++) if (!matchedAfter.has(ai)) unmatchedAfter.push(ai);

   // Pair the leftover rows positionally. AI sometimes rewrites option IDs while only
   // changing the labels — surface those as in-place label changes instead of a noisy
   // remove + add pair. Excess unpaired rows fall back to remove / add ghosts.
   const pairCount = Math.min(unmatchedBefore.length, unmatchedAfter.length);
   for (let p = 0; p < pairCount; p++) {
      const bi = unmatchedBefore[p]!;
      const ai = unmatchedAfter[p]!;
      const brow = bo[bi]!;
      const arow = ao[ai]!;
      aiPosToUserPos.set(ai, bi);
      if (!eq(brow.label, arow.label)) {
         diff[`options.${bi}.label`] = leaf("changed", brow.label, arow.label);
      }
   }
   for (let p = pairCount; p < unmatchedBefore.length; p++) {
      const bi = unmatchedBefore[p]!;
      diff[`options.__removed.${bi}.label`] = leaf("removed", bo[bi]!.label, undefined);
   }
   for (let p = pairCount; p < unmatchedAfter.length; p++) {
      const ai = unmatchedAfter[p]!;
      const arow = ao[ai]!;
      diff[`options.__added.${arow.id}.label`] = leaf("added", undefined, arow.label);
   }

   const beforeCorrectUserIdx = new Set<number>();
   const afterCorrectUserIdx = new Set<number>();
   const afterCorrectAddedIds = new Set<string>();

   if (mode === EXAM_TASK_TYPE.Radio) {
      const bc = typeof beforeRaw.correctOptionId === "string" ? beforeRaw.correctOptionId : "";
      const ac = typeof afterRaw.correctOptionId === "string" ? afterRaw.correctOptionId : "";
      const biCorrect = bc ? bo.findIndex((x) => x.id === bc) : -1;
      const aiCorrect = ac ? ao.findIndex((x) => x.id === ac) : -1;
      if (biCorrect >= 0) beforeCorrectUserIdx.add(biCorrect);
      if (aiCorrect >= 0) {
         const userPos = aiPosToUserPos.get(aiCorrect);
         if (userPos !== undefined) afterCorrectUserIdx.add(userPos);
         else afterCorrectAddedIds.add(ao[aiCorrect]!.id);
      }
      // Compare by *position* of the correct option so an ID-only rewrite (same row picked) is not flagged.
      if (biCorrect !== aiCorrect) diff.correctOptionId = leaf("changed", bc, ac);
   } else {
      const bIds = normalizeStringArray((beforeRaw.correctOptionIds ?? []) as string[]);
      const aIds = normalizeStringArray((afterRaw.correctOptionIds ?? []) as string[]);
      for (const id of bIds) {
         const idx = bo.findIndex((x) => x.id === id);
         if (idx >= 0) beforeCorrectUserIdx.add(idx);
      }
      for (const id of aIds) {
         const aiIdx = ao.findIndex((x) => x.id === id);
         if (aiIdx < 0) continue;
         const userPos = aiPosToUserPos.get(aiIdx);
         if (userPos !== undefined) afterCorrectUserIdx.add(userPos);
         else afterCorrectAddedIds.add(ao[aiIdx]!.id);
      }
      const sameSelection =
         beforeCorrectUserIdx.size === afterCorrectUserIdx.size &&
         [...beforeCorrectUserIdx].every((i) => afterCorrectUserIdx.has(i)) &&
         afterCorrectAddedIds.size === 0;
      if (!sameSelection) diff.correctOptionIds = leaf("changed", beforeRaw.correctOptionIds, afterRaw.correctOptionIds);
   }

   // Per-row correctness — lets the editor card paint the proposed selection on the live radio/checkbox.
   const touchedUserPositions = new Set<number>([...beforeCorrectUserIdx, ...afterCorrectUserIdx]);
   for (const i of touchedUserPositions) {
      const was = beforeCorrectUserIdx.has(i);
      const will = afterCorrectUserIdx.has(i);
      if (was !== will) diff[`options.${i}.correct`] = leaf("changed", was, will);
   }
   for (const id of afterCorrectAddedIds) {
      diff[`options.__added.${id}.correct`] = leaf("added", undefined, true);
   }

   return diff;
}

function normalizeStringArray(x: unknown[]): string[] {
   return x.filter((y): y is string => typeof y === "string");
}

function diffScalarsExclude(
   a: Record<string, unknown>,
   b: Record<string, unknown>,
   exclude: Set<string>,
): FieldDiffMap {
   const keys = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => !exclude.has(k)));
   const diff: FieldDiffMap = {};
   for (const k of keys) {
      const va = k in a ? a[k] : undefined;
      const vb = k in b ? b[k] : undefined;
      if (!(k in a)) diff[k] = leaf("added", undefined, vb);
      else if (!(k in b)) diff[k] = leaf("removed", va, undefined);
      else if (!eq(va, vb)) diff[k] = leaf("changed", va, vb);
   }
   return diff;
}

function diffMatching(beforeRaw: Record<string, unknown>, afterRaw: Record<string, unknown>): FieldDiffMap {
   const diff: FieldDiffMap = {
      ...diffScalarsExclude(beforeRaw, afterRaw, new Set(["premises", "responses"])),
   };
   diffArrayOfValueObjects("responses", beforeRaw, afterRaw, diff);

   const bp = (Array.isArray(beforeRaw.premises) ? beforeRaw.premises : []) as {
      value: string;
      correctResponseIndices: number[];
   }[];
   const ap = (Array.isArray(afterRaw.premises) ? afterRaw.premises : []) as {
      value: string;
      correctResponseIndices: number[];
   }[];
   const maxP = Math.max(bp.length, ap.length);
   for (let i = 0; i < maxP; i++) {
      const b = bp[i];
      const a = ap[i];
      if (a && !b) {
         diff[`premises.${i}.value`] = leaf("added", undefined, a.value);
         diff[`premises.${i}.correctResponseIndices`] = leaf("added", undefined, a.correctResponseIndices);
      } else if (b && !a) {
         diff[`premises.${i}.value`] = leaf("removed", b.value, undefined);
         diff[`premises.${i}.correctResponseIndices`] = leaf("removed", b.correctResponseIndices, undefined);
      } else if (b && a) {
         if (!eq(b.value, a.value)) diff[`premises.${i}.value`] = leaf("changed", b.value, a.value);
         if (!eq(b.correctResponseIndices, a.correctResponseIndices))
            diff[`premises.${i}.correctResponseIndices`] = leaf("changed", b.correctResponseIndices, a.correctResponseIndices);
      }
   }
   return diff;
}

function diffArrayOfValueObjects(
   key: "groups" | "items" | "responses" | "premises",
   beforeRaw: Record<string, unknown>,
   afterRaw: Record<string, unknown>,
   target: FieldDiffMap = {},
): FieldDiffMap {
   const b = Array.isArray(beforeRaw[key]) ? (beforeRaw[key] as { value?: string }[]) : [];
   const a = Array.isArray(afterRaw[key]) ? (afterRaw[key] as { value?: string }[]) : [];
   const max = Math.max(b.length, a.length);
   for (let i = 0; i < max; i++) {
      const bv = b[i]?.value;
      const av = a[i]?.value;
      const path = `${key}.${i}.value`;
      if (av !== undefined && bv === undefined) target[path] = leaf("added", undefined, av);
      else if (bv !== undefined && av === undefined) target[path] = leaf("removed", bv, undefined);
      else if (bv !== undefined && av !== undefined && !eq(bv, av)) target[path] = leaf("changed", bv, av);
   }
   return target;
}

function diffSimpleListNamed(
   prop: "groups" | "items",
   beforeRaw: Record<string, unknown>,
   afterRaw: Record<string, unknown>,
): FieldDiffMap {
   return {
      ...diffScalarsExclude(beforeRaw, afterRaw, new Set([prop])),
      ...diffArrayOfValueObjects(prop, beforeRaw, afterRaw),
   };
}

function diffFillBlanks(beforeRaw: Record<string, unknown>, afterRaw: Record<string, unknown>): FieldDiffMap {
   const diff: FieldDiffMap = {};
   Object.assign(diff, diffScalarsExclude(beforeRaw, afterRaw, new Set(["blanks"])));

   const b = Array.isArray(beforeRaw.blanks) ? (beforeRaw.blanks as Record<string, unknown>[]) : [];
   const a = Array.isArray(afterRaw.blanks) ? (afterRaw.blanks as Record<string, unknown>[]) : [];
   const max = Math.max(b.length, a.length);
   for (let i = 0; i < max; i++) {
      const br = b[i];
      const ar = a[i];
      if (ar && !br) {
         diff[`blanks.${i}.text`] = leaf("added", undefined, ar.text ?? "");
         diff[`blanks.${i}.acceptedAnswers.0`] = leaf(
            "added",
            undefined,
            Array.isArray(ar.acceptedAnswers) ? ar.acceptedAnswers[0] ?? "" : "",
         );
         diff[`blanks.${i}.afterText`] = leaf("added", undefined, ar.afterText ?? "");
      } else if (br && !ar) {
         diff[`blanks.${i}.text`] = leaf("removed", br.text ?? "", undefined);
         diff[`blanks.${i}.acceptedAnswers.0`] = leaf(
            "removed",
            Array.isArray(br.acceptedAnswers) ? br.acceptedAnswers[0] ?? "" : "",
            undefined,
         );
         diff[`blanks.${i}.afterText`] = leaf("removed", br.afterText ?? "", undefined);
      } else if (br && ar) {
         const bt = br.text ?? "";
         const at = ar.text ?? "";
         if (!eq(bt, at)) diff[`blanks.${i}.text`] = leaf("changed", bt, at);
         const barr = Array.isArray(br.acceptedAnswers) ? br.acceptedAnswers[0] ?? "" : "";
         const aarr = Array.isArray(ar.acceptedAnswers) ? ar.acceptedAnswers[0] ?? "" : "";
         if (!eq(barr, aarr)) diff[`blanks.${i}.acceptedAnswers.0`] = leaf("changed", barr, aarr);
         const baf = br.afterText ?? "";
         const aaf = ar.afterText ?? "";
         if (!eq(baf, aaf)) diff[`blanks.${i}.afterText`] = leaf("changed", baf, aaf);
      }
   }
   return diff;
}
