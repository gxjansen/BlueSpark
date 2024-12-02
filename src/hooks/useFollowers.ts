import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/bluesky';
import toast from 'react-hot-toast';
import { FollowerProfile } from '../types/bluesky';
import type { AppBskyFeedDefs } from '@atproto/api';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

interface PostRecord {
  text: string;
  createdAt: string;
}

export function useFollowers() {
  const [loading, setLoading] = useState(true);
  const { credentials, setFollowers, setUserProfile } = useStore();

  const getAvatarUrl = (rawUrl: string | undefined) => {
    if (!rawUrl) return undefined;
    
    try {
      const url = new URL(rawUrl);
      if (url.protocol === 'at:') {
        const parts = url.pathname.split('/');
        const cid = parts[parts.length - 1];
        return `https://cdn.bsky.app/img/avatar/plain/${cid}`;
      }
      return rawUrl;
    } catch (error) {
      console.error('Error processing avatar URL:', error);
      return undefined;
    }
  };

  const getPostDate = (post: FeedViewPost | undefined): string | undefined => {
    if (!post?.post?.record || typeof post.post.record !== 'object') return undefined;
    const record = post.post.record as { createdAt?: string };
    return record.createdAt;
  };

  useEffect(() => {
    async function fetchFollowers() {
      if (!credentials) return;

      try {
        setLoading(true);
        const bluesky = BlueSkyService.getInstance();
        
        // Get user profile first
        const userProfileData = await bluesky.getProfile(credentials.identifier);
        const userPosts = await bluesky.getUserPosts(userProfileData.did);
        
        const userProfile: FollowerProfile = {
          did: userProfileData.did,
          handle: userProfileData.handle,
          displayName: userProfileData.displayName || userProfileData.handle,
          description: userProfileData.description || '',
          avatar: getAvatarUrl(userProfileData.avatar),
          posts: (userPosts as FeedViewPost[]).map(feedPost => ({
            text: (feedPost.post.record as PostRecord).text,
            createdAt: (feedPost.post.record as PostRecord).createdAt
          })),
          followersCount: userProfileData.followersCount || 0,
          followsCount: userProfileData.followsCount || 0,
          postsCount: userProfileData.postsCount || 0,
          joinedAt: getPostDate(userPosts[0]) || new Date().toISOString(),
          lastPostedAt: getPostDate(userPosts[0])
        };
        setUserProfile(userProfile);

        // Get followers
        const followersData = await bluesky.getRecentFollowers(credentials.identifier);
        const validFollowers: FollowerProfile[] = [];

        // Process followers sequentially to avoid overwhelming the API
        for (const follower of followersData) {
          try {
            const profile = await bluesky.getProfile(follower.handle);
            const posts = await bluesky.getUserPosts(follower.did);
            
            validFollowers.push({
              did: follower.did,
              handle: follower.handle,
              displayName: profile.displayName || follower.handle,
              description: profile.description || '',
              avatar: getAvatarUrl(profile.avatar),
              posts: (posts as FeedViewPost[]).map(feedPost => ({
                text: (feedPost.post.record as PostRecord).text,
                createdAt: (feedPost.post.record as PostRecord).createdAt
              })),
              followersCount: profile.followersCount || 0,
              followsCount: profile.followsCount || 0,
              postsCount: profile.postsCount || 0,
              joinedAt: getPostDate(posts[0]) || new Date().toISOString(),
              lastPostedAt: getPostDate(posts[0])
            });
          } catch (error) {
            console.warn(`Failed to fetch details for follower ${follower.handle}:`, error);
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

        setFollowers(validFollowers);
      } catch (error) {
        console.error('Error fetching followers:', error);
        toast.error('Failed to load followers');
      } finally {
        setLoading(false);
      }
    }

    fetchFollowers();
  }, [credentials, setFollowers, setUserProfile]);

  return { loading };
}
