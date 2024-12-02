import { StateCreator } from 'zustand';
import { sessionStats } from '../lib/sessionStats';

export interface ApiStats {
  blueskyApiCalls: number;
  openRouterTokens: number;
}

export interface StatsState {
  apiStats: ApiStats;
}

export interface StatsActions {
  incrementBlueskyApiCalls: () => void;
  addOpenRouterTokens: (tokens: number) => void;
  resetApiStats: () => void;
}

export interface StatsSlice extends StatsState, StatsActions {}

const createStatsSlice: StateCreator<StatsSlice> = (set) => {
  // Try to get stored stats
  const storedStats = sessionStats.get();

  return {
    // Initial state
    apiStats: storedStats,

    // Actions
    incrementBlueskyApiCalls: () =>
      set((state) => {
        const newStats = {
          ...state.apiStats,
          blueskyApiCalls: state.apiStats.blueskyApiCalls + 1
        };
        sessionStats.set(newStats);
        return { apiStats: newStats };
      }),

    addOpenRouterTokens: (tokens) =>
      set((state) => {
        const newStats = {
          ...state.apiStats,
          openRouterTokens: state.apiStats.openRouterTokens + tokens
        };
        sessionStats.set(newStats);
        return { apiStats: newStats };
      }),

    resetApiStats: () => {
      const newStats = {
        blueskyApiCalls: 0,
        openRouterTokens: 0
      };
      sessionStats.set(newStats);
      set({ apiStats: newStats });
    }
  };
}

export default createStatsSlice;
