import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/services/bluesky-facade';
import { ContentAnalyzer } from '../lib/analysis';
import type { FollowerProfile, Post } from '../types/bluesky';
import { AppBskyFeedDefs, AppBskyFeedPost, AppBskyActorDefs } from '@atproto/api';
import toast from 'react-hot-toast';

const FOLLOWERS_LIMIT = 20;
const FETCH_BATCH_SIZE = 25; // Fetch extra to account for potential failures

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type ProfileViewDetailed = AppBskyActorDefs.ProfileViewDetailed;
type PostRecord = AppBskyFeedPost.Record;

/**
 * Get the earliest date from a list of posts
 */
function getEarliestPostDate(posts: FeedViewPost[]): string | undefined {
  if (posts.length === 0) return undefined;

  return posts.reduce((earliest: string | undefined, post) => {
    const record = post.post.record as PostRecord;
    if (!record?.createdAt) return earliest;
    
    if (!earliest) return record.createdAt;
    return new Date(record.createdAt) < new Date(earliest) ? record.createdAt : earliest;
  }, undefined);
}

/**
 * Get the latest date from a list of posts
 */
function getLatestPostDate(posts: FeedViewPost[]): string | undefined {
  if (posts.length === 0) return undefined;

  return posts.reduce((latest: string | undefined, post) => {
    const record = post.post.record as PostRecord;
    if (!record?.createdAt) return latest;
    
    if (!latest) return record.createdAt;
    return new Date(record.createdAt) > new Date(latest) ? record.createdAt : latest;
  }, undefined);
}

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
              const profile = (await bluesky.getProfile(follower.handle)) as ProfileViewDetailed;
              const posts = await bluesky.getUserPosts(follower.did);
              
              const followerPosts: Post[] = posts.map((post: FeedViewPost) => {
                const record = post.post.record as PostRecord;
                return {
                  text: record.text || '',
                  createdAt: record.createdAt
                };
              });

              // Create follower profile without account type initially
              const followerProfile: FollowerProfile = {
                did: follower.did,
                handle: follower.handle,
                displayName: profile.displayName || follower.handle,
                description: profile.description || '',
                avatar: profile.avatar,
                posts: followerPosts,
                followersCount: profile.followersCount || 0,
                followsCount: profile.followsCount || 0,
                postsCount: profile.postsCount || 0,
                joinedAt: profile.indexedAt || new Date().toISOString(),
                lastPostedAt: getLatestPostDate(posts),
                accountType: 'personal' // Default to personal initially
              };

              validFollowers.push(followerProfile);
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
                lastPostedAt: undefined,
                accountType: 'personal' // Default to personal
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

        // Set followers immediately with default account types
        const initialFollowers = validFollowers.slice(0, FOLLOWERS_LIMIT);
        setFollowers(initialFollowers);
        setLoading(false);

        // Then analyze account types in the background
        initialFollowers.forEach(async (follower, index) => {
          try {
            const analysis = await ContentAnalyzer.analyzeUserProfile(follower);
            
            // Debug logging for account type
            console.debug('Follower analysis:', {
              handle: follower.handle,
              accountType: analysis.accountType,
              basedOnPosts: analysis.basedOnPosts
            });

            // Get current followers from store
            const currentFollowers = useStore.getState().followers;
            
            // Create new array with updated account type
            const updatedFollowers = currentFollowers.map((f, i) => 
              i === index ? { ...f, accountType: analysis.accountType } : f
            );

            // Update store with new array
            setFollowers(updatedFollowers);
          } catch (error) {
            console.warn(`Failed to analyze account type for ${follower.handle}:`, error);
          }
        });

      } catch (error) {
        console.error('Failed to load followers:', error);
        toast.error('Failed to load followers');
        setLoading(false);
      }
    }

    loadFollowers();
  }, [userProfile, isAuthenticated, setFollowers, setLoading]);

  return {
    loading: useStore((state) => state.loading)
  };
}
