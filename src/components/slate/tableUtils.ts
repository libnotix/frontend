import { Editor, Element, Node, Path, Point, Transforms } from "slate";
import { TableNode, TableRowNode, TableCellNode, ImageNode, ImageLayoutV3 } from "./types";
import { clampWidthPercent, normalizeImageLayoutToV3 } from "./imageLayout";

function createNodeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyTable(rows = 2, cols = 2): TableNode {
  const safeRows = Math.max(1, rows);
  const safeCols = Math.max(1, cols);
  const tableRows: TableRowNode[] = Array.from({ length: safeRows }, (_, rowIdx) => ({
    type: "table-row",
    id: createNodeId(`table-row-${rowIdx + 1}`),
    children: Array.from({ length: safeCols }, (_, colIdx) => ({
      type: "table-cell",
      id: createNodeId(`table-cell-${rowIdx + 1}-${colIdx + 1}`),
      children: [
        {
          type: "paragraph",
          id: createNodeId("paragraph"),
          children: [{ text: "" }],
        },
      ],
    })),
  }));
  return {
    type: "table",
    id: createNodeId("table"),
    children: tableRows,
  };
}

function resolveTopLevelInsertPath(editor: Editor): Path {
  if (!editor.selection) return [editor.children.length];
  const blockEntry = Editor.above(editor, {
    at: editor.selection,
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
  });
  if (!blockEntry) return [editor.children.length];
  const [, blockPath] = blockEntry;
  const topLevelIndex = blockPath[0];
  if (!Number.isInteger(topLevelIndex)) return [editor.children.length];
  return [Math.min(editor.children.length, Number(topLevelIndex) + 1)];
}

export function insertTable(editor: Editor, rows = 2, cols = 2): boolean {
  const table = createEmptyTable(rows, cols);
  try {
    const insertAt = resolveTopLevelInsertPath(editor);
    Transforms.insertNodes(editor, table, { at: insertAt });
    return true;
  } catch (error) {
    console.error("Failed to insert table", error);
    return false;
  }
}

export function getCurrentTableCellEntry(editor: Editor) {
  if (!editor.selection) return null;
  const cellEntry = Editor.above(editor, {
    at: editor.selection,
    match: (n) => Element.isElement(n) && n.type === "table-cell",
  });
  if (!cellEntry) return null;
  return cellEntry as [TableCellNode, Path];
}

export function moveToNextTableCellOrAddRow(editor: Editor): boolean {
  const cellEntry = getCurrentTableCellEntry(editor);
  if (!cellEntry) return false;
  const [, cellPath] = cellEntry;
  const rowPath = Path.parent(cellPath);
  const tablePath = Path.parent(rowPath);
  if (!Node.has(editor, tablePath)) return false;
  const tableNode = Node.get(editor, tablePath);
  if (!Element.isElement(tableNode) || tableNode.type !== "table") return false;
  const rowIndex = cellPath[cellPath.length - 2] ?? 0;
  const colIndex = cellPath[cellPath.length - 1] ?? 0;
  const currentRow = tableNode.children[rowIndex] as TableRowNode | undefined;
  const colCount = currentRow?.children?.length ?? 0;
  if (colCount === 0) return false;

  const isLastCellInRow = colIndex >= colCount - 1;
  const isLastRow = rowIndex >= tableNode.children.length - 1;
  if (!isLastCellInRow) {
    const nextCellPath = [...rowPath, colIndex + 1];
    const point = Editor.start(editor, [...nextCellPath, 0]);
    Transforms.select(editor, point);
    return true;
  }

  if (!isLastRow) {
    const nextRowFirstCell = [tablePath[0], rowIndex + 1, 0, 0];
    const point = Editor.start(editor, nextRowFirstCell);
    Transforms.select(editor, point);
    return true;
  }

  const newRow: TableRowNode = {
    type: "table-row",
    id: createNodeId("table-row"),
    children: Array.from({ length: colCount }, (_, index) => ({
      type: "table-cell",
      id: createNodeId(`table-cell-${index + 1}`),
      children: [
        {
          type: "paragraph",
          id: createNodeId("paragraph"),
          children: [{ text: "" }],
        },
      ],
    })),
  };
  Transforms.insertNodes(editor, newRow, { at: Path.next(rowPath) });
  const firstPoint = Editor.start(editor, [...Path.next(rowPath), 0, 0]);
  Transforms.select(editor, firstPoint);
  return true;
}

