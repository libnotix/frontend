"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { taskTypeLabel } from "./constants";
import type { ExamTaskTypeId } from "./examTaskTypes";

type QuestionInactivePreviewProps = {
   typeId: ExamTaskTypeId;
};

export function QuestionInactivePreview({ typeId }: QuestionInactivePreviewProps) {
   const { control } = useFormContext();
   const title = useWatch({ control, name: "title" }) as string | undefined;
   const points = useWatch({ control, name: "points" }) as number | undefined;

   return (
      <div className="flex items-center justify-between pl-6 py-2">
         <div>
            <h3 className="text-lg font-semibold">{title?.trim() || "Névtelen kérdés"}</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">
               {taskTypeLabel(typeId) ?? "Kérdés"} • {points ?? 0} pont
            </p>
         </div>
      </div>
   );
}
