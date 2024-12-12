import { StateCreator } from 'zustand';
import { sessionStats } from '../lib/sessionStats';
import { profileAnalysisCache } from '../lib/profileAnalysisCache';

export interface ApiStats {
  blueskyApiCalls: number;
  openRouterTokens: number;
}

export interface ProfileAnalysis {
  summary: string;
  mainTopics: string[];
}

export interface StatsState {
  apiStats: ApiStats;
  profileAnalysis: ProfileAnalysis | null;
  isAnalyzing: boolean;
}

export interface StatsActions {
  incrementBlueskyApiCalls: () => void;
  addOpenRouterTokens: (tokens: number) => void;
  resetApiStats: () => void;
  setProfileAnalysis: (analysis: ProfileAnalysis | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  loadCachedAnalysis: (handle: string) => void;
  saveAnalysisToCache: (handle: string, analysis: ProfileAnalysis) => void;
  clearAnalysisCache: (handle: string) => void;
}

export interface StatsSlice extends StatsState, StatsActions {}

const createStatsSlice: StateCreator<StatsSlice> = (set) => {
  // Try to get stored stats
  const storedStats = sessionStats.get();

  return {
    // Initial state
    apiStats: storedStats,
    profileAnalysis: null,
    isAnalyzing: false,

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
    },

    setProfileAnalysis: (analysis: ProfileAnalysis | null) =>
      set({ profileAnalysis: analysis }),

    setIsAnalyzing: (isAnalyzing: boolean) =>
      set({ isAnalyzing }),

    loadCachedAnalysis: (handle: string) => {
      const cachedAnalysis = profileAnalysisCache.get(handle);
      if (cachedAnalysis) {
        set({ profileAnalysis: cachedAnalysis });
      }
    },

    saveAnalysisToCache: (handle: string, analysis: ProfileAnalysis) => {
      profileAnalysisCache.set(handle, analysis);
      set({ profileAnalysis: analysis });
    },

    clearAnalysisCache: (handle: string) => {
      profileAnalysisCache.clear(handle);
      set({ profileAnalysis: null });
    }
  };
}

export default createStatsSlice;
