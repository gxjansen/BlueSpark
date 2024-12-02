import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/bluesky';
import toast from 'react-hot-toast';
import { FollowerProfile } from '../types/bluesky';
import type { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostRecord = AppBskyFeedPost.Record;

export function useFollowers() {
  const [loading, setLoading] = useState(true);
  const { credentials, setFollowers, setUserProfile } = useStore();

  const getAvatarUrl = (rawUrl: string | undefined) => {
    if (!rawUrl) return undefined;
    
    // Log the raw URL for debugging
    console.log('Processing avatar URL:', rawUrl);
    
    // The raw URL might be in the format: at://did:plc:xxx/app.bsky.embed.images/yyy
    try {
      const url = new URL(rawUrl);
      if (url.protocol === 'at:') {
        // Extract the cid from the path
        const parts = url.pathname.split('/');
        const cid = parts[parts.length - 1];
        const did = url.hostname;
        return `https://cdn.bsky.app/img/avatar/plain/${cid}`;
      }
      return rawUrl;
    } catch (error) {
      console.error('Error processing avatar URL:', error);
      return undefined;
    }
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
          displayName: userProfileData.displayName,
          description: userProfileData.description,
          avatar: getAvatarUrl(userProfileData.avatar),
          posts: (userPosts as FeedViewPost[]).map(feedPost => ({
            text: (feedPost.post.record as PostRecord).text,
            createdAt: (feedPost.post.record as PostRecord).createdAt
          }))
        };
        setUserProfile(userProfile);

        // Get followers
        const followersData = await bluesky.getRecentFollowers(credentials.identifier);
        
        // Get detailed profile and posts for each follower
        const followersWithDetails = await Promise.all(
          followersData.map(async (follower) => {
            const profile = await bluesky.getProfile(follower.handle);
            const posts = await bluesky.getUserPosts(follower.did);
            
            return {
              did: follower.did,
              handle: follower.handle,
              displayName: profile.displayName,
              description: profile.description,
              avatar: getAvatarUrl(profile.avatar),
              posts: (posts as FeedViewPost[]).map(feedPost => ({
                text: (feedPost.post.record as PostRecord).text,
                createdAt: (feedPost.post.record as PostRecord).createdAt
              }))
            };
          })
        );

        setFollowers(followersWithDetails);
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
