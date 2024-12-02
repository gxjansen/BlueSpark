import { create } from 'zustand';
import { BlueSkyCredentials, FollowerProfile, MessageState, WelcomeMessageSettings, ProfileAnalysis } from '../types/bluesky';
import { cookies } from './cookies';

interface ApiStats {
  blueskyApiCalls: number;
  openRouterTokens: number;
}

interface AppState {
  credentials: BlueSkyCredentials | null;
  isAuthenticated: boolean;
  isAutoLogging: boolean;
  followers: FollowerProfile[];
  userProfile: FollowerProfile | null;
  messages: MessageState;
  welcomeSettings: WelcomeMessageSettings;
  profileAnalysis: ProfileAnalysis | null;
  isAnalyzing: boolean;
  apiStats: ApiStats;
  
  // Auth actions
  setCredentials: (creds: BlueSkyCredentials) => void;
  setAutoLogging: (isLogging: boolean) => void;
  logout: () => void;
  
  // Profile actions
  setFollowers: (followers: FollowerProfile[]) => void;
  setUserProfile: (profile: FollowerProfile) => void;
  setProfileAnalysis: (analysis: ProfileAnalysis) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  
  // Message actions
  setMessage: (followerHandle: string, message: string) => void;
  setGenerating: (followerHandle: string, isGenerating: boolean) => void;
  setError: (followerHandle: string, error: string | null) => void;
  
  // Settings actions
  updateWelcomeSettings: (settings: Partial<WelcomeMessageSettings>) => void;

  // API stats actions
  incrementBlueskyApiCalls: () => void;
  addOpenRouterTokens: (tokens: number) => void;
  resetApiStats: () => void;
}

const defaultWelcomeSettings: WelcomeMessageSettings = {
  toneOfVoice: 'friendly',
  customPrompt: ''
};

// Try to get stored credentials
const storedCredentials = cookies.get();

export const useStore = create<AppState>((set) => ({
  // Initial state
  credentials: storedCredentials,
  isAuthenticated: false, // Start as false even with stored credentials
  isAutoLogging: false,
  followers: [],
  userProfile: null,
  messages: {},
  welcomeSettings: defaultWelcomeSettings,
  profileAnalysis: null,
  isAnalyzing: false,
  apiStats: {
    blueskyApiCalls: 0,
    openRouterTokens: 0
  },

  // Auth actions
  setCredentials: (creds) => {
    cookies.set(creds);
    set({ credentials: creds, isAuthenticated: true });
  },
  setAutoLogging: (isLogging) => set({ isAutoLogging: isLogging }),
  logout: () => {
    cookies.remove();
    set({
      credentials: null,
      isAuthenticated: false,
      followers: [],
      userProfile: null,
      messages: {},
      profileAnalysis: null
    });
  },

  // Profile actions
  setFollowers: (followers) => set({ followers }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setProfileAnalysis: (analysis) => set({ profileAnalysis: analysis }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  // Message actions
  setMessage: (followerHandle, message) => 
    set((state) => ({
      messages: {
        ...state.messages,
        [followerHandle]: {
          ...state.messages[followerHandle],
          message
        }
      }
    })),
  setGenerating: (followerHandle, isGenerating) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [followerHandle]: {
          ...state.messages[followerHandle],
          isGenerating
        }
      }
    })),
  setError: (followerHandle, error) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [followerHandle]: {
          ...state.messages[followerHandle],
          error
        }
      }
    })),

  // Settings actions
  updateWelcomeSettings: (settings) =>
    set((state) => ({
      welcomeSettings: {
        ...state.welcomeSettings,
        ...settings
      }
    })),

  // API stats actions
  incrementBlueskyApiCalls: () =>
    set((state) => ({
      apiStats: {
        ...state.apiStats,
        blueskyApiCalls: state.apiStats.blueskyApiCalls + 1
      }
    })),
  addOpenRouterTokens: (tokens) =>
    set((state) => ({
      apiStats: {
        ...state.apiStats,
        openRouterTokens: state.apiStats.openRouterTokens + tokens
      }
    })),
  resetApiStats: () =>
    set((state) => ({
      apiStats: {
        blueskyApiCalls: 0,
        openRouterTokens: 0
      }
    }))
}));
