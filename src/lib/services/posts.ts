import { AppBskyFeedDefs } from '@atproto/api';
import { AuthService } from './auth';
import { retryOperation } from '../utils/error-handling';
import { useStore } from '../store';

type FeedViewPost = AppBskyFeedDefs.FeedViewPost;

export class PostsService {
  private static instance: PostsService;
  private auth: AuthService;

  private constructor() {
    this.auth = AuthService.getInstance();
  }

  static getInstance(): PostsService {
    if (!PostsService.instance) {
      PostsService.instance = new PostsService();
    }
    return PostsService.instance;
  }

  private trackApiCall() {
    const store = useStore.getState();
    store.incrementBlueskyApiCalls();
  }

  async getUserPosts(did: string, limit = 50): Promise<FeedViewPost[]> {
    try {
      this.auth.checkAuth();
      this.trackApiCall();
      
      const feed = await retryOperation(
        () => this.auth.getAgent().getAuthorFeed({
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

  async createPost(text: string): Promise<boolean> {
    try {
      this.auth.checkAuth();
      this.trackApiCall();

      await retryOperation(
        () => this.auth.getAgent().post({
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

  async getProfile(handle: string) {
    try {
      this.auth.checkAuth();
      this.trackApiCall();

      const profile = await retryOperation(
        () => this.auth.getAgent().getProfile({ actor: handle }),
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
      this.auth.checkAuth();
      this.trackApiCall();

      const followers = await retryOperation(
        () => this.auth.getAgent().getFollowers({
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
}