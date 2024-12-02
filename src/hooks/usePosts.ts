import { useCallback } from 'react';
import { useStore } from '../lib/store';
import { BlueSkyService } from '../lib/services/bluesky-facade';
import type { FollowerProfile, ProfileAnalysis } from '../types/bluesky';
import { AppBskyFeedDefs } from '@atproto/api';
import toast from 'react-hot-toast';

type PostView = AppBskyFeedDefs.PostView;
type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

export function usePosts() {
  const {
    userProfile,
    followers,
    profileAnalysis,
    isAnalyzing,
    setUserProfile,
    setFollowers,
    setProfileAnalysis,
    setIsAnalyzing,
    welcomeSettings,
    updateWelcomeSettings
  } = useStore();

  const loadUserProfile = useCallback(async (handle: string) => {
    try {
      const bluesky = BlueSkyService.getInstance();
      const profile = await bluesky.getProfile(handle);
      const postsResponse = await bluesky.getUserPosts(profile.did);
      
      const userProfile: FollowerProfile = {
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName || profile.handle,
        description: profile.description || '',
        avatar: profile.avatar,
        posts: postsResponse.map((post: FeedViewPost) => ({
          text: (post.post.record as { text: string }).text,
          createdAt: (post.post.record as { createdAt: string }).createdAt
        })),
        followersCount: profile.followersCount || 0,
        followsCount: profile.followsCount || 0,
        postsCount: profile.postsCount || 0,
        joinedAt: postsResponse[0] ? 
          (postsResponse[0].post.record as { createdAt: string }).createdAt : 
          new Date().toISOString(),
        lastPostedAt: postsResponse[0] ? 
          (postsResponse[0].post.record as { createdAt: string }).createdAt : 
          undefined
      };

      setUserProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast.error('Failed to load user profile');
      return null;
    }
  }, [setUserProfile]);

  const loadFollowers = useCallback(async (handle: string) => {
    try {
      const bluesky = BlueSkyService.getInstance();
      const followersData = await bluesky.getRecentFollowers(handle);
      const validFollowers: FollowerProfile[] = [];

      for (const follower of followersData) {
        try {
          const profile = await bluesky.getProfile(follower.handle);
          const postsResponse = await bluesky.getUserPosts(follower.did);
          
          validFollowers.push({
            did: follower.did,
            handle: follower.handle,
            displayName: profile.displayName || follower.handle,
            description: profile.description || '',
            avatar: profile.avatar,
            posts: postsResponse.map((post: FeedViewPost) => ({
              text: (post.post.record as { text: string }).text,
              createdAt: (post.post.record as { createdAt: string }).createdAt
            })),
            followersCount: profile.followersCount || 0,
            followsCount: profile.followsCount || 0,
            postsCount: profile.postsCount || 0,
            joinedAt: postsResponse[0] ? 
              (postsResponse[0].post.record as { createdAt: string }).createdAt : 
              new Date().toISOString(),
            lastPostedAt: postsResponse[0] ? 
              (postsResponse[0].post.record as { createdAt: string }).createdAt : 
              undefined
          });
        } catch (error) {
          console.warn(`Failed to fetch details for follower ${follower.handle}:`, error);
        }
      }

      setFollowers(validFollowers);
      return validFollowers;
    } catch (error) {
      console.error('Failed to load followers:', error);
      toast.error('Failed to load followers');
      return [];
    }
  }, [setFollowers]);

  const analyzeProfile = useCallback(async (profile: FollowerProfile): Promise<ProfileAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const analysis = await BlueSkyService.getInstance().analyzeProfile(profile);
      setProfileAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Failed to analyze profile:', error);
      toast.error('Failed to analyze profile');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [setIsAnalyzing, setProfileAnalysis]);

  return {
    userProfile,
    followers,
    profileAnalysis,
    isAnalyzing,
    welcomeSettings,
    loadUserProfile,
    loadFollowers,
    analyzeProfile,
    updateWelcomeSettings
  };
}
