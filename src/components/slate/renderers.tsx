import React from "react";
import { Editor, Element, Node, Path } from "slate";
import {
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
  useSlateStatic,
} from "slate-react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Check,
  Grip,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { FormattedText, ImageLayoutV3 } from "./types";
import { clampWidthPercent, normalizeImageLayoutToV3 } from "./imageLayout";
import {
  acceptAIDiffGroup,
  getAIDiffGroupForPath,
  hasPendingAIDiffMarks,
  isAIDiffGroupLeaderPath,
  rejectAIDiffGroup,
} from "./utils";
import {
  deleteTableColumnAt,
  deleteTableRowAt,
  insertTableColumnAt,
  insertTableRowAt,
  moveImageBlock,
  updateImageLayout,
} from "./tableUtils";
import { api } from "@/lib/api";

function ElementWithAIActions({
  attributes,
  children,
  element,
  className,
  as: Component,
}: RenderElementProps & {
  className: string;
  as: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "li" | "ul" | "ol";
}) {
  const editor = useSlateStatic();
  const path = React.useMemo(() => {
    try {
      return ReactEditor.findPath(editor, element);
    } catch {
      return null;
    }
  }, [editor, element]);

  const hasDiffMarks = path ? hasPendingAIDiffMarks(editor, path) : false;
  const diffGroup = path ? getAIDiffGroupForPath(editor, path) : null;
  const shouldShowActions = hasDiffMarks
    ? diffGroup
      ? path
        ? isAIDiffGroupLeaderPath(editor, path, diffGroup)
        : false
      : false
    : false;

  const content = (
    <Component
      {...attributes}
      className={`${className}${hasDiffMarks ? " group/ai-diff relative" : ""}`}
    >
      {shouldShowActions && (
        <span
          contentEditable={false}
          className="pointer-events-none absolute -top-7 right-0 z-20 opacity-0 transition-opacity group-hover/ai-diff:opacity-100 group-focus-within/ai-diff:opacity-100"
        >
          <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (!diffGroup) return;
                acceptAIDiffGroup(editor, diffGroup);
              }}
            >
              <Check className="size-3" />
              Accept
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (!diffGroup) return;
                rejectAIDiffGroup(editor, diffGroup);
              }}
            >
              <X className="size-3" />
              Reject
            </button>
          </span>
        </span>
      )}
      {children}
    </Component>
  );

  return content;
}

