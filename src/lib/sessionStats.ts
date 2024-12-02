const STATS_KEY = 'bluespark_api_stats';

interface ApiStats {
  blueskyApiCalls: number;
  openRouterTokens: number;
}

export const sessionStats = {
  get: (): ApiStats => {
    try {
      const stats = sessionStorage.getItem(STATS_KEY);
      if (stats) {
        return JSON.parse(stats);
      }
    } catch (error) {
      console.warn('Failed to load API stats from session storage:', error);
    }
    return {
      blueskyApiCalls: 0,
      openRouterTokens: 0
    };
  },

  set: (stats: ApiStats) => {
    try {
      sessionStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Failed to save API stats to session storage:', error);
    }
  },

  clear: () => {
    try {
      sessionStorage.removeItem(STATS_KEY);
    } catch (error) {
      console.warn('Failed to clear API stats from session storage:', error);
    }
  }
};
