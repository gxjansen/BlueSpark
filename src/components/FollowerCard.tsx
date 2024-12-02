import { UserRound, Calendar, AlertCircle } from 'lucide-react';
import { Card } from './shared/Card';
import { Badge } from './shared/Badge';
import { MessageGenerator } from './MessageGenerator';
import type { FollowerProfile } from '../types/bluesky';
import type { RecentInteraction } from '../types/interactions';

interface FollowerCardProps {
  follower: FollowerProfile;
  interaction?: RecentInteraction;
  onSelect?: () => void;
}

export function FollowerCard({ follower, interaction, onSelect }: FollowerCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No posts yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isNewUser = () => {
    if (!follower.joinedAt) return false;
    
    const joinDate = new Date(follower.joinedAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Set both dates to start of day for accurate comparison
    joinDate.setHours(0, 0, 0, 0);
    twoWeeksAgo.setHours(0, 0, 0, 0);

    // Debug logging
    const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    console.debug('Join date check:', {
      handle: follower.handle,
      joinDate: joinDate.toISOString(),
      twoWeeksAgo: twoWeeksAgo.toISOString(),
      daysSinceJoining,
      isNew: daysSinceJoining <= 14
    });

    return daysSinceJoining <= 14;
  };

  return (
    <Card onClick={onSelect} className="relative">
      <div className="flex flex-col gap-4">
        {/* Header with Avatar and Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
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

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
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

        {/* Recent Interaction Warning */}
        {interaction?.hasInteracted && (
          <div className="flex items-center text-amber-400 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">
              You've interacted with this user in the past week
              {interaction.lastInteractionDate && 
                ` (${formatDate(interaction.lastInteractionDate)})`
              }
            </span>
          </div>
        )}

        {/* Description */}
        {follower.description && (
          <p className="text-sm text-gray-300">{follower.description}</p>
        )}

        {/* Dates and Badge */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Joined {formatDate(follower.joinedAt)}</span>
            </div>
            {isNewUser() && <Badge text="New" variant="blue" />}
          </div>
          <span>·</span>
          <span className={follower.lastPostedAt ? 'text-gray-500' : 'text-gray-600 italic'}>
            {follower.lastPostedAt ? `Last post ${formatDate(follower.lastPostedAt)}` : 'No posts yet'}
          </span>
        </div>

        {/* Message Generator */}
        <div className="mt-2">
          <MessageGenerator followerHandle={follower.handle} />
        </div>
      </div>
    </Card>
  );
}