export function moveToPreviousTableCell(editor: Editor): boolean {
  const cellEntry = getCurrentTableCellEntry(editor);
  if (!cellEntry) return false;
  const [, cellPath] = cellEntry;
  const rowPath = Path.parent(cellPath);
  const tablePath = Path.parent(rowPath);
  const rowIndex = cellPath[cellPath.length - 2] ?? 0;
  const colIndex = cellPath[cellPath.length - 1] ?? 0;

  if (colIndex > 0) {
    const prevCellPath = [...rowPath, colIndex - 1];
    const point = Editor.end(editor, [...prevCellPath, 0]);
    Transforms.select(editor, point);
    return true;
  }
  if (rowIndex > 0) {
    const prevRowPath = [tablePath[0], rowIndex - 1];
    const prevRow = Node.get(editor, prevRowPath) as TableRowNode;
    const prevCol = Math.max((prevRow.children?.length ?? 1) - 1, 0);
    const point = Editor.end(editor, [...prevRowPath, prevCol, 0]);
    Transforms.select(editor, point);
    return true;
  }
  return false;
}

export function insertImageNode(
  editor: Editor,
  image: Omit<ImageNode, "type" | "children">,
): boolean {
  const layout = normalizeImageLayoutToV3(image.layout);
  const node: ImageNode = {
    ...image,
    type: "image",
    id: image.id ?? createNodeId("image"),
    layout,
    children: [{ text: "" }],
  };
  try {
    const insertAt = resolveTopLevelInsertPath(editor);
    Transforms.insertNodes(editor, node, { at: insertAt });
    const nextPath = Path.next(insertAt);
    if (!Node.has(editor, nextPath)) {
      Transforms.insertNodes(
        editor,
        {
          type: "paragraph",
          id: createNodeId("paragraph"),
          children: [{ text: "" }],
        } as any,
        { at: nextPath },
      );
    }
    Transforms.select(editor, Editor.start(editor, nextPath));
    return true;
  } catch (error) {
    console.error("Failed to insert image node", error);
    return false;
  }
}

/**
 * Swap this image with the adjacent top-level block (one step up/down).
 * Uses remove + insert instead of moveNodes so only the image node is affected
 * (avoids surprising moves with voids / Slate's multi-node move behavior).
 */
export function moveImageBlock(editor: Editor, imagePath: Path, direction: "up" | "down") {
  if (imagePath.length !== 1) return;
  const i = imagePath[0];
  if (!Node.has(editor, imagePath)) return;
  const node = Node.get(editor, imagePath);
  if (!Element.isElement(node) || node.type !== "image") return;

  if (direction === "up") {
    if (i < 1) return;
    const snapshot = JSON.parse(JSON.stringify(node)) as ImageNode;
    const newPath: Path = [i - 1];
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: imagePath, voids: true });
      Transforms.insertNodes(editor, snapshot, { at: newPath });
    });
    const point = Editor.start(editor, newPath);
    Transforms.select(editor, { anchor: point, focus: point });
    return;
  }

  if (direction === "down") {
    if (i >= editor.children.length - 1) return;
    const snapshot = JSON.parse(JSON.stringify(node)) as ImageNode;
    const newPath: Path = [i + 1];
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: imagePath, voids: true });
      Transforms.insertNodes(editor, snapshot, { at: newPath });
    });
    const point = Editor.start(editor, newPath);
    Transforms.select(editor, { anchor: point, focus: point });
  }
}

export function updateImageNode(editor: Editor, imagePath: Path, patch: Partial<ImageNode>) {
  if (!Node.has(editor, imagePath)) return;
  Transforms.setNodes(editor, patch, { at: imagePath });
}

