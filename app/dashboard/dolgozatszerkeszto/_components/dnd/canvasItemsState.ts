import type { CanvasItem } from "../types";

/** Keeps first occurrence; stabilizes keys and 1…n badges when state ever contains duplicate ids. */
export function dedupeCanvasItemsById(items: CanvasItem[]): CanvasItem[] {
   const seen = new Set<string>();
   const out: CanvasItem[] = [];
   for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
   }
   return out;
}

/**
 * Applies sortable registry order to canvas items. Skips unknown / duplicate ids in `orderedIds`;
 * appends items missing from the registry at the end (stable).
 */
export function mergeCanvasOrder(prev: CanvasItem[], orderedIds: string[]): CanvasItem[] {
   const prevClean = dedupeCanvasItemsById(prev);
   const map = new Map(prevClean.map((i) => [i.id, i]));
   const seen = new Set<string>();
   const next: CanvasItem[] = [];

   for (const id of orderedIds) {
      if (seen.has(id)) continue;
      const item = map.get(id);
      if (!item) continue;
      seen.add(id);
      next.push(item);
   }
   for (const item of prevClean) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      next.push(item);
   }
   return next;
}

export function newCanvasItemId(typeId: string): string {
   const suffix =
      typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto
         ? globalThis.crypto.randomUUID()
         : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
   return `canvas-${typeId}-${suffix}`;
}
