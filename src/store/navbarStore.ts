import { create } from "zustand";

interface NavbarStore {
  desktopContainer: HTMLElement | null;
  mobileContainer: HTMLElement | null;
  setDesktopContainer: (el: HTMLElement | null) => void;
  setMobileContainer: (el: HTMLElement | null) => void;
}

export const useNavbarStore = create<NavbarStore>((set) => ({
  desktopContainer: null,
  mobileContainer: null,
  setDesktopContainer: (el) => set({ desktopContainer: el }),
  setMobileContainer: (el) => set({ mobileContainer: el }),
}));
