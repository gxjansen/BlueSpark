import { StateCreator } from 'zustand';
import { FollowerProfile, MessageState, WelcomeMessageSettings, ProfileAnalysis, EmojiLevel } from '../types/bluesky';

export interface PostsState {
  followers: FollowerProfile[];
  userProfile: FollowerProfile | null;
  messages: MessageState;
  welcomeSettings: WelcomeMessageSettings;
  profileAnalysis: ProfileAnalysis | null;
  isAnalyzing: boolean;
  loading: boolean;
}

export interface PostsActions {
  setFollowers: (followers: FollowerProfile[]) => void;
  setUserProfile: (profile: FollowerProfile) => void;
  setProfileAnalysis: (analysis: ProfileAnalysis) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setMessage: (followerHandle: string, message: string) => void;
  setGenerating: (followerHandle: string, isGenerating: boolean) => void;
  setError: (followerHandle: string, error: string | null) => void;
  updateWelcomeSettings: (settings: Partial<WelcomeMessageSettings>) => void;
  setLoading: (loading: boolean) => void;
  resetPosts: () => void;
}

export interface PostsSlice extends PostsState, PostsActions {}

// Load welcome settings from localStorage or use defaults
const loadWelcomeSettings = (): WelcomeMessageSettings => {
  const defaultSettings: WelcomeMessageSettings = {
    toneOfVoice: 'warm',
    customPrompt: '',
    emojiLevel: 'off'
  };

  try {
    const saved = localStorage.getItem('welcomeSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate the loaded settings
      if (
        typeof parsed === 'object' &&
        typeof parsed.toneOfVoice === 'string' &&
        ['warm', 'professional', 'humorous', 'enthusiastic'].includes(parsed.toneOfVoice) &&
        typeof parsed.customPrompt === 'string' &&
        typeof parsed.emojiLevel === 'string' &&
        ['off', 'low', 'high'].includes(parsed.emojiLevel)
      ) {
        console.log('Loaded welcome settings from localStorage:', parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load welcome settings:', error);
  }

  // If no valid settings found in localStorage, save and return defaults
  try {
    localStorage.setItem('welcomeSettings', JSON.stringify(defaultSettings));
  } catch (error) {
    console.error('Failed to save default welcome settings:', error);
  }

  return defaultSettings;
};

const createPostsSlice: StateCreator<PostsSlice> = (set, get) => {
  // Load initial welcome settings
  const initialWelcomeSettings = loadWelcomeSettings();

  return {
    // Initial state
    followers: [],
    userProfile: null,
    messages: {},
    welcomeSettings: initialWelcomeSettings,
    profileAnalysis: null,
    isAnalyzing: false,
    loading: false,

    // Actions
    setFollowers: (followers) => set({ followers }),

    setUserProfile: (profile) => set({ userProfile: profile }),

    setProfileAnalysis: (analysis) => set({ profileAnalysis: analysis }),

    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

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

    updateWelcomeSettings: (settings) =>
      set((state) => {
        const newSettings = {
          ...state.welcomeSettings,
          ...settings
        };

        // Save to localStorage
        try {
          localStorage.setItem('welcomeSettings', JSON.stringify(newSettings));
          console.log('Saved new welcome settings:', newSettings);
        } catch (error) {
          console.error('Failed to save welcome settings:', error);
        }

        return { welcomeSettings: newSettings };
      }),

    setLoading: (loading) => set({ loading }),

    resetPosts: () => {
      // Keep the welcome settings when resetting
      const currentSettings = get().welcomeSettings;
      set({
        followers: [],
        userProfile: null,
        messages: {},
        profileAnalysis: null,
        loading: false,
        welcomeSettings: currentSettings
      });
    }
  };
};

export default createPostsSlice;
