import { Editor, Element, Node, NodeEntry, Path, Text, Transforms } from "slate";
import { FormattedText, MarkType } from "./types";

export function isMarkActive(editor: Editor, mark: MarkType) {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
}

export function toggleMark(editor: Editor, mark: MarkType) {
  if (isMarkActive(editor, mark)) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
}

export function selectionToPlainText(editor: Editor): string {
  const { selection } = editor;
  if (!selection) return "";
  const fragment = Editor.fragment(editor, selection);
  return fragment.map((node) => Node.string(node)).join("\n");
}

function getMarkedTextPaths(
  editor: Editor,
  mark: "toAdd" | "toRemove",
  at: Path = [],
  group?: AIDiffGroup,
): number[][] {
  return Array.from(
    Editor.nodes(editor, {
      at,
      match: (node) =>
        Text.isText(node) &&
        (node as Text & Record<string, unknown>)[mark] === true &&
        textMatchesGroup(node as FormattedText, group),
    }),
  ).map(([, path]) => path);
}

export type AIDiffGroup = {
  aiChangeSetId?: string;
  aiGroupId?: string;
  aiGroupIndex?: number;
};

function textMatchesGroup(text: FormattedText, group?: AIDiffGroup) {
  if (!group) return true;
  if (group.aiGroupId && text.aiGroupId !== group.aiGroupId) return false;
  if (group.aiChangeSetId && text.aiChangeSetId !== group.aiChangeSetId) {
    return false;
  }
  return true;
}

function isElementFullyMarked(
  entry: NodeEntry,
  mark: "toAdd" | "toRemove",
  group?: AIDiffGroup,
) {
  const [node] = entry;
  if (!Element.isElement(node)) return false;
  const textEntries = Array.from(Node.texts(node));
  return (
    textEntries.length > 0 &&
    textEntries.every(
      ([text]) =>
        (text as Text & Record<string, unknown>)[mark] === true &&
        textMatchesGroup(text as FormattedText, group),
    )
  );
}

function getFullyMarkedElementPaths(
  editor: Editor,
  mark: "toAdd" | "toRemove",
  at: Path = [],
  group?: AIDiffGroup,
): number[][] {
  return Array.from(
    Editor.nodes(editor, {
      at,
      match: (node) => Element.isElement(node),
    }),
  )
    .filter((entry) => isElementFullyMarked(entry, mark, group))
    .map(([, path]) => path);
}

/** If both a table and its rows/cells are "fully marked", only remove the outermost paths. */
function filterToOutermostMarkedPaths(paths: Path[]): Path[] {
  return paths.filter(
    (p) =>
      !paths.some(
        (q) => !Path.equals(p, q) && Path.isAncestor(q, p),
      ),
  );
}

function removeNodesAtPaths(editor: Editor, paths: number[][]) {
  const sortedPaths = [...paths].sort((a, b) => Path.compare(b, a));
  for (const path of sortedPaths) {
    if (Node.has(editor, path)) {
      Transforms.removeNodes(editor, { at: path });
    }
  }
}

function isInsideRemovedSubtree(path: number[], removedPaths: number[][]): boolean {
  return removedPaths.some(
    (removedPath) =>
      Path.equals(removedPath, path) || Path.isAncestor(removedPath, path),
  );
}

function removeMarkedContent(
  editor: Editor,
  mark: "toAdd" | "toRemove",
  at: Path = [],
  group?: AIDiffGroup,
) {
  const fullyMarkedElementPaths = filterToOutermostMarkedPaths(
    getFullyMarkedElementPaths(editor, mark, at, group),
  );
  removeNodesAtPaths(editor, fullyMarkedElementPaths);

  const markedTextPaths = getMarkedTextPaths(editor, mark, at, group).filter(
    (path) => !isInsideRemovedSubtree(path, fullyMarkedElementPaths),
  );
  removeNodesAtPaths(editor, markedTextPaths);
}

function cleanupEmptyListStructures(editor: Editor) {
  const allElementEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      match: (node) => Element.isElement(node),
      mode: "all",
    }),
  ) as Array<NodeEntry<Element>>;

  const removablePaths = allElementEntries
    .filter(([node]) => {
      const type = (node as Element & { type?: string }).type;
      if (
        type !== "list-item" &&
        type !== "ordered-list" &&
        type !== "unordered-list"
      ) {
        return false;
      }
      const text = Node.string(node);
      return text.trim().length === 0;
    })
    .map(([, path]) => path)
    // Deepest-first removal is critical to avoid path-shift deleting
    // newly shifted siblings/containers after a parent removal.
    .sort((a, b) => {
      if (a.length !== b.length) return b.length - a.length;
      return Path.compare(b, a);
    });

  for (const path of removablePaths) {
    if (Node.has(editor, path)) {
      Transforms.removeNodes(editor, { at: path });
    }
  }
}

