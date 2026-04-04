import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  toAdd?: boolean;
  toRemove?: boolean;
  aiChangeSetId?: string;
  aiGroupId?: string;
  aiOpId?: string;
  aiGroupIndex?: number;
};

export type ListItemNode = {
  type: "list-item";
  children: Array<FormattedText | ListContainerNode>;
};

export type ImageWrapMode =
  | "inline"
  | "square"
  | "tight"
  | "through"
  | "topBottom"
  | "behindText"
  | "inFrontOfText";

export type ImageLayoutV2 = {
  version: 2;
  wrap: {
    mode: ImageWrapMode;
    side: "left" | "right" | "both";
    margin: number;
  };
  anchor: {
    kind: "moveWithText" | "fixed";
    refNodeId?: string;
    offset: {
      x: number;
      y: number;
    };
  };
  position: {
    x: number;
    y: number;
    relativeTo: "editor" | "page" | "anchor";
    zIndex: number;
    allowOverlap: boolean;
  };
  size: {
    width: number;
    height?: number;
    widthPercent: number;
    heightAuto: boolean;
    lockAspectRatio: boolean;
  };
};

/** @deprecated Prefer ImageLayoutV2; kept as alias for legacy references */
export type ImageLayout = ImageLayoutV2;

export type ImageFloat = "left" | "right" | "none";

export type ImageLayoutV3 = {
  version: 3;
  float: ImageFloat;
  /** Width as % of the editor content column */
  widthPercent: number;
  /** Fixed height in px; omit for natural aspect ratio */
  heightPx?: number;
};

export type ImageLayoutUnion = ImageLayoutV2 | ImageLayoutV3;

export type ImageNode = {
  id?: string;
  pageId?: string;
  type: "image";
  src: string;
  alt?: string;
  caption?: string;
  assetId?: number | string;
  layout: ImageLayoutUnion;
  children: FormattedText[];
};

export type TextBlockNode = {
  id?: string;
  pageId?: string;
  type:
    | "paragraph"
    | "heading-one"
    | "heading-two"
    | "heading-three"
    | "heading-four"
    | "heading-five"
    | "heading-six";
  children: FormattedText[];
};

export type ListContainerNode = {
  id?: string;
  pageId?: string;
  type: "unordered-list" | "ordered-list";
  children: ListItemNode[];
};

export type TableCellNode = {
  type: "table-cell";
  id?: string;
  children: TextBlockNode[];
};

export type TableRowNode = {
  type: "table-row";
  id?: string;
  children: TableCellNode[];
};

export type TableNode = {
  id?: string;
  pageId?: string;
  type: "table";
  children: TableRowNode[];
};

export type SlateEditorNode =
  | TextBlockNode
  | ListContainerNode
  | ListItemNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | ImageNode;

export type MarkType = "bold" | "italic" | "underline" | "strikethrough";

declare module "slate" {
  interface CustomTypes {
    Editor: ReactEditor & HistoryEditor;
    Element: SlateEditorNode;
    Text: FormattedText;
  }
}

export type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

export type GroupedAiOperation = {
  action: "add" | "remove" | "replace";
  operationId?: string;
  changeSetId?: string;
  groupId?: string;
  groupIndex?: number;
  opIndex?: number;
  target?: {
    targetNodeId?: string;
    beforeNodeId?: string;
    afterNodeId?: string;
    parentNodeId?: string;
    path?: number[];
    pathVersion?: string;
    startOffset?: number;
    endOffset?: number;
    insertPosition?: "before" | "after" | "inside";
  };
  oldContent?: unknown;
  newContent?: unknown;
};

export type GroupedAiResponse = {
  changeSetId?: string;
  baseRevision?: string;
  resultRevision?: string;
  groups?: Array<{
    groupId: string;
    groupIndex: number;
    label?: string;
    pageId?: string;
    operationCount?: number;
  }>;
  operations?: GroupedAiOperation[];
  conflicts?: Array<{ type?: string; code?: string; message?: string }>;
  checksum?: string;
  messageToClient?: string;
};

export type PendingAiEditGroup = {
  groupId: string;
  groupIndex: number;
  label: string;
  changeSetId?: string;
  pageId: string;
  operationIds: string[];
  operationCount: number;
  targetSummary: string;
  status: "pending" | "accepted" | "rejected";
};
