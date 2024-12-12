import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Users } from 'lucide-react';
import { useFollowers } from '../hooks/useFollowers';
import { AuthService } from '../lib/services/auth';
import { retryOperation } from '../lib/utils/error-handling';
import { LoadingState } from './shared/LoadingState';
import { EmptyState } from './shared/EmptyState';
import { isWithinLastWeek, checkPostInteraction } from '../lib/utils/interaction-checks';
import type { RecentInteraction } from '../types/interactions';
import type { AppBskyFeedDefs } from '@atproto/api';
import { FollowerCard } from './FollowerCard';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

export function FollowerList() {
  const { followers, userProfile, isAuthenticated } = useStore();
  const { loading } = useFollowers();

  // State to store recent interactions with followers
  const [interactions, setInteractions] = useState<Record<string, RecentInteraction>>({});

  // State to track DIDs of hidden followers
  const [hiddenFollowers, setHiddenFollowers] = useState<string[]>([]);

  // Load hidden followers from localStorage when the component mounts
  useEffect(() => {
    const storedHiddenFollowers = localStorage.getItem('hiddenFollowers');
    if (storedHiddenFollowers) {
      setHiddenFollowers(JSON.parse(storedHiddenFollowers) as string[]);
    }
  }, []);

  // Save hidden followers to localStorage whenever the hiddenFollowers state changes
  useEffect(() => {
    localStorage.setItem('hiddenFollowers', JSON.stringify(hiddenFollowers));
  }, [hiddenFollowers]);

  /**
   * Handle hiding a follower by adding their DID to the hiddenFollowers array
   * @param followerDid - The DID of the follower to hide
   */
  const handleHideFollower = (followerDid: string) => {
    setHiddenFollowers((prevHiddenFollowers) => {
      if (!prevHiddenFollowers.includes(followerDid)) {
        return [...prevHiddenFollowers, followerDid];
      }
      return prevHiddenFollowers;
    });
  };

  /**
   * Unhide all followers by clearing the hiddenFollowers array
   */
  const handleUnhideFollowers = () => {
    setHiddenFollowers([]);
  };

  // Check interactions in the background after followers are loaded
  useEffect(() => {
    if (!userProfile || !followers.length || !isAuthenticated) return;

    let mounted = true;

    /**
     * Asynchronously check for recent interactions between the user and their followers
     */
    async function checkInteractions() {
      const auth = AuthService.getInstance();

      for (const follower of followers) {
        if (!mounted || !userProfile) break;

        try {
          // Get user's recent posts
          const userPosts = await retryOperation(
            () => auth.getAgent().getAuthorFeed({ actor: userProfile.did, limit: 50 }),
            `Get recent posts for ${userProfile.did}`
          );

          // Get follower's recent posts
          const followerPosts = await retryOperation(
            () => auth.getAgent().getAuthorFeed({ actor: follower.did, limit: 50 }),
            `Get recent posts for ${follower.did}`
          );

          const recentInteraction: RecentInteraction = { hasInteracted: false };

          // Check user's posts for mentions of the follower
          for (const post of userPosts.data.feed) {
            const feedPost = post as FeedViewPost;
            if (!isWithinLastWeek(feedPost.post.indexedAt)) continue;

            if (checkPostInteraction(feedPost, follower.handle)) {
              recentInteraction.hasInteracted = true;
              recentInteraction.lastInteractionDate = feedPost.post.indexedAt;
              recentInteraction.interactionType = 'mention';
              break;
            }
          }

          // If no interaction found, check follower's posts for mentions of the user
          if (!recentInteraction.hasInteracted) {
            const userHandle = userProfile.handle;
            for (const post of followerPosts.data.feed) {
              const feedPost = post as FeedViewPost;
              if (!isWithinLastWeek(feedPost.post.indexedAt)) continue;

              if (checkPostInteraction(feedPost, userHandle)) {
                recentInteraction.hasInteracted = true;
                recentInteraction.lastInteractionDate = feedPost.post.indexedAt;
                recentInteraction.interactionType = 'mention';
                break;
              }
            }
          }

          // Update the interactions state if a recent interaction was found
          if (mounted && recentInteraction.hasInteracted) {
            setInteractions((prevInteractions) => ({
              ...prevInteractions,
              [follower.did]: recentInteraction,
            }));
          }
        } catch (error) {
          console.warn(`Failed to check interactions for ${follower.handle}:`, error);
        }
      }
    }

    checkInteractions();

    // Cleanup function to prevent state updates if the component is unmounted
    return () => {
      mounted = false;
    };
  }, [followers, userProfile, isAuthenticated]);

  // Handle loading and authentication states
  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Users}
        message="Please log in to see your followers"
      />
    );
  }

  if (loading) {
    return <LoadingState message="Loading followers..." />;
  }

  if (!followers.length) {
    return (
      <EmptyState
        icon={Users}
        message="No recent followers found"
      />
    );
  }

  // Filter out hidden followers from the list to be displayed
  const visibleFollowers = followers.filter(
    (follower) => !hiddenFollowers.includes(follower.did)
  );

  return (
    <div className="bg-[#242c38] rounded-lg border border-[#2a3441]">
      {/* Header Section */}
      <div className="p-4 border-b border-[#2a3441] flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-medium text-gray-100">
              Recent Followers{' '}
              <span className="text-gray-400">({visibleFollowers.length})</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            During beta, only your latest 20 followers are shown
          </p>
        </div>
        {/* Unhide Followers Button */}
        {hiddenFollowers.length > 0 && (
          <button
            onClick={handleUnhideFollowers}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Unhide Followers
          </button>
        )}
      </div>

      {/* Followers List */}
      <div className="divide-y divide-[#2a3441]">
        {visibleFollowers.map((follower) => (
          <div key={follower.did} className="p-4">
            <FollowerCard
              follower={follower}
              interaction={interactions[follower.did]}
              onHide={handleHideFollower}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
