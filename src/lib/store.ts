import { create } from 'zustand';
import createAuthSlice, { AuthSlice } from '../store/auth-slice';
import createPostsSlice, { PostsSlice } from '../store/posts-slice';
import createStatsSlice, { StatsSlice } from '../store/stats-slice';

export interface StoreState extends AuthSlice, PostsSlice, StatsSlice {}

// Create store with proper type inference
export const useStore = create<StoreState>()((set, get, store) => ({
  ...createAuthSlice(set, get, store),
  ...createPostsSlice(set, get, store),
  ...createStatsSlice(set, get, store)
}));
