import { Editor, Element, Path, Transforms } from "slate";

function createNodeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureEditorHasTopLevelNodeIds(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    for (const [node, path] of Editor.nodes(editor, {
      at: [],
      match: (n) => Element.isElement(n),
    })) {
      const maybeId = (node as Record<string, unknown>).id;
      if (typeof maybeId === "string" && maybeId.length > 0) continue;
      const prefix = typeof (node as any).type === "string" ? (node as any).type : "node";
      Transforms.setNodes(editor, { id: createNodeId(prefix) }, { at: path as Path });
    }
  });
}

export function ensureTopLevelNodeIds<T>(nodes: T[]): T[] {
  return nodes.map((node) => {
    if (!node || typeof node !== "object") return node;
    const record = node as Record<string, unknown>;
    if (!Array.isArray(record.children)) return node;
    if (typeof record.id === "string" && record.id.length > 0) return node;
    return { ...record, id: createNodeId("node") } as T;
  });
}

