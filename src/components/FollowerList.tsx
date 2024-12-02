import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Users, Loader, UserRound, Calendar, AlertCircle } from 'lucide-react';
import { MessageGenerator } from './MessageGenerator';
import { useFollowers } from '../hooks/useFollowers';
import { AuthService } from '../lib/services/auth';
import { retryOperation } from '../lib/utils/error-handling';
import { Card } from './shared/Card';
import { LoadingState } from './shared/LoadingState';
import { EmptyState } from './shared/EmptyState';
import { isWithinLastWeek, checkPostInteraction } from '../lib/utils/interaction-checks';
import { RecentInteraction } from '../types/interactions';
import { AppBskyFeedDefs } from '@atproto/api';

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No posts yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
    <Card className="w-full max-w-2xl">
      <div className="flex items-center mb-6">
        <Users className="w-6 h-6 text-blue-400" />
        <h2 className="ml-2 text-xl font-semibold text-gray-100">
          Recent Followers ({followers.length})
        </h2>
      </div>

      <div className="space-y-4">
        {followers.map((follower) => (
          <div
            key={follower.did}
            className="p-4 border border-[#2a3441] rounded-lg hover:bg-[#2a3441] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {follower.avatar ? (
                  <img
                    src={follower.avatar}
                    alt={follower.displayName || follower.handle}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2a3441] flex items-center justify-center">
                    <span className="text-blue-400 text-lg">
                      {(follower.displayName || follower.handle)[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-100">{follower.displayName || follower.handle}</h3>
                  <p className="text-sm text-gray-400">@{follower.handle}</p>
                </div>
              </div>
              
              {/* Profile Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <UserRound className="w-4 h-4 mr-1" />
                  <span>{follower.followersCount}</span>
                  <span className="mx-1">·</span>
                  <span>{follower.followsCount}</span>
                </div>
                <div>
                  <span>{follower.postsCount} posts</span>
                </div>
              </div>
            </div>

            {follower.description && (
              <p className="mt-2 text-sm text-gray-300 ml-13">{follower.description}</p>
            )}

            {/* Recent Interaction Warning */}
            {interactions[follower.did]?.hasInteracted && (
              <div className="mt-2 flex items-center text-amber-400 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  You've interacted with this user in the past week
                  {interactions[follower.did].lastInteractionDate && 
                    ` (${formatDate(interactions[follower.did].lastInteractionDate)})`
                  }
                </span>
              </div>
            )}

            {/* Dates */}
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Joined {formatDate(follower.joinedAt)}</span>
              </div>
              <span>·</span>
              <span className={follower.lastPostedAt ? 'text-gray-500' : 'text-gray-600 italic'}>
                {follower.lastPostedAt ? `Last post ${formatDate(follower.lastPostedAt)}` : 'No posts yet'}
              </span>
            </div>

            <div className="mt-4">
              <MessageGenerator followerHandle={follower.handle} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
