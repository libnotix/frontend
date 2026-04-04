import { mergeImageLayoutFromAI, normalizeImageLayoutsInNodes } from "@/components/slate/imageLayout";
import type { ImageNode } from "@/components/slate/types";
import { parseInlineRichText } from "@/lib/parseInlineRichText";
import { Editor, Element, Node, Path, Text, Transforms } from "slate";

// ---------------------------------------------------------------------------
// Types for AI Operations
// ---------------------------------------------------------------------------

export type AIOperation = {
  action: "append" | "prepend" | "replace" | "remove" | "add";
  changeSetId?: string;
  groupId?: string;
  groupIndex?: number;
  opIndex?: number;
  operationId?: string;
  content?: Node | Node[];
  path?: number[];
  oldContent?: Node | Node[];
  newContent?: Node | Node[];
  target?: {
    targetNodeId?: string;
    path?: number[];
    pathVersion?: string;
    insertPosition?: "before" | "after" | "inside";
  };
  opId?: string;
};

type DiffMark = {
  toAdd: boolean;
  toRemove: boolean;
};

type DiffMetadata = {
  aiChangeSetId?: string;
  aiGroupId?: string;
  aiOpId?: string;
  aiGroupIndex?: number;
};

function withStableOperationIdentity(operations: AIOperation[]): AIOperation[] {
  const fallbackChangeSetId = `client-changeset-${Date.now().toString(36)}-${operations.length}`;
  return operations.map((operation, index) => {
    const changeSetId =
      operation.changeSetId ??
      fallbackChangeSetId;
    const groupIndex = operation.groupIndex ?? 0;
    const groupId = operation.groupId ?? `${changeSetId}-group-${groupIndex}`;
    const operationId =
      operation.operationId ??
      operation.opId ??
      `${groupId}-op-${operation.opIndex ?? index}`;
    return {
      ...operation,
      changeSetId,
      groupIndex,
      groupId,
      operationId,
    };
  });
}

/** Split text leaves that contain inline HTML or markdown formatting into proper marked leaves. */
function expandHtmlTextLeaf(rec: Record<string, unknown>): Record<string, unknown>[] {
  const t = rec.text;
  if (typeof t !== "string") return [rec];
  const hasHtml = t.includes("<") && t.includes(">");
  const hasMarkdown = t.includes("**") || t.includes("~~") || /(?<!\*)\*(?!\*)[^*]+\*(?!\*)/.test(t);
  if (!hasHtml && !hasMarkdown) return [rec];
  const parsed = parseInlineRichText(t);
  const diffMeta: Record<string, unknown> = {};
  for (const key of [
    "toAdd",
    "toRemove",
    "aiChangeSetId",
    "aiGroupId",
    "aiOpId",
    "aiGroupIndex",
    "highlight",
  ] as const) {
    if (key in rec) diffMeta[key] = rec[key];
  }
  return parsed.map((leaf) => ({
    ...diffMeta,
    text: leaf.text,
    ...(leaf.bold ? { bold: true } : {}),
    ...(leaf.italic ? { italic: true } : {}),
    ...(leaf.underline ? { underline: true } : {}),
    ...(leaf.strikethrough ? { strikethrough: true } : {}),
  }));
}

function coerceChildrenArray(children: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const c of children) {
    const r = coerceAiSlateNodeForImport(c);
    if (Array.isArray(r)) {
      out.push(...r);
    } else {
      out.push(r);
    }
  }
  return out;
}

/** Coerce API JSON so Slate accepts it (e.g. void image nodes need children). Exported for ChatPanel parsing. */
export function coerceAiSlateNodeForImport(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const rec = value as Record<string, unknown>;

  if (typeof rec.text === "string" && rec.type === undefined) {
    const expanded = expandHtmlTextLeaf(rec);
    if (expanded.length === 1) return expanded[0];
    return expanded;
  }

  if (rec.type === "image") {
    const ch = Array.isArray(rec.children) ? rec.children : [];
    const children =
      ch.length === 0
        ? [{ text: "" }]
        : coerceChildrenArray(ch);
    return { ...rec, children };
  }
  if (rec.type === "table-cell") {
    const ch = Array.isArray(rec.children) ? rec.children : [];
    const mapped = coerceChildrenArray(ch);
    const children =
      mapped.length > 0 ? mapped : [{ type: "paragraph", children: [{ text: "" }] }];
    return { ...rec, children };
  }
  if (Array.isArray(rec.children)) {
    return {
      ...rec,
      children: coerceChildrenArray(rec.children),
    };
  }
  return value;
}

function subtreeHasAiRemoveMark(node: Node): boolean {
  if (Text.isText(node)) {
    return (node as { toRemove?: boolean }).toRemove === true;
  }
  if (Element.isElement(node) && node.children) {
    return node.children.some(subtreeHasAiRemoveMark);
  }
  return false;
}

