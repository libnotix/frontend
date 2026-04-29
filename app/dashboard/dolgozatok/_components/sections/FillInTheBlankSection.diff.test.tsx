import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import type { FieldDiffMap } from "../aiEdit/diffEngine";
import { ExamCardDiffProvider } from "../aiEdit/ExamCardDiffContext";
import { FillInTheBlankSection } from "./FillInTheBlankSection";

function BlankFixture({ diffMap }: { diffMap: FieldDiffMap }) {
   const methods = useForm({
      defaultValues: {
         blanks: [{ text: "Előtte ", acceptedAnswers: ["régi"], afterText: " utána." }],
      },
   });
   return (
      <FormProvider {...methods}>
         <ExamCardDiffProvider diffMap={diffMap}>
            <FillInTheBlankSection />
         </ExamCardDiffProvider>
      </FormProvider>
   );
}

describe("FillInTheBlankSection diff mode", () => {
   it("shows strike and proposal when accepted answer changes", () => {
      const diffMap: FieldDiffMap = {
         "blanks.0.acceptedAnswers.0": { kind: "changed", before: "régi", after: "új" },
      };
      const { container } = render(<BlankFixture diffMap={diffMap} />);
      expect(container.querySelector(".line-through")?.textContent).toContain("régi");
      expect(container.querySelector("[aria-live=\"polite\"]")?.textContent).toContain("új");
   });
});
