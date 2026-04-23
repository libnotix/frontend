"use client";

import { useNavbarStore } from "@/store/navbarStore";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMedia } from "react-use";

export function DynamicIsland({ children }: { children: ReactNode }) {
  const desktopContainer = useNavbarStore((state) => state.desktopContainer);
  const mobileContainer = useNavbarStore((state) => state.mobileContainer);

  // Use a media query hook to decide where to portal the children
  // (We use matching logic to the tailwind "md:" breakpoint, which is 768px)
  const isDesktop = useMedia("(min-width: 768px)", true);

  const targetContainer = isDesktop ? desktopContainer : mobileContainer;

  if (!targetContainer) {
    return null;
  }

  return createPortal(children, targetContainer);
}
