import { Element, Node, Text } from "slate";
import type { ImageLayoutV2, ImageLayoutV3, ImageNode, SlateEditorNode } from "./types";

export const IMAGE_WIDTH_PERCENT_MIN = 10;
export const IMAGE_WIDTH_PERCENT_MAX = 100;

export function clampWidthPercent(value: number): number {
  return Math.max(
    IMAGE_WIDTH_PERCENT_MIN,
    Math.min(IMAGE_WIDTH_PERCENT_MAX, Math.round(value * 10) / 10),
  );
}

export function createDefaultImageLayoutV3(): ImageLayoutV3 {
  return {
    version: 3,
    float: "right",
    widthPercent: 45,
  };
}

export function isImageLayoutV3(layout: ImageLayoutV2 | ImageLayoutV3): layout is ImageLayoutV3 {
  return layout.version === 3;
}

function imageLayoutV2ToV3(layout: ImageLayoutV2): ImageLayoutV3 {
  const mode = layout.wrap?.mode ?? "square";
  const side = layout.wrap?.side ?? "right";
  let float: ImageLayoutV3["float"] = "right";
  if (
    mode === "topBottom" ||
    mode === "inline" ||
    mode === "behindText" ||
    mode === "inFrontOfText"
  ) {
    float = "none";
  } else if (side === "left") float = "left";
  else if (side === "right") float = "right";
  else float = "none";

  const widthPercent = clampWidthPercent(
    typeof layout.size?.widthPercent === "number" && layout.size.widthPercent > 0
      ? layout.size.widthPercent
      : 45,
  );

  let heightPx: number | undefined;
  if (
    layout.size?.heightAuto === false &&
    typeof layout.size?.height === "number" &&
    layout.size.height > 0
  ) {
    heightPx = layout.size.height;
  }

  return {
    version: 3,
    float,
    widthPercent,
    ...(heightPx !== undefined ? { heightPx } : {}),
  };
}

/** Accepts v2, v3, or malformed legacy layout and returns a valid v3 layout. */
export function normalizeImageLayoutToV3(
  layout: ImageLayoutV2 | ImageLayoutV3 | unknown,
): ImageLayoutV3 {
  if (layout && typeof layout === "object") {
    const rec = layout as Record<string, unknown>;
    if (rec.version === 3) {
      const l = layout as Partial<ImageLayoutV3>;
      const float =
        l.float === "left" || l.float === "right" || l.float === "none" ? l.float : "right";
      const widthPercent = clampWidthPercent(
        typeof l.widthPercent === "number" && l.widthPercent > 0 ? l.widthPercent : 45,
      );
      const heightPx =
        typeof l.heightPx === "number" && l.heightPx > 0 ? l.heightPx : undefined;
      return {
        version: 3,
        float,
        widthPercent,
        ...(heightPx !== undefined ? { heightPx } : {}),
      };
    }
    // AI often sends { float, widthPercent } without version — treat as v3 partials.
    if (
      !("wrap" in rec && "size" in rec) &&
      (rec.float === "left" ||
        rec.float === "right" ||
        rec.float === "none" ||
        (typeof rec.widthPercent === "number" && rec.widthPercent > 0) ||
        (typeof rec.heightPx === "number" && rec.heightPx > 0))
    ) {
      const defaults = createDefaultImageLayoutV3();
      const float =
        rec.float === "left" || rec.float === "right" || rec.float === "none"
          ? rec.float
          : defaults.float;
      const widthPercent =
        typeof rec.widthPercent === "number" && rec.widthPercent > 0
          ? clampWidthPercent(rec.widthPercent)
          : defaults.widthPercent;
      const heightPx =
        typeof rec.heightPx === "number" && rec.heightPx > 0 ? rec.heightPx : undefined;
      return {
        version: 3,
        float,
        widthPercent,
        ...(heightPx !== undefined ? { heightPx } : {}),
      };
    }
    if (rec.version === 2 && "wrap" in rec && "size" in rec) {
      return imageLayoutV2ToV3(layout as ImageLayoutV2);
    }
    if ("wrap" in rec && "size" in rec) {
      return imageLayoutV2ToV3(layout as ImageLayoutV2);
    }
  }
  return createDefaultImageLayoutV3();
}

/**
 * Overlay AI / incoming layout onto the current image layout (patch semantics).
 * Full v2 objects replace layout via migration; partial v3 / duck-typed keys merge.
 */
export function mergeImageLayoutFromAI(
  existing: ImageLayoutV2 | ImageLayoutV3 | unknown,
  incoming: ImageLayoutV2 | ImageLayoutV3 | unknown,
): ImageLayoutV3 {
  const base = normalizeImageLayoutToV3(existing);
  if (!incoming || typeof incoming !== "object") return base;
  const inc = incoming as Record<string, unknown>;

  if (inc.version === 2 && "wrap" in inc && "size" in inc) {
    return normalizeImageLayoutToV3(incoming as ImageLayoutV2);
  }
  if (!inc.version && "wrap" in inc && "size" in inc) {
    return normalizeImageLayoutToV3(incoming as ImageLayoutV2);
  }

  const float =
    inc.float === "left" || inc.float === "right" || inc.float === "none"
      ? inc.float
      : base.float;
  const widthPercent =
    typeof inc.widthPercent === "number" && inc.widthPercent > 0
      ? clampWidthPercent(inc.widthPercent)
      : base.widthPercent;

  let heightPx: number | undefined;
  if ("heightPx" in inc) {
    heightPx =
      typeof inc.heightPx === "number" && inc.heightPx > 0 ? inc.heightPx : undefined;
  } else {
    heightPx = base.heightPx;
  }

  return {
    version: 3,
    float,
    widthPercent,
    ...(heightPx !== undefined ? { heightPx } : {}),
  };
}

/** Ensure every image node in inserted Slate trees has a valid v3 layout. */
export function normalizeImageLayoutsInNodes(nodes: Node[]): Node[] {
  return nodes.map((n) => normalizeImageLayoutInNodeDeep(n));
}

function normalizeImageLayoutInNodeDeep(node: Node): Node {
  if (Text.isText(node)) return node;
  if (!Element.isElement(node)) return node;
  const e = node as Record<string, unknown>;
  if (e.type === "image") {
    return {
      ...(e as object),
      layout: normalizeImageLayoutToV3(e.layout),
    } as Node;
  }
  if (Array.isArray(e.children)) {
    return {
      ...e,
      children: e.children.map((c) => normalizeImageLayoutInNodeDeep(c as Node)),
    } as Node;
  }
  return node;
}

/** One-time migration: upgrade image nodes in the document tree to layout v3. */
export function normalizeSlateImageLayoutsInDocument(nodes: SlateEditorNode[]): SlateEditorNode[] {
  return nodes.map((node) => normalizeNodeImageLayout(node)) as SlateEditorNode[];
}

function normalizeNodeImageLayout(node: SlateEditorNode): SlateEditorNode {
  if (node.type === "image") {
    const img = node as ImageNode;
    return {
      ...img,
      layout: normalizeImageLayoutToV3(img.layout),
    };
  }
  if ("children" in node && Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children.map((child) => {
        if (child && typeof child === "object" && "type" in child) {
          return normalizeNodeImageLayout(child as SlateEditorNode);
        }
        return child;
      }),
    } as SlateEditorNode;
  }
  return node;
}
