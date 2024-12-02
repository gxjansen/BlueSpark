import { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';
import { AuthService } from './auth';
import { retryOperation } from '../utils/error-handling';
import { useStore } from '../store';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostRecord = AppBskyFeedPost.Record;

interface RecentInteraction {
  hasInteracted: boolean;
  lastInteractionDate?: string;
}

interface PostAuthor {
  did: string;
}

interface ThreadPost {
  author: PostAuthor;
}

interface ThreadView {
  posts?: ThreadPost[];
}

interface ExtendedFeedViewPost extends FeedViewPost {
  thread?: ThreadView;
}

interface PostReplyRef {
  parent: {
    author: PostAuthor;
  };
}

export class InteractionsService {
  private static instance: InteractionsService;
  private auth: AuthService;

  private constructor() {
    this.auth = AuthService.getInstance();
  }

  static getInstance(): InteractionsService {
    if (!InteractionsService.instance) {
      InteractionsService.instance = new InteractionsService();
    }
    return InteractionsService.instance;
  }

  private trackApiCall() {
    const store = useStore.getState();
    store.incrementBlueskyApiCalls();
  }

  async checkRecentInteractions(userDid: string, followerDid: string): Promise<RecentInteraction> {
    try {
      this.auth.checkAuth();
      this.trackApiCall();

      // Get posts from the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get user's recent posts
      const userPosts = await retryOperation(
        () => this.auth.getAgent().getAuthorFeed({ actor: userDid }),
        `Get recent posts for ${userDid}`
      );

      // Get follower's recent posts
      const followerPosts = await retryOperation(
        () => this.auth.getAgent().getAuthorFeed({ actor: followerDid }),
        `Get recent posts for ${followerDid}`
      );

      const result: RecentInteraction = { hasInteracted: false };

      // Helper function to check if a post is within the last week
      const isWithinLastWeek = (post: ExtendedFeedViewPost) => {
        const postDate = new Date(post.post.indexedAt);
        return postDate >= oneWeekAgo;
      };

      // Helper function to check if a post mentions or replies to a user
      const checkPostInteraction = (post: ExtendedFeedViewPost, targetDid: string): boolean => {
        const record = post.post.record as PostRecord;
        const reply = post.reply as PostReplyRef | undefined;

        // Check for mentions in post text
        const hasMention = record?.text?.toLowerCase().includes(targetDid);
        
        // Check if it's a reply to the target user
        const isReply = reply?.parent?.author?.did === targetDid;

        // Check if the post is a reply in a thread started by the target user
        const isThreadParticipant = post.thread?.posts?.some(
          (threadPost: ThreadPost) => threadPost.author.did === targetDid
        );
        
        return Boolean(hasMention || isReply || isThreadParticipant);
      };

      // Check user's posts for interactions with follower
      for (const post of userPosts.data.feed) {
        if (!isWithinLastWeek(post as ExtendedFeedViewPost)) continue;
        
        if (checkPostInteraction(post as ExtendedFeedViewPost, followerDid)) {
          result.hasInteracted = true;
          result.lastInteractionDate = post.post.indexedAt;
          break;
        }
      }

      // If no interaction found, check follower's posts
      if (!result.hasInteracted) {
        for (const post of followerPosts.data.feed) {
          if (!isWithinLastWeek(post as ExtendedFeedViewPost)) continue;
          
          if (checkPostInteraction(post as ExtendedFeedViewPost, userDid)) {
            result.hasInteracted = true;
            result.lastInteractionDate = post.post.indexedAt;
            break;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error checking recent interactions:', error);
      // Return false but don't throw - this is a non-critical feature
      return { hasInteracted: false };
    }
  }
}
