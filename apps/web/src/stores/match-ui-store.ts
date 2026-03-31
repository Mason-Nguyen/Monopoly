import { create } from "zustand";

export type MatchRailPanel = "actions" | "economy" | "feed";
export type MatchFeedFilter = "all" | "turn" | "payment" | "property" | "connection";

interface MatchUiStoreState {
  selectedPanel: MatchRailPanel;
  feedFilter: MatchFeedFilter;
  pendingCommandId: string | null;
  isRightRailOpen: boolean;
  setSelectedPanel(value: MatchRailPanel): void;
  setFeedFilter(value: MatchFeedFilter): void;
  setPendingCommandId(value: string | null): void;
  setRightRailOpen(value: boolean): void;
  toggleRightRail(): void;
  clearPendingCommand(): void;
}

export const useMatchUiStore = create<MatchUiStoreState>()((set) => ({
  selectedPanel: "actions",
  feedFilter: "all",
  pendingCommandId: null,
  isRightRailOpen: false,
  setSelectedPanel(value) {
    set({
      selectedPanel: value
    });
  },
  setFeedFilter(value) {
    set({
      feedFilter: value
    });
  },
  setPendingCommandId(value) {
    set({
      pendingCommandId: value
    });
  },
  setRightRailOpen(value) {
    set({
      isRightRailOpen: value
    });
  },
  toggleRightRail() {
    set((state) => ({
      isRightRailOpen: !state.isRightRailOpen
    }));
  },
  clearPendingCommand() {
    set({
      pendingCommandId: null
    });
  }
}));