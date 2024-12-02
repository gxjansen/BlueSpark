import { create } from 'zustand';
import createAuthSlice, { AuthSlice } from '../store/auth-slice';
import createPostsSlice, { PostsSlice } from '../store/posts-slice';
import createStatsSlice, { StatsSlice } from '../store/stats-slice';

interface StoreState extends AuthSlice, PostsSlice, StatsSlice {}

export const useStore = create<StoreState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createPostsSlice(...args),
  ...createStatsSlice(...args)
}));
