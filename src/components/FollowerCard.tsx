import React from 'react';
import { UserRound, Calendar, AlertCircle } from 'lucide-react';
import { Card } from './shared/Card';
import { MessageGenerator } from './MessageGenerator';
import type { FollowerProfile, RecentInteraction } from '../types/bluesky';

interface FollowerCardProps {
  follower: FollowerProfile;
  interaction?: RecentInteraction;
}

export function FollowerCard({ follower, interaction }: FollowerCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No posts yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-4 hover:bg-[#2a3441] transition-colors">
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
            <h3 className="font-medium text-gray-100">
              {follower.displayName || follower.handle}
            </h3>
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
      {interaction?.hasInteracted && (
        <div className="mt-2 flex items-center text-amber-400 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">
            You've interacted with this user in the past week
            {interaction.lastInteractionDate && 
              ` (${formatDate(interaction.lastInteractionDate)})`
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
    </Card>
  );
}
