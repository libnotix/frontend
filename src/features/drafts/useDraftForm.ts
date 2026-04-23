import { useForm } from "react-hook-form";
import { DraftEditorFormValues, DraftEditorModel } from "./types";

export const EMPTY_DRAFT_CONTENT: DraftEditorFormValues["content"] = [
  { type: "paragraph", children: [{ text: "" }] },
];

export function toDraftFormValues(
  draft: Pick<DraftEditorModel, "title" | "content">,
): DraftEditorFormValues {
  return {
    title: draft.title ?? "",
    content: draft.content?.length ? draft.content : EMPTY_DRAFT_CONTENT,
  };
}

export function useDraftForm() {
  return useForm<DraftEditorFormValues>({
    defaultValues: {
      title: "",
      content: EMPTY_DRAFT_CONTENT,
    },
  });
}

