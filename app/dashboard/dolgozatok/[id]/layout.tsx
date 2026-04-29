import type { ReactNode } from "react";
import type { Metadata } from "next";

/**
 * Ha a <title> teljesen üres/null, a Chrome nyomtató előnézetében az URL gyakran megjelenik balon is, jobbon is.
 * Egy láthatatlan (word joiner) karakterrel a címsor „üres”, csak a böngésző alap fejléce marad;
 * a teljes URL eltüntetéséhez a nyomtatópanelben ki kell kapcsolni a „Fejléc és lábléc” opciót.
 */
export const metadata: Metadata = {
  title: {
    absolute: "\u2060",
  },
};

export default function ExamEditorLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
