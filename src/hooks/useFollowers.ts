import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/services/bluesky-facade';
import type { FollowerProfile } from '../types/bluesky';
import { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';
import toast from 'react-hot-toast';

const FOLLOWERS_LIMIT = 20;
const FETCH_BATCH_SIZE = 25; // Fetch extra to account for potential failures

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostRecord = AppBskyFeedPost.Record;

export function useFollowers() {
  const { userProfile, isAuthenticated, setFollowers, setLoading } = useStore();

  useEffect(() => {
    async function loadFollowers() {
      if (!userProfile || !isAuthenticated) return;

      setLoading(true);
      try {
        const bluesky = BlueSkyService.getInstance();
        const validFollowers: FollowerProfile[] = [];
        let failedFetches = 0;
        let cursor: string | undefined;

        // Keep fetching until we have FOLLOWERS_LIMIT valid profiles
        while (validFollowers.length < FOLLOWERS_LIMIT) {
          const response = await bluesky.getRecentFollowers(
            userProfile.handle, 
            FETCH_BATCH_SIZE,
            cursor
          );

          if (response.followers.length === 0) break; // No more followers to fetch

          for (const follower of response.followers) {
            if (validFollowers.length >= FOLLOWERS_LIMIT) break;

            try {
              const profile = await bluesky.getProfile(follower.handle);
              const posts = await bluesky.getUserPosts(follower.did);
              
              validFollowers.push({
                did: follower.did,
                handle: follower.handle,
                displayName: profile.displayName || follower.handle,
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
              });
            } catch (error) {
              console.warn(`Failed to fetch details for follower ${follower.handle}:`, error);
              failedFetches++;
              
              // Add follower with minimal info if we can't fetch full details
              validFollowers.push({
                did: follower.did,
                handle: follower.handle,
                displayName: follower.handle,
                description: '',
                avatar: undefined,
                posts: [],
                followersCount: 0,
                followsCount: 0,
                postsCount: 0,
                joinedAt: new Date().toISOString(),
                lastPostedAt: undefined
              });
            }
          }

          // Update cursor for next batch if needed
          cursor = response.cursor;
          
          // If we don't have a cursor and we haven't reached our limit, we've run out of followers
          if (!cursor && validFollowers.length < FOLLOWERS_LIMIT) break;
        }

        if (failedFetches > 0) {
          console.warn(`Failed to fetch complete details for ${failedFetches} followers`);
        }

        // Take exactly FOLLOWERS_LIMIT followers
        setFollowers(validFollowers.slice(0, FOLLOWERS_LIMIT));
      } catch (error) {
        console.error('Failed to load followers:', error);
        toast.error('Failed to load followers');
      } finally {
        setLoading(false);
      }
    }

    loadFollowers();
  }, [userProfile, isAuthenticated, setFollowers, setLoading]);

  return {
    loading: useStore((state) => state.loading)
  };
}
