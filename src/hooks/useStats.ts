import { useCallback } from 'react';
import { useStore } from '../lib/store';
import type { ApiStats } from '../store/stats-slice';

export function useStats() {
  const { 
    apiStats,
    incrementBlueskyApiCalls,
    addOpenRouterTokens,
    resetApiStats
  } = useStore();

  const trackBlueskyCall = useCallback(() => {
    incrementBlueskyApiCalls();
  }, [incrementBlueskyApiCalls]);

  const trackOpenRouterTokens = useCallback((tokens: number) => {
    addOpenRouterTokens(tokens);
  }, [addOpenRouterTokens]);

  const resetStats = useCallback(() => {
    resetApiStats();
  }, [resetApiStats]);

  const getStats = useCallback((): ApiStats => {
    return apiStats;
  }, [apiStats]);

  return {
    stats: apiStats,
    getStats,
    trackBlueskyCall,
    trackOpenRouterTokens,
    resetStats
  };
}
