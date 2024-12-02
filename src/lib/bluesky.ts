import { BskyAgent, AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';
import { useStore } from './store';
import toast from 'react-hot-toast';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
type PostView = AppBskyFeedDefs.PostView;
type PostRecord = AppBskyFeedPost.Record;

// Custom error types
class RateLimitError extends Error {
  constructor(message: string, public retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class ServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export interface RecentInteraction {
  hasInteracted: boolean;
  lastInteractionDate?: string;
}

interface PostAuthor {
  did: string;
}

interface ReplyRef {
  parent: {
    author: PostAuthor;
  };
}

export class BlueSkyService {
  private agent: BskyAgent;
  private static instance: BlueSkyService;

  private constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
      persistSession: (evt, sess) => {
        if (sess) {
          this.agent.session = sess;
        }
      },
    });
  }

  static getInstance(): BlueSkyService {
    if (!BlueSkyService.instance) {
      BlueSkyService.instance = new BlueSkyService();
    }
    return BlueSkyService.instance;
  }

  private checkAuth() {
    if (!this.agent.session) {
      throw new Error('Not authenticated. Please log in first.');
    }
  }

  private trackApiCall() {
    const store = useStore.getState();
    store.incrementBlueskyApiCalls();
  }

  private handleApiError(error: any, context: string) {
    console.error(`${context} error:`, error);

    if (error.status === 429) {
      const retryAfter = parseInt(error.headers?.['retry-after'] || '60', 10);
      throw new RateLimitError(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter
      );
    }

    if (error.status === 502 || error.status === 503 || error.status === 504) {
      throw new ServiceUnavailableError(
        'BlueSky service is temporarily unavailable. Please try again in a few moments.'
      );
    }

    throw error;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> {
    let lastError: any;
    let delay = initialDelay;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        try {
          this.handleApiError(error, context);
        } catch (handledError) {
          if (handledError instanceof RateLimitError) {
            toast.error(`Rate limit reached. Please wait ${handledError.retryAfter} seconds.`);
            throw handledError;
          }

          if (error.message?.includes('Not authenticated')) {
            throw error;
          }

          if (error.status && error.status >= 400 && error.status < 500) {
            throw error;
          }

          if (handledError instanceof ServiceUnavailableError) {
            if (i === 0) {
              toast.error('BlueSky service temporarily unavailable. Retrying...');
            }
            console.log(`Retry attempt ${i + 1} for ${context}...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
        }

        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    toast.error('Failed to connect to BlueSky. Please try again later.');
    throw lastError;
  }

  async checkRecentInteractions(userDid: string, followerDid: string): Promise<RecentInteraction> {
    try {
      this.checkAuth();
      this.trackApiCall();

      // Get posts from the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get user's recent posts
      const userPosts = await this.retryOperation(
        () => this.agent.getAuthorFeed({ actor: userDid }),
        `Get recent posts for ${userDid}`
      );

      // Get follower's recent posts
      const followerPosts = await this.retryOperation(
        () => this.agent.getAuthorFeed({ actor: followerDid }),
        `Get recent posts for ${followerDid}`
      );

      const result: RecentInteraction = { hasInteracted: false };

      // Helper function to check if a post is within the last week
      const isWithinLastWeek = (post: FeedViewPost) => {
        const postDate = new Date(post.post.indexedAt);
        return postDate >= oneWeekAgo;
      };

      // Helper function to check if a post mentions or replies to a user
      const checkPostInteraction = (post: FeedViewPost, targetDid: string): boolean => {
        const record = post.post.record as PostRecord;
        const reply = post.reply as ReplyRef | undefined;
        
        // Check for mentions in post text
        const hasMention = record?.text?.toLowerCase().includes(targetDid);
        
        // Check if it's a reply to the target user
        const isReply = reply?.parent?.author?.did === targetDid;
        
        return Boolean(hasMention || isReply);
      };

      // Check user's posts for interactions with follower
      for (const post of userPosts.data.feed) {
        if (!isWithinLastWeek(post)) continue;
        
        if (checkPostInteraction(post, followerDid)) {
          result.hasInteracted = true;
          result.lastInteractionDate = post.post.indexedAt;
          break;
        }
      }

      // If no interaction found, check follower's posts
      if (!result.hasInteracted) {
        for (const post of followerPosts.data.feed) {
          if (!isWithinLastWeek(post)) continue;
          
          if (checkPostInteraction(post, userDid)) {
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

  async login(identifier: string, password: string) {
    try {
      this.trackApiCall();
      const session = await this.retryOperation(
        () => this.agent.login({ identifier, password }),
        'Login'
      );
      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please check your credentials.');
    }
  }

  async resumeSession(credentials: { identifier: string; password: string }) {
    try {
      return await this.login(credentials.identifier, credentials.password);
    } catch (error) {
      console.error('Failed to resume session:', error);
      throw error;
    }
  }

  async getProfile(handle: string) {
    try {
      this.checkAuth();
      this.trackApiCall();
      const profile = await this.retryOperation(
        () => this.agent.getProfile({ actor: handle }),
        `Get profile for ${handle}`
      );
      if (!profile?.data) {
        throw new Error('Failed to fetch profile');
      }
      return profile.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error(`Failed to fetch profile for ${handle}`);
    }
  }

  async getRecentFollowers(handle: string, limit = 20) {
    try {
      this.checkAuth();
      this.trackApiCall();
      const followers = await this.retryOperation(
        () => this.agent.getFollowers({
          actor: handle,
          limit: limit
        }),
        `Get followers for ${handle}`
      );
      if (!followers?.data?.followers) {
        throw new Error('Failed to fetch followers');
      }
      return followers.data.followers;
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw new Error('Failed to fetch recent followers');
    }
  }

  async getUserPosts(did: string, limit = 50) {
    try {
      this.checkAuth();
      this.trackApiCall();
      const feed = await this.retryOperation(
        () => this.agent.getAuthorFeed({
          actor: did,
          limit: limit
        }),
        `Get posts for ${did}`
      );
      if (!feed?.data?.feed) {
        throw new Error('Failed to fetch user posts');
      }
      return feed.data.feed;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw new Error(`Failed to fetch posts for user ${did}`);
    }
  }

  async createPost(text: string) {
    try {
      this.checkAuth();
      this.trackApiCall();
      await this.retryOperation(
        () => this.agent.post({
          text,
          createdAt: new Date().toISOString(),
        }),
        'Create post'
      );
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post. Please try again.');
    }
  }

  isAuthenticated(): boolean {
    return !!this.agent.session;
  }
}
