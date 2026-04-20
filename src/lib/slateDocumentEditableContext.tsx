"use client";

import { createContext, useContext } from "react";

/**
 * When false, structural editing UI (image resize/float, table row/col tools, AI accept/reject)
 * is hidden and non-functional. Set via EditorInner from read-only / public share views.
 */
const SlateDocumentEditableContext = createContext(true);

export function SlateDocumentEditableProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <SlateDocumentEditableContext.Provider value={value}>
      {children}
    </SlateDocumentEditableContext.Provider>
  );
}

export function useSlateDocumentEditable(): boolean {
  return useContext(SlateDocumentEditableContext);
}
