import { StateCreator } from 'zustand';
import { BlueSkyService } from '../lib/services/bluesky-facade';
import { AuthService } from '../lib/services/auth';
import { AnalyticsService } from '../lib/services/analytics';
import type { BlueSkyCredentials } from '../types/bluesky';
import { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';
import { sessionStats } from '../lib/sessionStats';
import type { StoreState } from '../lib/store';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostRecord = AppBskyFeedPost.Record;

const CREDENTIALS_KEY = 'bluespark_credentials';

// Helper functions for localStorage
const loadStoredCredentials = (): BlueSkyCredentials | null => {
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load stored credentials:', error);
    return null;
  }
};

const saveCredentials = (credentials: BlueSkyCredentials | null) => {
  if (credentials) {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } else {
    localStorage.removeItem(CREDENTIALS_KEY);
  }
};

// Helper function to load user profile
const loadUserProfile = async (identifier: string) => {
  const bluesky = BlueSkyService.getInstance();
  const profile = await bluesky.getProfile(identifier);
  const posts = await bluesky.getUserPosts(profile.did);

  return {
    did: profile.did,
    handle: profile.handle,
    displayName: profile.displayName || profile.handle,
    description: profile.description || '',
    avatar: profile.avatar,
    posts: posts.map((post: FeedViewPost) => ({
      text: (post.post.record as PostRecord).text,
      createdAt: (post.post.record as PostRecord).createdAt
    })),
    followersCount: profile.followersCount || 0,
    followsCount: profile.followsCount || 0,
    postsCount: profile.postsCount || 0,
    joinedAt: posts[0] ? (posts[0].post.record as PostRecord).createdAt : new Date().toISOString(),
    lastPostedAt: posts[0] ? (posts[0].post.record as PostRecord).createdAt : undefined
  };
};

export interface AuthState {
  isAuthenticated: boolean;
  isAutoLogging: boolean;
  credentials: BlueSkyCredentials | null;
}

export interface AuthActions {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  setCredentials: (credentials: BlueSkyCredentials | null) => Promise<void>;
  setAutoLogging: (isAutoLogging: boolean) => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => ({
  // Initial state - load credentials from localStorage
  isAuthenticated: false,
  isAutoLogging: false,
  credentials: loadStoredCredentials(),

  // Actions
  login: async (identifier: string, password: string) => {
    const auth = AuthService.getInstance();
    const analytics = AnalyticsService.getInstance();
    const currentCredentials = get().credentials;

    // If logging in as a different user, reset stats
    if (currentCredentials && currentCredentials.identifier !== identifier) {
      sessionStats.clear();
      get().resetApiStats();
    }

    const session = await auth.login(identifier, password);
    const credentials = { identifier, password };
    
    // Save credentials and update state
    saveCredentials(credentials);
    set({
      isAuthenticated: true,
      credentials
    });

    // Load and set user profile
    const userProfile = await loadUserProfile(identifier);
    set((state) => ({
      ...state,
      userProfile
    }));
    
    // Track login
    await analytics.trackLogin(userProfile.handle);
  },

  logout: () => {
    // Clear stored credentials and reset state
    saveCredentials(null);
    sessionStats.clear();
    set({
      isAuthenticated: false,
      credentials: null
    });
    // Reset API stats
    get().resetApiStats();
  },

  setCredentials: async (credentials) => {
    const currentCredentials = get().credentials;

    // If setting credentials for a different user, reset stats
    if (currentCredentials && credentials && currentCredentials.identifier !== credentials.identifier) {
      sessionStats.clear();
      get().resetApiStats();
    }

    // Update stored credentials and state
    saveCredentials(credentials);
    set({ 
      credentials,
      isAuthenticated: !!credentials
    });

    // If we have credentials, load the user profile
    if (credentials) {
      try {
        const userProfile = await loadUserProfile(credentials.identifier);
        set((state) => ({
          ...state,
          userProfile
        }));
      } catch (error) {
        console.error('Failed to load user profile during auto-login:', error);
        // If profile loading fails, clear credentials and logout
        saveCredentials(null);
        sessionStats.clear();
        set({
          isAuthenticated: false,
          credentials: null
        });
        get().resetApiStats();
      }
    }
  },
  
  setAutoLogging: (isAutoLogging) => set({ isAutoLogging })
});

export default createAuthSlice;
