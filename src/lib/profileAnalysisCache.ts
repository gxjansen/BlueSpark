const PROFILE_ANALYSIS_KEY = 'bluespark_profile_analysis';

interface ProfileAnalysis {
  summary: string;
  mainTopics: string[];
}

export const profileAnalysisCache = {
  get: (handle: string): ProfileAnalysis | null => {
    try {
      const cache = localStorage.getItem(`${PROFILE_ANALYSIS_KEY}_${handle}`);
      if (cache) {
        const { analysis, timestamp } = JSON.parse(cache);
        // Cache expires after 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return analysis;
        }
      }
    } catch (error) {
      console.warn('Failed to load profile analysis from cache:', error);
    }
    return null;
  },

  set: (handle: string, analysis: ProfileAnalysis) => {
    try {
      const cache = {
        analysis,
        timestamp: Date.now()
      };
      localStorage.setItem(`${PROFILE_ANALYSIS_KEY}_${handle}`, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save profile analysis to cache:', error);
    }
  },

  clear: (handle: string) => {
    try {
      localStorage.removeItem(`${PROFILE_ANALYSIS_KEY}_${handle}`);
    } catch (error) {
      console.warn('Failed to clear profile analysis from cache:', error);
    }
  }
};
