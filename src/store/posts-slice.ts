import { StateCreator } from 'zustand';
import { FollowerProfile, MessageState, WelcomeMessageSettings, ProfileAnalysis } from '../types/bluesky';

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

const defaultWelcomeSettings: WelcomeMessageSettings = {
  toneOfVoice: 'warm',
  customPrompt: ''
};

const createPostsSlice: StateCreator<PostsSlice> = (set) => ({
  // Initial state
  followers: [],
  userProfile: null,
  messages: {},
  welcomeSettings: defaultWelcomeSettings,
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
    set((state) => ({
      welcomeSettings: {
        ...state.welcomeSettings,
        ...settings
      }
    })),

  setLoading: (loading) => set({ loading }),

  resetPosts: () => set({
    followers: [],
    userProfile: null,
    messages: {},
    profileAnalysis: null,
    loading: false
  })
});

export default createPostsSlice;
