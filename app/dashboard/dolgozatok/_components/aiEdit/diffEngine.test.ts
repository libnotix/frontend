import { describe, expect, it } from "bun:test";
import { EXAM_TASK_TYPE } from "../examTaskTypes";
import { computeExamFormDiff, snapshotToComparableForm } from "./diffEngine";

describe("computeExamFormDiff", () => {
   it("detects option label change by id", () => {
      const before = {
         title: "Q",
         description: "",
         points: 5,
         options: [
            { id: "opt_a", label: "A" },
            { id: "opt_b", label: "B" },
         ],
         correctOptionId: "opt_a",
      };
      const after = {
         title: "Q",
         description: "",
         points: 5,
         options: [
            { id: "opt_a", label: "Alpha" },
            { id: "opt_b", label: "B" },
         ],
         correctOptionId: "opt_a",
      };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.Radio, before, after);
      expect(d["options.0.label"]?.kind).toBe("changed");
      expect(d["options.0.label"]?.before).toBe("A");
      expect(d["options.0.label"]?.after).toBe("Alpha");
   });

   it("emits added option id path", () => {
      const before = {
         title: "",
         description: "",
         points: 5,
         options: [{ id: "opt_a", label: "A" }],
         correctOptionId: "opt_a",
      };
      const after = {
         title: "",
         description: "",
         points: 5,
         options: [
            { id: "opt_a", label: "A" },
            { id: "opt_new", label: "New" },
         ],
         correctOptionId: "opt_a",
      };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.Radio, before, after);
      expect(d["options.__added.opt_new.label"]?.kind).toBe("added");
   });

   it("finds blanks accepted answer drift", () => {
      const before = {
         title: "",
         description: "",
         points: 5,
         blanks: [{ text: "a", acceptedAnswers: ["x"], afterText: "b" }],
      };
      const after = {
         title: "",
         description: "",
         points: 5,
         blanks: [{ text: "a", acceptedAnswers: ["y"], afterText: "b" }],
      };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.FillInTheBlank, before, after);
      expect(d["blanks.0.acceptedAnswers.0"]?.kind).toBe("changed");
      expect(String(d["blanks.0.acceptedAnswers.0"]?.before)).toBe("x");
   });
});

describe("snapshotToComparableForm", () => {
   it("round-trips trivial radio snapshot", () => {
      const snap = {
         title: "T",
         description: "",
         rubric: "",
         maxPoints: 3,
         spec: { options: [{ id: "a", label: "A" }] },
         correctAnswer: { optionId: "a" },
      };
      const form = snapshotToComparableForm(EXAM_TASK_TYPE.Radio, snap);
      expect(form.title).toBe("T");
      expect(form.points).toBe(3);
   });
});

