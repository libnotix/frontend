import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import type { FieldDiffMap } from "../aiEdit/diffEngine";
import { ExamCardDiffProvider } from "../aiEdit/ExamCardDiffContext";
import { MultipleChoiceSection } from "./MultipleChoiceSection";

function RadioFixture({ diffMap }: { diffMap: FieldDiffMap }) {
   const methods = useForm({
      defaultValues: {
         options: [
            { id: "opt_a", label: "A" },
            { id: "opt_b", label: "B" },
         ],
         correctOptionId: "opt_a",
      },
   });
   return (
      <FormProvider {...methods}>
         <ExamCardDiffProvider diffMap={diffMap}>
            <MultipleChoiceSection mode="radio" />
         </ExamCardDiffProvider>
      </FormProvider>
   );
}

describe("MultipleChoiceSection diff mode", () => {
   it("shows strike-through and proposed label when an option label changes", () => {
      const diffMap: FieldDiffMap = {
         "options.0.label": { kind: "changed", before: "A", after: "Alpha" },
      };
      const { container } = render(<RadioFixture diffMap={diffMap} />);
      expect(container.querySelector(".line-through")?.textContent).toContain("A");
      expect(container.querySelector("[aria-live=\"polite\"]")?.textContent).toContain("Alpha");
   });

   it("renders a ghost row for an added option id", () => {
      const diffMap: FieldDiffMap = {
         "options.__added.opt_new.label": { kind: "added", after: "Új lehetőség" },
      };
      const { container } = render(<RadioFixture diffMap={diffMap} />);
      expect(container.querySelector("[aria-live=\"polite\"]")?.textContent).toContain("Új lehetőség");
   });
});
