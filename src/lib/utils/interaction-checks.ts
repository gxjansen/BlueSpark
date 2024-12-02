import { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostRecord = AppBskyFeedPost.Record;

/**
 * Checks if a date is within the last week
 */
export function isWithinLastWeek(date: string): boolean {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(date) >= oneWeekAgo;
}

/**
 * Checks if a post contains a mention of the target user
 */
export function checkPostInteraction(post: FeedViewPost, targetHandle: string): boolean {
  const record = post.post.record as PostRecord;
  return record?.text?.toLowerCase().includes(`@${targetHandle.toLowerCase()}`) || false;
}