describe("computeExamFormDiff update/delete/reorder-style paths", () => {
   it("detects TrueFalse correctAnswer igaz vs hamis", () => {
      const before = { title: "", description: "", points: 1, correctAnswer: "igaz" };
      const after = { ...before, correctAnswer: "hamis" };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.TrueFalse, before, after);
      expect(d.correctAnswer?.kind).toBe("changed");
      expect(String(d.correctAnswer?.before)).toBe("igaz");
      expect(String(d.correctAnswer?.after)).toBe("hamis");
   });

   it("marks removed radio option row when an option id disappears", () => {
      const before = {
         title: "",
         description: "",
         points: 5,
         options: [
            { id: "opt_a", label: "A" },
            { id: "opt_b", label: "B" },
         ],
         correctOptionId: "opt_b",
      };
      const after = {
         ...before,
         options: [{ id: "opt_b", label: "B" }],
         correctOptionId: "opt_b",
      };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.Radio, before, after);
      expect(d["options.__removed.0.label"]?.kind).toBe("removed");
      expect(d["options.__removed.0.label"]?.before).toBe("A");
   });

   it("detects ordering item label change by index", () => {
      const before = {
         title: "",
         description: "",
         points: 4,
         items: [{ value: "Első" }, { value: "Második" }],
      };
      const after = {
         ...before,
         items: [{ value: "Honfoglalás" }, { value: "Második" }],
      };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.Ordering, before, after);
      expect(d["items.0.value"]?.kind).toBe("changed");
      expect(d["items.0.value"]?.before).toBe("Első");
      expect(d["items.0.value"]?.after).toBe("Honfoglalás");
   });

   it("detects exam-meta scalar drift on radio cards", () => {
      const before = {
         title: "Régi",
         description: "",
         points: 5,
         options: [
            { id: "x", label: "a" },
            { id: "y", label: "b" },
         ],
         correctOptionId: "x",
      };
      const after = { ...before, title: "Új cím", points: 7 };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.Radio, before, after);
      expect(d.title?.kind).toBe("changed");
      expect(d.points?.kind).toBe("changed");
   });

   it("treats AI-rewritten option ids with new labels as positional label changes", () => {
      const before = {
         title: "",
         description: "",
         points: 5,
         options: [
            { id: "q1_a", label: "Reggel" },
            { id: "q1_b", label: "Délben" },
         ],
         correctOptionId: "q1_a",
      };
      const after = {
         title: "",
         description: "",
         points: 5,
         options: [
            { id: "opt_aaaaaaaa", label: "Reggel 7-kor" },
            { id: "opt_bbbbbbbb", label: "Reggel 8-kor" },
         ],
         correctOptionId: "opt_aaaaaaaa",
      };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.Radio, before, after);
      expect(d["options.0.label"]?.kind).toBe("changed");
      expect(d["options.0.label"]?.before).toBe("Reggel");
      expect(d["options.0.label"]?.after).toBe("Reggel 7-kor");
      expect(d["options.1.label"]?.kind).toBe("changed");
      expect(d["options.1.label"]?.before).toBe("Délben");
      expect(d["options.1.label"]?.after).toBe("Reggel 8-kor");
      expect(d.correctOptionId).toBeUndefined();
      expect(Object.keys(d).filter((k) => k.startsWith("options.__"))).toHaveLength(0);
   });

   it("flags radio correctOptionId only when the picked position changes", () => {
      const before = {
         title: "",
         description: "",
         points: 5,
         options: [
            { id: "q1_a", label: "A" },
            { id: "q1_b", label: "B" },
         ],
         correctOptionId: "q1_a",
      };
      const renamedSamePosition = {
         ...before,
         options: [
            { id: "opt_x", label: "A" },
            { id: "opt_y", label: "B" },
         ],
         correctOptionId: "opt_x",
      };
      const noChange = computeExamFormDiff(EXAM_TASK_TYPE.Radio, before, renamedSamePosition);
      expect(noChange.correctOptionId).toBeUndefined();

      const flippedAnswer = { ...renamedSamePosition, correctOptionId: "opt_y" };
      const flipped = computeExamFormDiff(EXAM_TASK_TYPE.Radio, before, flippedAnswer);
      expect(flipped.correctOptionId?.kind).toBe("changed");
   });

   it("surfaces matching premise index alignment changes", () => {
      const before = {
         title: "",
         description: "",
         points: 4,
         premises: [{ value: "P1", correctResponseIndices: [0] }],
         responses: [{ value: "R1" }],
      };
      const after = {
         ...before,
         premises: [{ value: "P1 módosítva", correctResponseIndices: [0] }],
      };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.Matching, before, after);
      expect(d["premises.0.value"]?.kind).toBe("changed");
   });

   it("does not emit points diff when YAML parses numeric string equal to snapshot number", () => {
      const before = { title: "", description: "", points: 4, rubric: "", answerLineCount: 18 };
      const after = { ...before, points: "4" as unknown as number };
      const d = computeExamFormDiff(EXAM_TASK_TYPE.LongAnswer, before, after);
      expect(d.points).toBeUndefined();
   });
});
