import { BskyAgent } from '@atproto/api';

export class BlueSkyService {
  private agent: BskyAgent;
  private static instance: BlueSkyService;

  private constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
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

  async login(identifier: string, password: string) {
    try {
      const session = await this.agent.login({ identifier, password });
      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please check your credentials.');
    }
  }

  async getProfile(handle: string) {
    try {
      this.checkAuth();
      // Using app.bsky.actor.getProfile
      const profile = await this.agent.getProfile({ actor: handle });
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
      // Using app.bsky.graph.getFollowers
      const followers = await this.agent.getFollowers({
        actor: handle,
        limit: limit
      });
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
      // Using app.bsky.feed.getAuthorFeed
      const feed = await this.agent.getAuthorFeed({
        actor: did,
        limit: limit
      });
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
      // Using app.bsky.feed.post
      const result = await this.agent.post({
        text,
        createdAt: new Date().toISOString(),
      });
      
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
