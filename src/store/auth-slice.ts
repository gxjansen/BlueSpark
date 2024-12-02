import { StateCreator } from 'zustand';
import { BlueSkyService } from '../lib/services/bluesky-facade';
import { AuthService } from '../lib/services/auth';
import { AnalyticsService } from '../lib/services/analytics';
import type { BlueSkyCredentials } from '../types/bluesky';
import { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostRecord = AppBskyFeedPost.Record;

export interface AuthState {
  isAuthenticated: boolean;
  isAutoLogging: boolean;
  credentials: BlueSkyCredentials | null;
}

export interface AuthActions {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  setCredentials: (credentials: BlueSkyCredentials | null) => void;
  setAutoLogging: (isAutoLogging: boolean) => void;
}

export interface AuthSlice extends AuthState, AuthActions {}

const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  // Initial state
  isAuthenticated: false,
  isAutoLogging: false,
  credentials: null,

  // Actions
  login: async (identifier: string, password: string) => {
    const auth = AuthService.getInstance();
    const bluesky = BlueSkyService.getInstance();
    const analytics = AnalyticsService.getInstance();

    const session = await auth.login(identifier, password);
    
    set({
      isAuthenticated: true,
      credentials: { identifier, password }
    });

    // Load user profile after successful login
    const profile = await bluesky.getProfile(identifier);
    const posts = await bluesky.getUserPosts(profile.did);
    
    // Track login
    await analytics.trackLogin(profile.handle);
    
    set((state: any) => ({
      ...state,
      userProfile: {
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
      }
    }));
  },

  logout: () => {
    set({
      isAuthenticated: false,
      credentials: null
    });
  },

  setCredentials: (credentials) => set({ credentials }),
  
  setAutoLogging: (isAutoLogging) => set({ isAutoLogging })
});

export default createAuthSlice;
