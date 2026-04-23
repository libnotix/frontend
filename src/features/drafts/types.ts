import { DraftLinkedFile } from "@/api/models/DraftLinkedFile";
import { SlateEditorNode } from "@/components/slate/types";

export type DraftContentEnvelope = {
  activePageId?: string;
  pages?: Array<{ id?: string; title?: string; content?: unknown }>;
  content?: unknown;
};

export type DraftEditorModel = {
  id?: number;
  title: string;
  format?: string;
  content: SlateEditorNode[];
  contentContainer?: DraftContentEnvelope;
  files: DraftLinkedFile[];
  updatedAt?: string;
};

export type DraftEditorFormValues = {
  title: string;
  content: SlateEditorNode[];
};

