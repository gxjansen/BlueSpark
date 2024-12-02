import { AuthService } from './auth';
import { PostsService } from './posts';
import { ContentAnalyzer } from '../analysis';
import type { BlueSkyCredentials, FollowerProfile, ProfileAnalysis } from '../../types/bluesky';

export class BlueSkyService {
  private static instance: BlueSkyService;
  private auth: AuthService;
  private posts: PostsService;

  private constructor() {
    this.auth = AuthService.getInstance();
    this.posts = PostsService.getInstance();
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

  async getRecentFollowers(handle: string, limit = 20, cursor?: string) {
    return this.posts.getRecentFollowers(handle, limit, cursor);
  }

  async getUserPosts(did: string, limit = 50) {
    return this.posts.getUserPosts(did, limit);
  }

  async createPost(text: string) {
    return this.posts.createPost(text);
  }

  // Analysis methods
  async analyzeProfile(profile: FollowerProfile): Promise<ProfileAnalysis> {
    return ContentAnalyzer.analyzeUserProfile(profile);
  }
}
