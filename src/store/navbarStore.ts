import { create } from "zustand";

type IslandSlot = "left" | "center" | "right";

interface NavbarStore {
  /** Legacy single-island containers (kept for backward compat) */
  desktopContainer: HTMLElement | null;
  mobileContainer: HTMLElement | null;
  setDesktopContainer: (el: HTMLElement | null) => void;
  setMobileContainer: (el: HTMLElement | null) => void;

  /** Three-island containers keyed by slot and viewport */
  desktopSlots: Record<IslandSlot, HTMLElement | null>;
  mobileSlots: Record<IslandSlot, HTMLElement | null>;
  setDesktopSlot: (slot: IslandSlot, el: HTMLElement | null) => void;
  setMobileSlot: (slot: IslandSlot, el: HTMLElement | null) => void;
}

export const useNavbarStore = create<NavbarStore>((set) => ({
  desktopContainer: null,
  mobileContainer: null,
  setDesktopContainer: (el) => set({ desktopContainer: el }),
  setMobileContainer: (el) => set({ mobileContainer: el }),

  desktopSlots: { left: null, center: null, right: null },
  mobileSlots: { left: null, center: null, right: null },
  setDesktopSlot: (slot, el) =>
    set((state) => ({
      desktopSlots: { ...state.desktopSlots, [slot]: el },
    })),
  setMobileSlot: (slot, el) =>
    set((state) => ({
      mobileSlots: { ...state.mobileSlots, [slot]: el },
    })),
}));

export type { IslandSlot };
