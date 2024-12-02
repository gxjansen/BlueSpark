import { AuthService } from './auth';
import { PostsService } from './posts';
import { InteractionsService } from './interactions';
import { ContentAnalyzer } from '../analysis';
import type { RecentInteraction, BlueSkyCredentials, FollowerProfile, ProfileAnalysis } from '../../types/bluesky';

export class BlueSkyService {
  private static instance: BlueSkyService;
  private auth: AuthService;
  private posts: PostsService;
  private interactions: InteractionsService;

  private constructor() {
    this.auth = AuthService.getInstance();
    this.posts = PostsService.getInstance();
    this.interactions = InteractionsService.getInstance();
  }

  static getInstance(): BlueSkyService {
    if (!BlueSkyService.instance) {
      BlueSkyService.instance = new BlueSkyService();
    }
    return BlueSkyService.instance;
  }

  // Auth methods
  async login(identifier: string, password: string) {
    return this.auth.login(identifier, password);
  }

  async resumeSession(credentials: BlueSkyCredentials) {
    return this.auth.resumeSession(credentials);
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  // Posts methods
  async getProfile(handle: string) {
    return this.posts.getProfile(handle);
  }

  async getRecentFollowers(handle: string, limit = 20) {
    return this.posts.getRecentFollowers(handle, limit);
  }

  async getUserPosts(did: string, limit = 50) {
    return this.posts.getUserPosts(did, limit);
  }

  async createPost(text: string) {
    return this.posts.createPost(text);
  }

  // Interactions methods
  async checkRecentInteractions(userDid: string, followerDid: string): Promise<RecentInteraction> {
    return this.interactions.checkRecentInteractions(userDid, followerDid);
  }

  // Analysis methods
  async analyzeProfile(profile: FollowerProfile): Promise<ProfileAnalysis> {
    return ContentAnalyzer.analyzeUserProfile(profile);
  }
}
