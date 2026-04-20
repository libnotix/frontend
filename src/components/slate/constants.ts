import { MarkType, SlateEditorNode } from "./types";

export const ALL_BLOCK_TYPES: SlateEditorNode["type"][] = [
  "paragraph",
  "unordered-list",
  "ordered-list",
  "table",
  "image",
  "heading-one",
  "heading-two",
  "heading-three",
];

export const ALL_MARK_TYPES: MarkType[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
];
