import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Users } from 'lucide-react';
import { useFollowers } from '../hooks/useFollowers';
import { AuthService } from '../lib/services/auth';
import { retryOperation } from '../lib/utils/error-handling';
import { LoadingState } from './shared/LoadingState';
import { EmptyState } from './shared/EmptyState';
import { isWithinLastWeek, checkPostInteraction } from '../lib/utils/interaction-checks';
import { RecentInteraction } from '../types/interactions';
import { AppBskyFeedDefs } from '@atproto/api';
import { FollowerCard } from './FollowerCard';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

export function FollowerList() {
  const { followers, userProfile, isAuthenticated } = useStore();
  const { loading } = useFollowers();
  const [interactions, setInteractions] = useState<Record<string, RecentInteraction>>({});

  // Check interactions in the background after followers are loaded
  useEffect(() => {
    if (!userProfile || !followers.length || !isAuthenticated) return;

    let mounted = true;

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

          const result: RecentInteraction = { hasInteracted: false };

          // Check user's posts for mentions of follower
          for (const post of userPosts.data.feed) {
            const feedPost = post as FeedViewPost;
            if (!isWithinLastWeek(feedPost.post.indexedAt)) continue;
            
            if (checkPostInteraction(feedPost, follower.handle)) {
              result.hasInteracted = true;
              result.lastInteractionDate = feedPost.post.indexedAt;
              result.interactionType = 'mention';
              break;
            }
          }

          // If no interaction found, check follower's posts for mentions of user
          if (!result.hasInteracted) {
            const userHandle = userProfile.handle;
            for (const post of followerPosts.data.feed) {
              const feedPost = post as FeedViewPost;
              if (!isWithinLastWeek(feedPost.post.indexedAt)) continue;
              
              if (checkPostInteraction(feedPost, userHandle)) {
                result.hasInteracted = true;
                result.lastInteractionDate = feedPost.post.indexedAt;
                result.interactionType = 'mention';
                break;
              }
            }
          }

          if (mounted && result.hasInteracted) {
            setInteractions(prev => ({
              ...prev,
              [follower.did]: result
            }));
          }
        } catch (error) {
          console.warn(`Failed to check interactions for ${follower.handle}:`, error);
        }
      }
    }

    checkInteractions();

    return () => {
      mounted = false;
    };
  }, [followers, userProfile, isAuthenticated]);

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

  return (
    <div className="bg-[#242c38] rounded-lg border border-[#2a3441]">
      <div className="p-4 border-b border-[#2a3441]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-medium text-gray-100">
              Recent Followers <span className="text-gray-400">({followers.length})</span>
            </h2>
          </div>
          <p className="text-xs text-gray-400 ml-6">During beta, only your latest 20 followers are shown</p>
        </div>
      </div>

      <div className="divide-y divide-[#2a3441]">
        {followers.map((follower) => (
          <div key={follower.did} className="p-4">
            <FollowerCard 
              follower={follower} 
              interaction={interactions[follower.did]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
