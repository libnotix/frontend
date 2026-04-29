"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { DiffLeaf, FieldDiffMap } from "./diffEngine";

export type ExamCardDiffLookup = {
   diffMap: FieldDiffMap | null;
   getDiffAt: (path: string) => DiffLeaf | null;
   /** `options.__added.<optionId>` keys from {@link getDiffAt} prefixes. */
   getAddedStableIdsUnder: (basePath: string) => string[];
   getRemovedIndicesUnder: (basePath: string) => number[];
};

const ExamCardDiffContext = createContext<ExamCardDiffLookup | null>(null);

function escapeRegex(s: string): string {
   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function ExamCardDiffProvider({
   diffMap,
   children,
}: {
   diffMap: Record<string, DiffLeaf> | null | undefined;
   children: ReactNode;
}) {
   const map = diffMap ?? null;

   const getDiffAt = useCallback(
      (path: string): DiffLeaf | null => {
         if (!map) return null;
         if (path in map) return map[path]!;
         return null;
      },
      [map],
   );

   const getAddedStableIdsUnder = useCallback(
      (basePath: string) => {
         if (!map) return [];
         const prefix = basePath.endsWith(".") ? basePath : `${basePath}.`;
         const re = new RegExp(
            `^${escapeRegex(prefix)}__added\\.([^.]+)\\.`,
         );
         const ids = new Set<string>();
         for (const key of Object.keys(map)) {
            const m = key.match(re);
            if (m?.[1]) ids.add(m[1]);
         }
         return [...ids];
      },
      [map],
   );

   const getRemovedIndicesUnder = useCallback(
      (basePath: string) => {
         if (!map) return [];
         const prefix = basePath.endsWith(".") ? basePath : `${basePath}.`;
         const re = new RegExp(
            `^${escapeRegex(prefix)}__removed\\.(\\d+)\\.`,
         );
         const idxs: number[] = [];
         for (const key of Object.keys(map)) {
            const m = key.match(re);
            if (m?.[1]) idxs.push(Number.parseInt(m[1]!, 10));
         }
         return [...new Set(idxs)].sort((a, b) => a - b);
      },
      [map],
   );

   const value = useMemo(
      (): ExamCardDiffLookup => ({
         diffMap: map,
         getDiffAt,
         getAddedStableIdsUnder,
         getRemovedIndicesUnder,
      }),
      [getAddedStableIdsUnder, getDiffAt, getRemovedIndicesUnder, map],
   );

   return (
      <ExamCardDiffContext.Provider value={value}>{children}</ExamCardDiffContext.Provider>
   );
}

export function useExamCardDiff(): ExamCardDiffLookup | null {
   return useContext(ExamCardDiffContext);
}
