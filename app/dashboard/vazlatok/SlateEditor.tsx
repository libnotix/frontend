"use client";

import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createEditor, Editor, Element, Node, Transforms } from "slate";
import { Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  GripVertical,
  MessageSquareText,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

import { normalizeSlateImageLayoutsInDocument } from "@/components/slate/imageLayout";
import { SlateEditorNode } from "@/components/slate/types";
import { ChatPanel } from "@/components/slate/ChatPanel";
import { EditorInner } from "@/components/slate/EditorInner";
import { Button } from "@/components/ui/button";
import { ensureEditorHasTopLevelNodeIds } from "@/components/slate/nodeIds";

interface SlateEditorProps {
  draftId?: string;
  revision?: string;
  initialValue?: SlateEditorNode[];
  onChange?: (value: SlateEditorNode[]) => void;
  onSave?: (value: SlateEditorNode[]) => void;
  /** When AI chat persists on the server, draft `updatedAt` is bumped; mirrors that in the parent. */
  onDraftServerTouch?: (updatedAtIso: string) => void;
  children?: ReactNode;
  isRailOpen: boolean;
  onRailOpenChange: (open: boolean) => void;
  /** When true, the chat panel is rendered externally (floating/docked); the built-in rail is suppressed. */
  externalChat?: boolean;
  /** Render prop called inside the Slate context so external wrappers can access the editor. */
  renderExternalChat?: () => ReactNode;
  /** Extra classes forwarded to the scrollable content area inside EditorInner. */
  scrollClassName?: string;
}

const SlateEditor = ({
  draftId,
  revision,
  initialValue,
  onChange,
  onSave,
  onDraftServerTouch,
  children,
  isRailOpen,
  onRailOpenChange,
  externalChat = false,
  renderExternalChat,
  scrollClassName,
}: SlateEditorProps) => {
  const [editor] = useState(() => {
    const base = withHistory(withReact(createEditor()));
    const editorWithRichBlocks = base as Editor & {
      isVoid: (element: Element) => boolean;
      isInline: (element: Element) => boolean;
      normalizeNode: (entry: [Node, number[]]) => void;
    };
    const { isVoid, isInline, normalizeNode } = editorWithRichBlocks;

    editorWithRichBlocks.isVoid = (element) =>
      Element.isElement(element) && element.type === "image" ? true : isVoid(element);
    editorWithRichBlocks.isInline = (element) => isInline(element);

    editorWithRichBlocks.normalizeNode = (entry) => {
      const [node, path] = entry;
      if (
        Element.isElement(node) &&
        (node.type === "paragraph" || node.type.startsWith("heading-")) &&
        Array.isArray((node as Record<string, unknown>).children)
      ) {
        const children = (node as Record<string, unknown>).children as unknown[];
        const imageChildIndex = children.findIndex(
          (child) => Element.isElement(child as any) && (child as any).type === "image",
        );
        if (imageChildIndex !== -1) {
          const imagePath = [...path, imageChildIndex];
          if (!Node.has(editorWithRichBlocks, imagePath)) return;
          const imageNode = Node.get(editorWithRichBlocks, imagePath);
          Transforms.removeNodes(editorWithRichBlocks, { at: imagePath });
          Transforms.insertNodes(editorWithRichBlocks, imageNode as any, { at: path });
          return;
        }
      }
      if (Element.isElement(node) && node.type === "table") {
        if (!Array.isArray(node.children) || node.children.length === 0) {
          Transforms.removeNodes(editorWithRichBlocks, { at: path });
          return;
        }
      }
      if (Element.isElement(node) && node.type === "table-row") {
        if (!Array.isArray(node.children) || node.children.length === 0) {
          Transforms.removeNodes(editorWithRichBlocks, { at: path });
          return;
        }
      }
      if (Element.isElement(node) && node.type === "table-cell") {
        if (!Array.isArray(node.children) || node.children.length === 0) {
          Transforms.insertNodes(
            editorWithRichBlocks,
            { type: "paragraph", children: [{ text: "" }] } as any,
            { at: [...path, 0] },
          );
          return;
        }
      }
      if (Element.isElement(node) && node.type === "paragraph") {
        if (!Array.isArray(node.children) || node.children.length === 0) {
          Transforms.insertNodes(editorWithRichBlocks, { text: "" } as any, {
            at: [...path, 0],
          });
          return;
        }
      }
      normalizeNode(entry);
    };
    return editorWithRichBlocks;
  });
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "files">("ai");
  const [railWidth, setRailWidth] = useState(360);
  const resizingRef = useRef(false);
  const minRailWidth = 280;
  const maxRailWidth = 520;
  const stopResizing = useCallback(() => {
    resizingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // Run before paint so missing Slate during mount does not flash dimmed placeholder.
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedRailWidth = window.localStorage.getItem("vazlat:rail-width");
    if (savedRailWidth) {
      const parsed = Number(savedRailWidth);
      if (!Number.isNaN(parsed)) {
        setRailWidth(Math.min(maxRailWidth, Math.max(minRailWidth, parsed)));
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("vazlat:rail-width", String(railWidth));
  }, [railWidth]);

  const updateRailWidth = useCallback(
    (next: number) => {
      setRailWidth(Math.min(maxRailWidth, Math.max(minRailWidth, next)));
    },
    [maxRailWidth, minRailWidth],
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizingRef.current) return;
      updateRailWidth(window.innerWidth - event.clientX - 24);
    };
    const handleMouseUp = () => stopResizing();
    const handleWindowBlur = () => stopResizing();
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        stopResizing();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopResizing();
    };
  }, [stopResizing, updateRailWidth]);

  const fallbackInitialValue: SlateEditorNode[] = [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ];

  if (!mounted) {
    return (
      <div
        className="min-h-[calc(100vh-12rem)] w-full rounded-xl bg-muted/10"
        aria-hidden
      />
    );
  }

  return (
    <Slate
      editor={editor}
      initialValue={
        initialValue && initialValue.length > 0
          ? normalizeSlateImageLayoutsInDocument(initialValue)
          : fallbackInitialValue
      }
      onChange={(value) => {
        ensureEditorHasTopLevelNodeIds(editor);
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type,
        );
        if (isAstChange && onChange) {
          onChange(value as SlateEditorNode[]);
        }
      }}
    >
      {externalChat ? (
        <div className="flex flex-col flex-1 min-h-0">
          <EditorInner draftId={draftId} onSave={onSave} scrollClassName={scrollClassName} />
          {renderExternalChat?.()}
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between px-1 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Utility panel
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRailOpenChange(!isRailOpen)}
              >
                {isRailOpen ? (
                  <>
                    <PanelRightClose className="size-4" />
                    Hide tools
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="size-4" />
                    Show tools
                  </>
                )}
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 gap-4 lg:gap-6">
              <EditorInner draftId={draftId} onSave={onSave} scrollClassName={scrollClassName} />

              {isRailOpen && (
                <div className="hidden self-start lg:sticky lg:top-[168px] lg:flex lg:max-h-[calc(100vh-7.5rem)]">
                  <div
                    role="slider"
                    aria-label="Resize utility panel"
                    aria-valuemin={minRailWidth}
                    aria-valuemax={maxRailWidth}
                    aria-valuenow={railWidth}
                    tabIndex={0}
                    onMouseDown={(event) => {
                      if (event.button !== 0) return;
                      event.preventDefault();
                      resizingRef.current = true;
                      document.body.style.cursor = "col-resize";
                      document.body.style.userSelect = "none";
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        updateRailWidth(railWidth + 16);
                      }
                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        updateRailWidth(railWidth - 16);
                      }
                    }}
                    className="group hidden w-2 cursor-col-resize items-center justify-center rounded-full bg-transparent transition hover:bg-muted lg:flex"
                  >
                    <GripVertical className="size-4 text-muted-foreground/70 group-hover:text-foreground" />
                  </div>

                  <aside
                    style={{ width: railWidth }}
                    className="flex h-[calc(100vh-168px-32px)] min-h-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
                        <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition bg-background text-foreground shadow-xs">
                          <MessageSquareText className="size-3.5" />
                          AI
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRailOpenChange(false)}
                        className="rounded-lg"
                        aria-label="Collapse utility panel"
                      >
                        <PanelRightClose className="size-4" />
                      </Button>
                    </div>

                    <div className="min-h-0 flex-1 p-3">
                      <ChatPanel
                        draftId={draftId}
                        revision={revision}
                        density={railWidth < 340 ? "compact" : "comfortable"}
                        onDraftServerTouch={onDraftServerTouch}
                      />
                    </div>
                  </aside>
                </div>
              )}
            </div>

            {isRailOpen && (
              <aside className="flex h-[42vh] min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card/70 shadow-sm backdrop-blur-sm lg:hidden">
                <div className="flex items-center gap-1 border-b border-border px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition bg-background text-foreground shadow-xs">
                    <MessageSquareText className="size-3.5" />
                    AI
                  </span>
                </div>
                <div className="min-h-0 flex-1 p-3">
                  <ChatPanel
                    draftId={draftId}
                    revision={revision}
                    density="compact"
                    onDraftServerTouch={onDraftServerTouch}
                  />
                </div>
              </aside>
            )}
          </div>
          {!isRailOpen && (
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRailOpenChange(true)}
              >
                <PanelRightOpen className="size-4 mr-2" />
                Eszközök mutatása
              </Button>
            </div>
          )}
        </>
      )}
    </Slate>
  );
};

export default memo(SlateEditor);
