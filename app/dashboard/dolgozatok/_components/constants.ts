import type { LucideIcon } from "lucide-react";
import {
   AlignLeft,
   ArrowLeftRight,
   Boxes,
   CircleDot,
   ListChecks,
   ListOrdered,
   Scale,
   TextCursorInput,
   Underline,
} from "lucide-react";

import type { ExamTaskTypeId } from "./examTaskTypes";
import { EXAM_TASK_TYPE } from "./examTaskTypes";

/** All canvas question cards must use this `group` in `useSortable` so reordering stays consistent. */
export const CANVAS_SORTABLE_GROUP = "dolgozat-canvas-questions";

export type ExamTaskTypeMeta = {
   id: ExamTaskTypeId;
   /** Megjelenítendő név (pl. palette kártya, kérdés-előnézet, badge). */
   text: string;
   /** Egysoros összefoglaló a feladattípusról — palette kártya alcímként. */
   description: string;
   /** Lucide ikon a feladattípushoz. */
   icon: LucideIcon;
};

export const AVAILABLE_TASK_TYPES: readonly ExamTaskTypeMeta[] = [
   {
      id: EXAM_TASK_TYPE.Radio,
      text: "Feleletválasztós (egy helyes)",
      description: "Pontosan egy helyes válasz",
      icon: CircleDot,
   },
   {
      id: EXAM_TASK_TYPE.Checkbox,
      text: "Feleletválasztós (több helyes)",
      description: "Több helyes válasz is lehet",
      icon: ListChecks,
   },
   {
      id: EXAM_TASK_TYPE.TrueFalse,
      text: "Igaz/Hamis",
      description: "Egyszerű igaz–hamis döntés",
      icon: Scale,
   },
   {
      id: EXAM_TASK_TYPE.Matching,
      text: "Párosítás",
      description: "Kifejezések és válaszok párba állítása",
      icon: ArrowLeftRight,
   },
   {
      id: EXAM_TASK_TYPE.Ordering,
      text: "Sorbarendezés",
      description: "Elemek helyes sorrendbe állítása",
      icon: ListOrdered,
   },
   {
      id: EXAM_TASK_TYPE.Grouping,
      text: "Csoportosítás",
      description: "Elemek csoportokba sorolása",
      icon: Boxes,
   },
   {
      id: EXAM_TASK_TYPE.FillInTheBlank,
      text: "Lyukas szöveg",
      description: "Hiányzó szavak pótlása",
      icon: Underline,
   },
   {
      id: EXAM_TASK_TYPE.ShortAnswer,
      text: "Rövid válasz",
      description: "Egysoros szöveges válasz",
      icon: TextCursorInput,
   },
   {
      id: EXAM_TASK_TYPE.LongAnswer,
      text: "Hosszú válasz",
      description: "Esszé jellegű, hosszú válasz",
      icon: AlignLeft,
   },
];

export function taskTypeLabel(typeId: string): string | undefined {
   return AVAILABLE_TASK_TYPES.find((item) => item.id === typeId)?.text;
}

export function getTaskTypeMeta(typeId: string): ExamTaskTypeMeta | undefined {
   return AVAILABLE_TASK_TYPES.find((item) => item.id === typeId);
}
