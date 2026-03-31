import { create } from "zustand";

interface UiStoreState {
  isPrimaryNavOpen: boolean;
  openPrimaryNav(): void;
  closePrimaryNav(): void;
  togglePrimaryNav(): void;
}

export const useUiStore = create<UiStoreState>()((set) => ({
  isPrimaryNavOpen: false,
  openPrimaryNav() {
    set({
      isPrimaryNavOpen: true
    });
  },
  closePrimaryNav() {
    set({
      isPrimaryNavOpen: false
    });
  },
  togglePrimaryNav() {
    set((state) => ({
      isPrimaryNavOpen: !state.isPrimaryNavOpen
    }));
  }
}));