function normalizeOperationContent(content: unknown): Node[] {
  if (!content) return [];
  const candidateNodes = Array.isArray(content) ? content : [content];
  return candidateNodes
    .flatMap((item) => {
      const c = coerceAiSlateNodeForImport(item);
      return Array.isArray(c) ? c : [c];
    })
    .filter((item): item is Node => Node.isNode(item))
    .map((item) => {
      if (!Element.isElement(item)) return item;
      const record = item as Record<string, unknown>;
      if (typeof record.id === "string" && record.id.length > 0) return item;
      return {
        ...record,
        id: `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      } as unknown as Node;
    });
}

function applyMarksToTextLeaves(
  value: unknown,
  marks: DiffMark,
  metadata: DiffMetadata,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => applyMarksToTextLeaves(item, marks, metadata));
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const record = value as Record<string, unknown>;
  const nextRecord: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(record)) {
    nextRecord[key] = applyMarksToTextLeaves(nested, marks, metadata);
  }

  if (typeof record.text === "string") {
    return {
      ...nextRecord,
      ...marks,
      ...metadata,
    };
  }

  return nextRecord;
}

function extractOpMetadata(op: AIOperation): DiffMetadata {
  return {
    aiChangeSetId: op.changeSetId,
    aiGroupId: op.groupId,
    aiOpId: op.operationId ?? op.opId,
    aiGroupIndex: op.groupIndex,
  };
}

function markInsertedContentAsAdded(content: Node[], metadata: DiffMetadata): Node[] {
  return content.map((item) =>
    applyMarksToTextLeaves(
      item,
      { toAdd: true, toRemove: false },
      metadata,
    ) as Node,
  );
}

function markExistingNodeAsRemoved(
  editor: Editor,
  path: number[],
  metadata: DiffMetadata,
) {
  Transforms.setNodes(
    editor,
    {
      toRemove: true,
      toAdd: false,
      ...metadata,
    },
    {
      at: path,
      match: Text.isText,
      mode: "all",
    },
  );
}

function findPathByTargetNodeId(
  editor: Editor,
  targetNodeId: string,
): number[] | undefined {
  for (const [node, path] of Editor.nodes(editor, {
    at: [],
    match: (n) => {
      if (!Node.isNode(n)) return false;
      if (!("children" in (n as Record<string, unknown>))) return false;
      const record = n as Record<string, unknown>;
      return (
        record.targetNodeId === targetNodeId ||
        record.nodeId === targetNodeId ||
        record.id === targetNodeId
      );
    },
  })) {
    if (Node.isNode(node)) return path;
  }
  return undefined;
}

function nodeAtPathMatchesTargetId(
  editor: Editor,
  path: number[],
  targetNodeId: string,
): boolean {
  if (!Node.has(editor, path)) return false;
  const node = Node.get(editor, path) as Record<string, unknown>;
  return (
    node.targetNodeId === targetNodeId ||
    node.nodeId === targetNodeId ||
    node.id === targetNodeId
  );
}

function getTargetPath(editor: Editor, op: AIOperation): number[] | undefined {
  const inlinePath = Array.isArray(op.path) ? op.path : undefined;
  const targetPath = Array.isArray(op.target?.path) ? op.target.path : undefined;
  const targetNodeId = op.target?.targetNodeId;

  // If backend gives a targetNodeId, enforce ID-safe resolution first.
  if (typeof targetNodeId === "string" && targetNodeId.length > 0) {
    if (
      targetPath &&
      nodeAtPathMatchesTargetId(editor, targetPath, targetNodeId)
    ) {
      return targetPath;
    }
    if (inlinePath && nodeAtPathMatchesTargetId(editor, inlinePath, targetNodeId)) {
      return inlinePath;
    }
    const resolvedById = findPathByTargetNodeId(editor, targetNodeId);
    if (resolvedById) return resolvedById;
    return undefined;
  }

  if (targetPath && Node.has(editor, targetPath)) return targetPath;
  if (inlinePath && Node.has(editor, inlinePath)) return inlinePath;

  if (targetPath) return targetPath;
  if (inlinePath) return inlinePath;
  return undefined;
}

function insertRemovedSnapshot(
  editor: Editor,
  path: number[] | undefined,
  oldContent: Node[],
  metadata: DiffMetadata,
) {
  if (oldContent.length === 0) return;
  const removedSnapshot = oldContent.map((item) =>
    applyMarksToTextLeaves(
      item,
      { toAdd: false, toRemove: true },
      metadata,
    ) as Node,
  );
  if (path && Node.has(editor, path)) {
    Transforms.insertNodes(editor, removedSnapshot, { at: path });
    return;
  }
  Transforms.insertNodes(editor, removedSnapshot, { at: [editor.children.length] });
}

/**
 * Parses and safely applies a series of AI-generated Slate operations to the editor.
 *
 * @param editor The Slate editor instance
 * @param operations Array of parsed operations from the AI chat backend
 */
export function applyAIOperationsToSlate(
  editor: Editor,
  operations: AIOperation[],
) {
  if (!Array.isArray(operations) || operations.length === 0) return;
  const normalizedOperations = withStableOperationIdentity(operations);

  Editor.withoutNormalizing(editor, () => {
    // Reverse iterating paths if we assume operations might affect subsequent paths?
    // Generally the AI returns operations based on the initial state of the document.
    // However, if the AI provided 'replace' or 'remove' with explicit paths,
    // working from the bottom (highest path index) to the top avoids shifting paths.
    // For now, we execute sequentially as instructed. If bugs occur, sorting by path is an option.

    for (const op of normalizedOperations) {
      if (!op || !op.action) continue;
      const metadata = extractOpMetadata(op);
      const targetPath = getTargetPath(editor, op);
      const contentArray = normalizeOperationContent(op.content);
      const oldContent = normalizeOperationContent(op.oldContent);
      const newContent = normalizeOperationContent(op.newContent);
      const contentArrayNorm = normalizeImageLayoutsInNodes(contentArray);
      const newContentNorm = normalizeImageLayoutsInNodes(newContent);
      const oldContentNorm = normalizeImageLayoutsInNodes(oldContent);
      const addedContent = markInsertedContentAsAdded(contentArrayNorm, metadata);
      const newAddedContent = markInsertedContentAsAdded(newContentNorm, metadata);

      try {
        switch (op.action) {
          case "append": {
            const end = editor.children.length;
            if (addedContent.length > 0) {
              Transforms.insertNodes(editor, addedContent, { at: [end] });
            }
            break;
          }
          case "prepend": {
            if (addedContent.length > 0) {
              Transforms.insertNodes(editor, addedContent, { at: [0] });
            }
            break;
          }
          case "replace": {
            const rawPayload = newContent.length > 0 ? newContent : contentArray;
            const hasTargetNode = !!(targetPath && Node.has(editor, targetPath));

            if (
              hasTargetNode &&
              targetPath &&
              rawPayload.length === 1 &&
              Element.isElement(rawPayload[0]) &&
              rawPayload[0].type === "image"
            ) {
              const current = Node.get(editor, targetPath);
              if (Element.isElement(current) && current.type === "image") {
                const cur = current as ImageNode;
                const incoming = rawPayload[0] as ImageNode;
                const merged: ImageNode = {
                  ...cur,
                  ...incoming,
                  id: cur.id,
                  type: "image",
                  children: [{ text: "" }],
                  layout: mergeImageLayoutFromAI(cur.layout, incoming.layout),
                };
                Transforms.setNodes(editor, merged as never, { at: targetPath });
                break;
              }
            }

            if (hasTargetNode && targetPath) {
              // Normal replace flow: keep original in-place and mark it removed.
              markExistingNodeAsRemoved(editor, targetPath, metadata);
            } else if (oldContentNorm.length > 0) {
              // Fallback when path cannot be resolved: show removed snapshot.
              insertRemovedSnapshot(editor, targetPath, oldContentNorm, metadata);
            }

            const payload = newAddedContent.length > 0 ? newAddedContent : addedContent;
            if (payload.length > 0) {
              if (hasTargetNode && targetPath) {
                Transforms.insertNodes(editor, payload, { at: Path.next(targetPath) });
              } else {
                Transforms.insertNodes(editor, payload, { at: [editor.children.length] });
              }
            }
            break;
          }
          case "remove": {
            const hasTargetNode = !!(targetPath && Node.has(editor, targetPath));
            if (hasTargetNode && targetPath) {
              markExistingNodeAsRemoved(editor, targetPath, metadata);
              break;
            }
            if (oldContentNorm.length > 0) {
              // Fallback snapshot only when the target node cannot be addressed.
              insertRemovedSnapshot(editor, targetPath, oldContentNorm, metadata);
            }
            break;
          }
          case "add": {
            const payload = newAddedContent.length > 0 ? newAddedContent : addedContent;
            const rawPayload = newContent.length > 0 ? newContent : contentArray;
            if (payload.length === 0) break;

            const insertPos = op.target?.insertPosition;
            if (
              targetPath &&
              Node.has(editor, targetPath) &&
              insertPos === "after" &&
              rawPayload.length === 1 &&
              Element.isElement(rawPayload[0]) &&
              rawPayload[0].type === "image"
            ) {
              const current = Node.get(editor, targetPath);
              if (
                Element.isElement(current) &&
                current.type === "image" &&
                subtreeHasAiRemoveMark(current)
              ) {
                const cur = current as ImageNode;
                const incoming = rawPayload[0] as ImageNode;
                const merged: ImageNode = {
                  ...cur,
                  ...incoming,
                  id: cur.id,
                  type: "image",
                  children: [{ text: "" }],
                  layout: mergeImageLayoutFromAI(cur.layout, incoming.layout),
                };
                Transforms.setNodes(editor, merged as never, { at: targetPath });
                break;
              }
            }

            if (targetPath && Node.has(editor, targetPath)) {
              Transforms.insertNodes(editor, payload, { at: Path.next(targetPath) });
            } else {
              Transforms.insertNodes(editor, payload, { at: [editor.children.length] });
            }
            break;
          }
        }
      } catch (err) {
        console.error("Failed to apply Slate AI operation:", op, err);
      }
    }
  });
}
