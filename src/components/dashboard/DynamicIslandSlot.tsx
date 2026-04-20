"use client";

import { useNavbarStore, IslandSlot } from "@/store/navbarStore";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMedia } from "react-use";

export function DynamicIslandSlot({
  slot,
  children,
}: {
  slot: IslandSlot;
  children: ReactNode;
}) {
  const desktopSlots = useNavbarStore((state) => state.desktopSlots);
  const mobileSlots = useNavbarStore((state) => state.mobileSlots);
  const isDesktop = useMedia("(min-width: 768px)", true);

  const target = isDesktop ? desktopSlots[slot] : mobileSlots[slot];

  if (!target) return null;
  return createPortal(children, target);
}