function ImageElementWithControls({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const editor = useSlateStatic();
  const imageElement = element as Record<string, unknown>;
  const [resolvedSrc, setResolvedSrc] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewWidthPercent, setPreviewWidthPercent] = React.useState<number | null>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<{
    edge: "left" | "right";
    startX: number;
    startWidth: number;
    imagePath: Path;
    containerWidth: number;
  } | null>(null);

  const imagePath = React.useMemo(() => {
    try {
      return ReactEditor.findPath(editor, element);
    } catch {
      return null;
    }
  }, [editor, element]);

  const assetId =
    typeof imageElement.assetId === "number"
      ? imageElement.assetId
      : typeof imageElement.assetId === "string" && imageElement.assetId.length > 0
        ? Number(imageElement.assetId)
        : null;

  const rawSrc =
    typeof imageElement.src === "string" && imageElement.src.length > 0
      ? imageElement.src
      : "";

  React.useEffect(() => {
    let revoked: string | null = null;
    const resolve = async () => {
      if (!rawSrc.startsWith("asset://")) {
        setResolvedSrc(rawSrc);
        setLoading(false);
        setError(null);
        return;
      }
      if (!assetId || Number.isNaN(assetId)) {
        setResolvedSrc(null);
        setError("Missing image asset ID");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.filesDownloadIdGetRaw({ id: assetId });
        const blob = await response.raw.blob();
        const objectUrl = URL.createObjectURL(blob);
        revoked = objectUrl;
        setResolvedSrc(objectUrl);
      } catch (err) {
        setError("Failed to load image");
        setResolvedSrc(null);
      } finally {
        setLoading(false);
      }
    };
    resolve();
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [assetId, rawSrc]);

  const layout = React.useMemo<ImageLayoutV3>(() => {
    return normalizeImageLayoutToV3(imageElement.layout);
  }, [imageElement.layout]);
  const widthPercent = previewWidthPercent ?? layout.widthPercent;
  const alt = typeof imageElement.alt === "string" ? imageElement.alt : "Image";
  const caption = typeof imageElement.caption === "string" ? imageElement.caption : "";

  /**
   * Put width on the floated box itself so the float’s margin box matches the image —
   * text wraps around this width, not an inner wrapper with a wider anonymous float.
   */
  const floatOuterStyle: React.CSSProperties =
    layout.float === "none"
      ? {
          clear: "both",
          display: "block",
          width: "100%",
          maxWidth: "100%",
          marginTop: "0.75rem",
          marginBottom: "0.75rem",
        }
      : {
          float: layout.float,
          display: "block",
          boxSizing: "border-box",
          width: `${widthPercent}%`,
          maxWidth: "100%",
          minWidth: 0,
          marginBottom: "0.5rem",
          ...(layout.float === "left"
            ? { marginRight: "12px" }
            : { marginLeft: "12px" }),
        };

  const innerBoxStyle: React.CSSProperties =
    layout.float === "none"
      ? {
          width: `${widthPercent}%`,
          maxWidth: "100%",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }
      : {
          width: "100%",
          display: "block",
          minWidth: 0,
        };

  React.useEffect(() => {
    if (!isResizing) return;

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;
      const delta = event.clientX - drag.startX;
      const deltaPercent = (delta / Math.max(1, drag.containerWidth)) * 100;
      const next =
        drag.edge === "right"
          ? drag.startWidth + deltaPercent
          : drag.startWidth - deltaPercent;
      setPreviewWidthPercent(clampWidthPercent(next));
    };

    const endResize = () => {
      const drag = dragStateRef.current;
      if (drag) {
        const finalWidthPercent = clampWidthPercent(previewWidthPercent ?? drag.startWidth);
        updateImageLayout(editor, drag.imagePath, {
          widthPercent: finalWidthPercent,
        });
      }
      dragStateRef.current = null;
      setIsResizing(false);
      setPreviewWidthPercent(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endResize);
    window.addEventListener("pointercancel", endResize);
    window.addEventListener("blur", endResize);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endResize);
      window.removeEventListener("pointercancel", endResize);
      window.removeEventListener("blur", endResize);
    };
  }, [editor, isResizing, previewWidthPercent]);

  const startResize = (edge: "left" | "right", event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!imagePath) return;
    const containerWidth = frameRef.current?.getBoundingClientRect().width ?? 1;
    dragStateRef.current = {
      edge,
      startX: event.clientX,
      startWidth: widthPercent,
      imagePath: [...imagePath],
      containerWidth,
    };
    setPreviewWidthPercent(widthPercent);
    setIsResizing(true);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  const { ref: slateRootRef, ...imageRootAttributes } = attributes as typeof attributes & {
    ref: React.Ref<HTMLDivElement>;
  };

  return (
    <div
      {...imageRootAttributes}
      contentEditable={false}
      ref={(node) => {
        if (typeof slateRootRef === "function") {
          slateRootRef(node);
        } else if (slateRootRef) {
          (slateRootRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
        frameRef.current = node;
      }}
      className="not-prose relative z-10 max-w-full overflow-visible"
    >
      <div className="group/image relative isolate align-top" style={floatOuterStyle}>
        <div className="relative z-10" style={innerBoxStyle}>
          {loading ? (
            <span className="inline-flex h-40 w-full items-center justify-center rounded-md bg-muted/30">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </span>
          ) : resolvedSrc ? (
            <img
              src={resolvedSrc}
              alt={alt}
              style={{
                width: "100%",
                maxWidth: "100%",
                height: layout.heightPx !== undefined ? layout.heightPx : "auto",
              }}
              className={`rounded-md border border-border/70 bg-background ${layout.heightPx === undefined ? "h-auto" : ""}`}
              draggable={false}
            />
          ) : (
            <span className="inline-flex h-24 w-full items-center justify-center rounded-md bg-destructive/10 text-xs text-destructive">
              {error ?? "Image unavailable"}
            </span>
          )}
          <button
            type="button"
            className="absolute left-0 top-0 z-30 h-full w-4 min-w-[16px] -translate-x-1/2 cursor-ew-resize rounded-sm border-0 bg-transparent hover:bg-primary/25 touch-none"
            onPointerDown={(event) => startResize("left", event)}
            onMouseDown={(event) => event.preventDefault()}
            title="Resize image width"
            aria-label="Resize image from left edge"
          />
          <button
            type="button"
            className="absolute right-0 top-0 z-30 h-full w-4 min-w-[16px] translate-x-1/2 cursor-ew-resize rounded-sm border-0 bg-transparent hover:bg-primary/25 touch-none"
            onPointerDown={(event) => startResize("right", event)}
            onMouseDown={(event) => event.preventDefault()}
            title="Resize image width"
            aria-label="Resize image from right edge"
          />
          <span className="pointer-events-none absolute -top-10 right-0 z-30 opacity-0 transition-opacity group-hover/image:opacity-100 group-focus-within/image:opacity-100">
            <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm">
              <span className="px-1 text-[10px] text-muted-foreground">{widthPercent}%</span>
              <button
                type="button"
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] ${
                  layout.float === "left" ? "bg-muted" : "hover:bg-muted/70"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (!imagePath) return;
                  updateImageLayout(editor, imagePath, { float: "left" });
                }}
                title="Float left"
              >
                <AlignLeft className="size-3" />
              </button>
              <button
                type="button"
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] ${
                  layout.float === "right" ? "bg-muted" : "hover:bg-muted/70"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (!imagePath) return;
                  updateImageLayout(editor, imagePath, { float: "right" });
                }}
                title="Float right"
              >
                <AlignRight className="size-3" />
              </button>
              <button
                type="button"
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] ${
                  layout.float === "none" ? "bg-muted" : "hover:bg-muted/70"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (!imagePath) return;
                  updateImageLayout(editor, imagePath, { float: "none" });
                }}
                title="Block (no float)"
              >
                <AlignCenter className="size-3" />
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] hover:bg-muted/70"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  try {
                    const path = ReactEditor.findPath(editor, element);
                    moveImageBlock(editor, path, "up");
                  } catch {
                    /* stale element */
                  }
                }}
                title="Swap with block above"
              >
                <ArrowUp className="size-3" />
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] hover:bg-muted/70"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  try {
                    const path = ReactEditor.findPath(editor, element);
                    moveImageBlock(editor, path, "down");
                  } catch {
                    /* stale element */
                  }
                }}
                title="Swap with block below"
              >
                <ArrowDown className="size-3" />
              </button>
            </span>
          </span>
          {caption ? <span className="mt-1 block text-xs text-muted-foreground">{caption}</span> : null}
        </div>
      </div>
      {isResizing && (
        <span className="pointer-events-none absolute left-1 top-1 z-40 rounded bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground shadow">
          <Grip className="mr-1 inline size-3" />
          Resizing
        </span>
      )}
      {children}
    </div>
  );
}

