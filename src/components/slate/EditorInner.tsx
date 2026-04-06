import React, { useCallback } from "react";
import { Editor, Element, Range, Transforms, Node, Path, Text } from "slate";
import { Editable, useSlate } from "slate-react";
import { HistoryEditor } from "slate-history";
import { SlateEditorNode } from "./types";
import { renderElement, renderLeaf } from "./renderers";
import { toggleMark } from "./utils";
import { usePersistentSelection } from "./usePersistentSelection";
import { Toolbar } from "./Toolbar";
import { createDefaultImageLayoutV3 } from "./imageLayout";
import {
  insertImageNode,
  moveToNextTableCellOrAddRow,
  moveToPreviousTableCell,
} from "./tableUtils";
import { SlateDocumentEditableProvider } from "@/lib/slateDocumentEditableContext";

export const EditorInner = ({
  draftId,
  onSave,
  scrollClassName,
  readOnly = false,
}: {
  draftId?: string;
  onSave?: (value: SlateEditorNode[]) => void;
  scrollClassName?: string;
  readOnly?: boolean;
}) => {
  const editor = useSlate();
  const persistentSelection = usePersistentSelection();

  const decorate = useCallback(
    ([node, path]: [Node, Path]) => {
      const ranges: Range[] = [];
      if (!editor.selection && persistentSelection && Text.isText(node)) {
        try {
          const intersection = Range.intersection(persistentSelection, Editor.range(editor, path));
          if (intersection) {
            ranges.push({ ...intersection, highlight: true } as any);
          }
        } catch {
          // ignore stale path errors
        }
      }
      return ranges;
    },
    [editor, persistentSelection]
  );

  return (
    <SlateDocumentEditableProvider value={!readOnly}>
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {!readOnly && <Toolbar draftId={draftId} />}
        <div className={`flex-1 overflow-y-auto pb-16 sm:pb-24${scrollClassName ? ` ${scrollClassName}` : ""}`}>
          <div className="mx-auto min-h-[calc(100vh-12rem)] w-full max-w-[860px] py-9 px-8 sm:px-12 md:px-16">
            <Editable
            readOnly={readOnly}
            decorate={readOnly ? () => [] : decorate}
            className="vazlat-editable prose max-w-none outline-none dark:prose-invert prose-neutral selection:bg-primary/30 selection:text-foreground"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start drafting here..."
            onPaste={readOnly ? undefined : (event) => {
              const html = event.clipboardData.getData("text/html");
              if (!html || !html.includes("<img")) return;
              const doc = new DOMParser().parseFromString(html, "text/html");
              const image = doc.querySelector("img");
              const src = image?.getAttribute("src");
              if (!src) return;
              event.preventDefault();
              insertImageNode(editor, {
                src,
                alt: image?.getAttribute("alt") ?? "",
                caption: image?.getAttribute("alt") ?? "",
                layout: createDefaultImageLayoutV3(),
              });
            }}
            onKeyDown={
              readOnly
                ? undefined
                : (e) => {
              if (e.key === "Tab") {
                const handled = e.shiftKey
                  ? moveToPreviousTableCell(editor)
                  : moveToNextTableCellOrAddRow(editor);
                if (handled) {
                  e.preventDefault();
                  return;
                }
              }
              if (e.key === "Backspace" && editor.selection && Range.isCollapsed(editor.selection)) {
                const blockEntry = Editor.above(editor, {
                  at: editor.selection,
                  match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
                });
                if (blockEntry) {
                  const [, blockPath] = blockEntry;
                  const isAtStart = Editor.isStart(editor, editor.selection.anchor, blockPath);
                  if (isAtStart && blockPath.length === 1 && blockPath[0] > 0) {
                    const prevPath = [blockPath[0] - 1];
                    if (Editor.hasPath(editor, prevPath)) {
                      const prevNode = Editor.node(editor, prevPath)[0];
                      if (Element.isElement(prevNode) && prevNode.type === "image") {
                        e.preventDefault();
                        Transforms.select(editor, prevPath);
                        return;
                      }
                    }
                  }
                }
              }
              if (editor.selection && Range.isCollapsed(editor.selection) && e.key === "ArrowUp") {
                const blockEntry = Editor.above(editor, {
                  at: editor.selection,
                  match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
                });
                if (blockEntry) {
                  const [, blockPath] = blockEntry;
                  const isAtStart = Editor.isStart(editor, editor.selection.anchor, blockPath);
                  if (isAtStart && blockPath.length === 1 && blockPath[0] > 0) {
                    const prevPath = [blockPath[0] - 1];
                    const prevNode = Editor.node(editor, prevPath)[0];
                    if (Element.isElement(prevNode) && prevNode.type === "image") {
                      e.preventDefault();
                      Transforms.select(editor, prevPath);
                      return;
                    }
                  }
                }
              }
              if (e.key === "`" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                toggleMark(editor, "code");
                return;
              }
              const mod = e.ctrlKey || e.metaKey;
              if (!mod) return;
              if (e.key === "s") {
                e.preventDefault();
                if (onSave) {
                  onSave(editor.children as SlateEditorNode[]);
                }
                return;
              }
              if (e.metaKey && e.key === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                  HistoryEditor.redo(editor);
                } else {
                  HistoryEditor.undo(editor);
                }
                return;
              }
              if (e.key === "b") {
                e.preventDefault();
                toggleMark(editor, "bold");
              }
              if (e.key === "i") {
                e.preventDefault();
                toggleMark(editor, "italic");
              }
              if (e.key === "u") {
                e.preventDefault();
                toggleMark(editor, "underline");
              }
            }}
          />
          </div>
        </div>
      </div>
    </SlateDocumentEditableProvider>
  );
};
