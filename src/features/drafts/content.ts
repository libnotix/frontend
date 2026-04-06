import { DraftLinkedFile } from "@/api/models/DraftLinkedFile";
import { ensureTopLevelNodeIds } from "@/components/slate/nodeIds";
import { SlateEditorNode } from "@/components/slate/types";
import { DraftContentEnvelope, DraftEditorModel } from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isImageNode(node: unknown): node is Record<string, unknown> {
  return (
    !!node &&
    typeof node === "object" &&
    (node as Record<string, unknown>).type === "image"
  );
}

function migrateInlineImagesToTopLevel(nodes: SlateEditorNode[]): SlateEditorNode[] {
  const migrated: SlateEditorNode[] = [];
  for (const node of nodes) {
    if (
      node.type !== "paragraph" &&
      node.type !== "heading-one" &&
      node.type !== "heading-two" &&
      node.type !== "heading-three" &&
      node.type !== "heading-four" &&
      node.type !== "heading-five" &&
      node.type !== "heading-six"
    ) {
      migrated.push(node);
      continue;
    }

    const children = Array.isArray(node.children) ? [...node.children] : [];
    const firstImageIndex = children.findIndex((child) => isImageNode(child));
    if (firstImageIndex === -1) {
      migrated.push(node);
      continue;
    }

    const before = children.slice(0, firstImageIndex).filter((child) => !isImageNode(child));
    const image = children[firstImageIndex] as unknown as SlateEditorNode;
    const after = children.slice(firstImageIndex + 1).filter((child) => !isImageNode(child));

    if (before.length > 0) {
      migrated.push({
        ...node,
        children: before as typeof node.children,
      });
    }

    migrated.push(image);

    if (after.length > 0) {
      migrated.push({
        ...node,
        children: after as typeof node.children,
      });
    }
  }
  return migrated;
}

export function normalizeSlateContent(input: unknown): SlateEditorNode[] {
  if (Array.isArray(input)) {
    return ensureTopLevelNodeIds(migrateInlineImagesToTopLevel(input as SlateEditorNode[]));
  }

  const record = asRecord(input);
  if (record && Array.isArray(record.children)) {
    return ensureTopLevelNodeIds(
      migrateInlineImagesToTopLevel([input as SlateEditorNode]),
    );
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return normalizeSlateContent(parsed);
    } catch {
      return ensureTopLevelNodeIds(
        input.split("\n").map((line) => ({
          type: "paragraph",
          children: [{ text: line }],
        })) as SlateEditorNode[],
      );
    }
  }

  return ensureTopLevelNodeIds([
    { type: "paragraph", children: [{ text: "" }] } as SlateEditorNode,
  ]);
}

export function extractCurrentPageContent(rawContent: unknown): {
  content: SlateEditorNode[];
  container?: DraftContentEnvelope;
} {
  const envelope = asRecord(rawContent) as DraftContentEnvelope | null;
  if (envelope && Array.isArray(envelope.pages)) {
    const activePage =
      envelope.pages.find(
        (page) =>
          typeof page?.id === "string" && page.id === envelope.activePageId,
      ) ?? envelope.pages[0];

    return {
      content: normalizeSlateContent(activePage?.content),
      container: envelope,
    };
  }

  if (envelope && envelope.content !== undefined) {
    return {
      content: normalizeSlateContent(envelope.content),
      container: envelope,
    };
  }

  return {
    content: normalizeSlateContent(rawContent),
  };
}

export function mergeCurrentPageContent(
  container: DraftContentEnvelope | undefined,
  nextContent: SlateEditorNode[],
): unknown {
  if (!container) return nextContent;

  if (Array.isArray(container.pages)) {
    const activePageId = container.activePageId;
    const activeIndex = container.pages.findIndex(
      (page) => page?.id && page.id === activePageId,
    );
    const pageIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextPages = container.pages.map((page, index) =>
      index === pageIndex ? { ...page, content: nextContent } : page,
    );

    return {
      ...container,
      pages: nextPages,
    };
  }

  if (container.content !== undefined) {
    return {
      ...container,
      content: nextContent,
    };
  }

  return nextContent;
}

export function normalizeDraftUpdatedAtToIso(value: unknown): string | undefined {
  if (value == null) return undefined;

  if (typeof value === "string" && value.length > 0) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  return undefined;
}

export function normalizeDraftApiResponse(payload: unknown): DraftEditorModel {
  const root = asRecord(payload);
  const draftCandidate = asRecord(root?.draft) ?? asRecord(payload) ?? {};
  const parsed = extractCurrentPageContent(draftCandidate.content);

  const filesCandidate = root?.files ?? draftCandidate.files;
  const files = Array.isArray(filesCandidate)
    ? (filesCandidate as DraftLinkedFile[])
    : [];

  const shareRaw =
    draftCandidate.shareToken ??
    (typeof draftCandidate.share_token === "string" || draftCandidate.share_token === null
      ? draftCandidate.share_token
      : undefined);
  const shareToken =
    typeof shareRaw === "string"
      ? shareRaw
      : shareRaw === null
        ? null
        : undefined;

  return {
    id: typeof draftCandidate.id === "number" ? draftCandidate.id : undefined,
    title: typeof draftCandidate.title === "string" ? draftCandidate.title : "",
    format:
      typeof draftCandidate.format === "string" ? draftCandidate.format : undefined,
    content: parsed.content,
    contentContainer: parsed.container,
    files,
    updatedAt: normalizeDraftUpdatedAtToIso(draftCandidate.updatedAt),
    shareToken,
  };
}

