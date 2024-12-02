import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Users, Loader, UserRound, Calendar, AlertCircle } from 'lucide-react';
import { MessageGenerator } from './MessageGenerator';
import { useFollowers } from '../hooks/useFollowers';
import { BlueSkyService } from '../lib/bluesky';
import { RecentInteraction } from '../types/bluesky';

export function FollowerList() {
  const { followers, userProfile } = useStore((state) => state);
  const { loading } = useFollowers();
  const [interactions, setInteractions] = useState<Record<string, RecentInteraction>>({});

  useEffect(() => {
    async function checkInteractions() {
      if (!userProfile || !followers.length) return;

      const bluesky = BlueSkyService.getInstance();
      const newInteractions: Record<string, RecentInteraction> = {};

      for (const follower of followers) {
        try {
          const interaction = await bluesky.checkRecentInteractions(userProfile.did, follower.did);
          if (interaction.hasInteracted) {
            newInteractions[follower.did] = interaction;
          }
        } catch (error) {
          console.warn(`Failed to check interactions for ${follower.handle}:`, error);
        }
      }

      setInteractions(newInteractions);
    }

    checkInteractions();
  }, [followers, userProfile]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No posts yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading followers...</p>
        </div>
      </div>
    );
  }

  if (!followers.length) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="w-8 h-8 text-gray-400" />
          <p className="mt-4 text-gray-600">No recent followers found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="ml-2 text-xl font-semibold text-gray-800">Recent Followers</h2>
      </div>

      <div className="space-y-4">
        {followers.map((follower) => (
          <div
            key={follower.did}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
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
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-lg">
                      {(follower.displayName || follower.handle)[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{follower.displayName || follower.handle}</h3>
                  <p className="text-sm text-gray-500">@{follower.handle}</p>
                </div>
              </div>
              
              {/* Profile Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
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
              <p className="mt-2 text-sm text-gray-600 ml-13">{follower.description}</p>
            )}

            {/* Recent Interaction Warning */}
            {interactions[follower.did]?.hasInteracted && (
              <div className="mt-2 flex items-center text-amber-600 bg-amber-50 p-2 rounded-md">
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
              <span className={follower.lastPostedAt ? 'text-gray-500' : 'text-gray-400 italic'}>
                {follower.lastPostedAt ? `Last post ${formatDate(follower.lastPostedAt)}` : 'No posts yet'}
              </span>
            </div>

            <div className="mt-4">
              <MessageGenerator followerHandle={follower.handle} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
