"use client";

import { taskTypeLabel } from "./constants";
import type { ExamTaskTypeId } from "./examTaskTypes";

type QuestionInactivePreviewProps = {
   typeId: ExamTaskTypeId;
};

export function QuestionInactivePreview({ typeId }: QuestionInactivePreviewProps) {
   return (
      <div className="flex items-center justify-between pl-6 py-2">
         <div>
            <h3 className="text-lg font-bold">Cell Structure Basics</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">
               {taskTypeLabel(typeId) ?? "Multiple Choice"} • 5 Points
            </p>
         </div>
      </div>
   );
}