function clearDiffMark(
  editor: Editor,
  mark: "toAdd" | "toRemove",
  at: Path = [],
  group?: AIDiffGroup,
) {
  Transforms.unsetNodes(editor, mark, {
    at,
    match: (node) =>
      Text.isText(node) &&
      (node as Text & Record<string, unknown>)[mark] === true &&
      textMatchesGroup(node as FormattedText, group),
    mode: "all",
  });
}

export function hasPendingAIDiffMarks(
  editor: Editor,
  at: Path = [],
  group?: AIDiffGroup,
): boolean {
  return (
    getMarkedTextPaths(editor, "toAdd", at, group).length > 0 ||
    getMarkedTextPaths(editor, "toRemove", at, group).length > 0
  );
}

export function acceptAllAIDiffMarks(editor: Editor) {
  acceptAIDiffMarksAtPath(editor, []);
}

export function acceptAIDiffMarksAtPath(editor: Editor, path: Path) {
  Editor.withoutNormalizing(editor, () => {
    removeMarkedContent(editor, "toRemove", path);
    clearDiffMark(editor, "toAdd", path);
    clearDiffMark(editor, "toRemove", path);
  });
}

export function rejectAllAIDiffMarks(editor: Editor) {
  rejectAIDiffMarksAtPath(editor, []);
}

export function rejectAIDiffMarksAtPath(editor: Editor, path: Path) {
  Editor.withoutNormalizing(editor, () => {
    removeMarkedContent(editor, "toAdd", path);
    clearDiffMark(editor, "toRemove", path);
    clearDiffMark(editor, "toAdd", path);
  });
}

function getAllElementPaths(editor: Editor): Path[] {
  return Array.from(
    Editor.nodes(editor, {
      at: [],
      match: (node) => Element.isElement(node),
    }),
  ).map(([, path]) => path);
}

function getGroupForPath(editor: Editor, path: Path): AIDiffGroup | null {
  if (!Node.has(editor, path)) return null;
  const node = Node.get(editor, path);
  if (!Element.isElement(node)) return null;

  const candidates: AIDiffGroup[] = [];
  for (const [text] of Node.texts(node)) {
    const leaf = text as FormattedText;
    if ((leaf.toAdd || leaf.toRemove) && leaf.aiGroupId) {
      candidates.push({
        aiGroupId: leaf.aiGroupId,
        aiChangeSetId: leaf.aiChangeSetId,
        aiGroupIndex:
          typeof leaf.aiGroupIndex === "number" ? leaf.aiGroupIndex : undefined,
      });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const idxA = a.aiGroupIndex ?? Number.MAX_SAFE_INTEGER;
    const idxB = b.aiGroupIndex ?? Number.MAX_SAFE_INTEGER;
    if (idxA !== idxB) return idxA - idxB;
    const idA = a.aiGroupId ?? "";
    const idB = b.aiGroupId ?? "";
    return idA.localeCompare(idB);
  });

  return candidates[0];
}

export function getAIDiffGroupForPath(editor: Editor, path: Path) {
  return getGroupForPath(editor, path);
}

export function isAIDiffGroupLeaderPath(
  editor: Editor,
  path: Path,
  group: AIDiffGroup,
): boolean {
  const elementPaths = getAllElementPaths(editor);
  for (const candidatePath of elementPaths) {
    if (!hasPendingAIDiffMarks(editor, candidatePath, group)) continue;
    return Path.equals(candidatePath, path);
  }
  return false;
}

export function acceptAIDiffGroup(editor: Editor, group: AIDiffGroup) {
  Editor.withoutNormalizing(editor, () => {
    removeMarkedContent(editor, "toRemove", [], group);
    cleanupEmptyListStructures(editor);
    clearDiffMark(editor, "toAdd", [], group);
    clearDiffMark(editor, "toRemove", [], group);
  });
}

export function rejectAIDiffGroup(editor: Editor, group: AIDiffGroup) {
  Editor.withoutNormalizing(editor, () => {
    removeMarkedContent(editor, "toAdd", [], group);
    cleanupEmptyListStructures(editor);
    clearDiffMark(editor, "toRemove", [], group);
    clearDiffMark(editor, "toAdd", [], group);
  });
}