export function updateImageLayout(editor: Editor, imagePath: Path, patch: Partial<ImageLayoutV3>) {
  if (!Node.has(editor, imagePath)) return;
  const existing = Node.get(editor, imagePath) as ImageNode;
  if (!Element.isElement(existing) || existing.type !== "image") return;
  const base = normalizeImageLayoutToV3(existing.layout);
  const widthPercent = clampWidthPercent(
    typeof patch.widthPercent === "number" ? patch.widthPercent : base.widthPercent,
  );
  const merged: ImageLayoutV3 = {
    version: 3,
    float: patch.float !== undefined ? patch.float : base.float,
    widthPercent,
  };
  if ("heightPx" in patch) {
    if (typeof patch.heightPx === "number" && patch.heightPx > 0) {
      merged.heightPx = patch.heightPx;
    }
  } else if (base.heightPx !== undefined) {
    merged.heightPx = base.heightPx;
  }
  Transforms.setNodes(editor, { layout: merged } as Partial<ImageNode>, { at: imagePath });
}

export function getImagePathFromPoint(editor: Editor, point: Point): Path | null {
  const entry = Editor.above(editor, {
    at: point,
    match: (n) => Element.isElement(n) && n.type === "image",
  });
  if (!entry) return null;
  return entry[1];
}

function getTableAtPath(editor: Editor, tablePath: Path): TableNode | null {
  if (!Node.has(editor, tablePath)) return null;
  const node = Node.get(editor, tablePath);
  if (!Element.isElement(node) || node.type !== "table") return null;
  return node as unknown as TableNode;
}

function createEmptyTableCell(rowIndex: number, colIndex: number): TableCellNode {
  return {
    type: "table-cell",
    id: createNodeId(`table-cell-${rowIndex + 1}-${colIndex + 1}`),
    children: [
      {
        type: "paragraph",
        id: createNodeId("paragraph"),
        children: [{ text: "" }],
      },
    ],
  };
}

export function insertTableRowAt(editor: Editor, cellPath: Path, position: "above" | "below") {
  const rowPath = Path.parent(cellPath);
  const tablePath = Path.parent(rowPath);
  const table = getTableAtPath(editor, tablePath);
  if (!table) return false;
  const rowIndex = rowPath[rowPath.length - 1] ?? 0;
  const colCount = (table.children[rowIndex] as TableRowNode | undefined)?.children.length ?? 1;
  const newRow: TableRowNode = {
    type: "table-row",
    id: createNodeId("table-row"),
    children: Array.from({ length: Math.max(1, colCount) }, (_, colIndex) =>
      createEmptyTableCell(rowIndex, colIndex),
    ),
  };
  const insertAt = position === "above" ? rowPath : Path.next(rowPath);
  Transforms.insertNodes(editor, newRow, { at: insertAt });
  return true;
}

export function deleteTableRowAt(editor: Editor, cellPath: Path) {
  const rowPath = Path.parent(cellPath);
  const tablePath = Path.parent(rowPath);
  const table = getTableAtPath(editor, tablePath);
  if (!table) return false;
  if (table.children.length <= 1) return false;
  Transforms.removeNodes(editor, { at: rowPath });
  return true;
}

export function insertTableColumnAt(editor: Editor, cellPath: Path, position: "left" | "right") {
  const rowPath = Path.parent(cellPath);
  const tablePath = Path.parent(rowPath);
  const table = getTableAtPath(editor, tablePath);
  if (!table) return false;
  const colIndex = cellPath[cellPath.length - 1] ?? 0;
  const insertColIndex = position === "left" ? colIndex : colIndex + 1;
  for (let rowIndex = 0; rowIndex < table.children.length; rowIndex += 1) {
    const row = table.children[rowIndex];
    if (!row) continue;
    const at = [...tablePath, rowIndex, insertColIndex];
    Transforms.insertNodes(editor, createEmptyTableCell(rowIndex, insertColIndex), { at });
  }
  return true;
}

export function deleteTableColumnAt(editor: Editor, cellPath: Path) {
  const rowPath = Path.parent(cellPath);
  const tablePath = Path.parent(rowPath);
  const table = getTableAtPath(editor, tablePath);
  if (!table) return false;
  const colIndex = cellPath[cellPath.length - 1] ?? 0;
  const firstRow = table.children[0];
  const colCount = firstRow?.children.length ?? 0;
  if (colCount <= 1) return false;
  for (let rowIndex = table.children.length - 1; rowIndex >= 0; rowIndex -= 1) {
    const at = [...tablePath, rowIndex, colIndex];
    if (Node.has(editor, at)) {
      Transforms.removeNodes(editor, { at });
    }
  }
  return true;
}
