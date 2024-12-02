import { create } from 'zustand';
import { BlueSkyCredentials, FollowerProfile, MessageState, WelcomeMessageSettings, ProfileAnalysis } from '../types/bluesky';

interface AppState {
  credentials: BlueSkyCredentials | null;
  isAuthenticated: boolean;
  followers: FollowerProfile[];
  userProfile: FollowerProfile | null;
  messages: MessageState;
  welcomeSettings: WelcomeMessageSettings;
  profileAnalysis: ProfileAnalysis | null;
  isAnalyzing: boolean;
  
  // Auth actions
  setCredentials: (creds: BlueSkyCredentials) => void;
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
}

const defaultWelcomeSettings: WelcomeMessageSettings = {
  toneOfVoice: 'friendly',
  customPrompt: ''
};

export const useStore = create<AppState>((set) => ({
  // State
  credentials: null,
  isAuthenticated: false,
  followers: [],
  userProfile: null,
  messages: {},
  welcomeSettings: defaultWelcomeSettings,
  profileAnalysis: null,
  isAnalyzing: false,

  // Auth actions
  setCredentials: (creds) => set({ credentials: creds, isAuthenticated: true }),
  logout: () => set({
    credentials: null,
    isAuthenticated: false,
    followers: [],
    userProfile: null,
    messages: {},
    profileAnalysis: null
  }),

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
    }))
}));
