import { create } from "zustand";

export type MatchRailPanel = "actions" | "economy" | "feed";
export type MatchFeedFilter = "all" | "turn" | "payment" | "property" | "connection";

interface MatchUiStoreState {
  selectedPanel: MatchRailPanel;
  feedFilter: MatchFeedFilter;
  pendingCommandId: string | null;
  setSelectedPanel(value: MatchRailPanel): void;
  setFeedFilter(value: MatchFeedFilter): void;
  setPendingCommandId(value: string | null): void;
  clearPendingCommand(): void;
}

export const useMatchUiStore = create<MatchUiStoreState>()((set) => ({
  selectedPanel: "actions",
  feedFilter: "all",
  pendingCommandId: null,
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
  clearPendingCommand() {
    set({
      pendingCommandId: null
    });
  }
}));