const tableEdgeBtn =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/70 hover:text-foreground";

function TableCell({ attributes, children }: RenderElementProps) {
  return (
    <td
      {...attributes}
      className="min-h-[var(--vazlat-table-lead)] min-w-0 border-b border-r border-border px-2 py-0 align-top leading-[var(--vazlat-table-lead)] break-words first:border-l [&>p]:min-h-[var(--vazlat-table-lead)] [&>p]:leading-[var(--vazlat-table-lead)]"
    >
      {children}
    </td>
  );
}

function TableElementWithEdgeControls({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const editor = useSlate();
  const tablePath = React.useMemo(() => {
    try {
      return ReactEditor.findPath(editor, element);
    } catch {
      return null;
    }
  }, [editor, element]);

  const anchorCellPath = React.useMemo((): Path | null => {
    if (!tablePath || !Node.has(editor, tablePath)) return null;
    const firstCell = [...tablePath, 0, 0] as Path;
    if (!Node.has(editor, firstCell)) return null;
    if (!editor.selection) return firstCell;
    const at = Editor.unhangRange(editor, editor.selection);
    const cellEntry = Editor.above(editor, {
      at,
      match: (n) => Element.isElement(n) && n.type === "table-cell",
    });
    if (!cellEntry) return firstCell;
    const [, cellPath] = cellEntry;
    return Path.isAncestor(tablePath, cellPath) ? cellPath : firstCell;
  }, [editor, editor.selection, tablePath]);

  let rowCount = 0;
  let colCount = 0;
  if (tablePath && Node.has(editor, tablePath)) {
    const table = Node.get(editor, tablePath);
    if (Element.isElement(table) && table.type === "table") {
      rowCount = table.children.length;
      const firstRow = table.children[0];
      if (Element.isElement(firstRow) && firstRow.type === "table-row") {
        colCount = firstRow.children.length;
      }
    }
  }

  const canDeleteRow = rowCount > 1;
  const canDeleteCol = colCount > 1;

  const run = (fn: () => void) => {
    if (!anchorCellPath) return;
    fn();
  };

  return (
    <div
      {...attributes}
      className="group/table relative max-w-full min-w-0 clear-both"
    >
      <div
        contentEditable={false}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity group-hover/table:opacity-100 group-focus-within/table:opacity-100"
      >
        {anchorCellPath ? (
          <>
            <div className="pointer-events-auto absolute left-1 top-1">
              <button
                type="button"
                className={`${tableEdgeBtn} text-destructive hover:bg-destructive/10 hover:text-destructive`}
                disabled={!canDeleteRow}
                title="Delete this row"
                aria-label="Delete this row"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  run(() => {
                    if (!canDeleteRow || !anchorCellPath) return;
                    deleteTableRowAt(editor, anchorCellPath);
                  })
                }
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="pointer-events-auto absolute right-1 top-1">
              <button
                type="button"
                className={`${tableEdgeBtn} text-destructive hover:bg-destructive/10 hover:text-destructive`}
                disabled={!canDeleteCol}
                title="Delete this column"
                aria-label="Delete this column"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  run(() => {
                    if (!canDeleteCol || !anchorCellPath) return;
                    deleteTableColumnAt(editor, anchorCellPath);
                  })
                }
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="pointer-events-auto absolute left-1/2 top-1 -translate-x-1/2">
              <button
                type="button"
                className={tableEdgeBtn}
                title="Insert row above"
                aria-label="Insert row above"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  run(() => {
                    if (!anchorCellPath) return;
                    insertTableRowAt(editor, anchorCellPath, "above");
                  })
                }
              >
                <ArrowUp className="size-3.5" />
              </button>
            </div>
            <div className="pointer-events-auto absolute bottom-1 left-1/2 -translate-x-1/2">
              <button
                type="button"
                className={tableEdgeBtn}
                title="Insert row below"
                aria-label="Insert row below"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  run(() => {
                    if (!anchorCellPath) return;
                    insertTableRowAt(editor, anchorCellPath, "below");
                  })
                }
              >
                <ArrowDown className="size-3.5" />
              </button>
            </div>
            <div className="pointer-events-auto absolute left-1 top-1/2 -translate-y-1/2">
              <button
                type="button"
                className={tableEdgeBtn}
                title="Insert column to the left"
                aria-label="Insert column to the left"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  run(() => {
                    if (!anchorCellPath) return;
                    insertTableColumnAt(editor, anchorCellPath, "left");
                  })
                }
              >
                <AlignLeft className="size-3.5" />
              </button>
            </div>
            <div className="pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2">
              <button
                type="button"
                className={tableEdgeBtn}
                title="Insert column to the right"
                aria-label="Insert column to the right"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  run(() => {
                    if (!anchorCellPath) return;
                    insertTableColumnAt(editor, anchorCellPath, "right");
                  })
                }
              >
                <AlignRight className="size-3.5" />
              </button>
            </div>
          </>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-(--radius-md) mt-px bg-foreground/25 shadow-md dark:shadow-lg">
        <table className="w-full table-fixed border-separate border-spacing-0 border-0 text-sm">
          <tbody
            className={
              "[&>tr:first-child>td]:border-t [&>tr:first-child>td]:border-border " +
              "[&>tr:first-child>td:first-child]:rounded-tl-md [&>tr:first-child>td:first-child]:overflow-hidden " +
              "[&>tr:first-child>td:last-child]:rounded-tr-md [&>tr:first-child>td:last-child]:overflow-hidden " +
              "[&>tr:last-child>td:first-child]:rounded-bl-md [&>tr:last-child>td:first-child]:overflow-hidden " +
              "[&>tr:last-child>td:last-child]:rounded-br-md [&>tr:last-child>td:last-child]:overflow-hidden"
            }
          >
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function renderElement({
  attributes,
  children,
  element,
}: RenderElementProps) {
  switch (element.type) {
    case "paragraph":
      return (
        <ElementWithAIActions
          as="p"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 text-base text-foreground leading-[var(--vazlat-line-height)] min-h-[var(--vazlat-line-height)]"
        />
      );
    case "heading-one":
      return (
        <ElementWithAIActions
          as="h1"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 mt-9 mb-2 first:mt-0 text-5xl font-black tracking-[-0.035em] text-foreground leading-[1.1]"
        />
      );
    case "heading-two":
      return (
        <ElementWithAIActions
          as="h2"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 mt-8 mb-1.5 first:mt-0 text-4xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.12]"
        />
      );
    case "heading-three":
      return (
        <ElementWithAIActions
          as="h3"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 mt-7 mb-1.5 first:mt-0 text-3xl font-bold tracking-[-0.025em] text-foreground leading-[1.15]"
        />
      );
    case "heading-four":
      return (
        <ElementWithAIActions
          as="h4"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 mt-6 mb-1 first:mt-0 text-2xl font-bold tracking-tight text-foreground leading-[1.2]"
        />
      );
    case "heading-five":
      return (
        <ElementWithAIActions
          as="h5"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 mt-5 mb-1 first:mt-0 text-xl font-semibold tracking-tight text-foreground leading-snug"
        />
      );
    case "heading-six":
      return (
        <ElementWithAIActions
          as="h6"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 mt-4 mb-0.5 first:mt-0 text-lg font-semibold uppercase tracking-[0.04em] text-foreground/90 leading-snug"
        />
      );
    case "list-item":
      return (
        <ElementWithAIActions
          as="li"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 text-base text-foreground leading-[var(--vazlat-line-height)] min-h-[var(--vazlat-line-height)]"
        />
      );
    case "unordered-list":
      return (
        <ElementWithAIActions
          as="ul"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 pl-6 list-disc clear-both"
        />
      );
    case "ordered-list":
      return (
        <ElementWithAIActions
          as="ol"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 pl-6 list-decimal clear-both"
        />
      );
    case "table":
      return (
        <TableElementWithEdgeControls
          attributes={attributes}
          children={children}
          element={element}
        />
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return (
        <TableCell attributes={attributes} children={children} element={element} />
      );
    case "image":
      return (
        <ImageElementWithControls
          attributes={attributes}
          children={children}
          element={element}
        />
      );
    default:
      return (
        <ElementWithAIActions
          as="p"
          attributes={attributes}
          element={element}
          children={children}
          className="m-0 text-base text-foreground leading-[var(--vazlat-line-height)] min-h-[var(--vazlat-line-height)]"
        />
      );
  }
}

export function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  const textLeaf = leaf as FormattedText & { highlight?: boolean };
  let el = <>{children}</>;
  if (textLeaf.bold) el = <strong>{el}</strong>;
  if (textLeaf.italic) el = <em>{el}</em>;
  if (textLeaf.underline) el = <u>{el}</u>;
  if (textLeaf.strikethrough || textLeaf.toRemove) el = <s>{el}</s>;

  if (textLeaf.toRemove) {
    el = (
      <span className="bg-red-200/70 dark:bg-red-500/35 rounded-sm">{el}</span>
    );
  } else if (textLeaf.toAdd) {
    el = (
      <span className="bg-emerald-200/70 dark:bg-emerald-500/30 rounded-sm">
        {el}
      </span>
    );
  } else if (textLeaf.highlight) {
    el = (
      <span className="bg-primary/20 dark:bg-primary/30 rounded-sm">{el}</span>
    );
  }

  return <span {...attributes}>{el}</span>;
}
