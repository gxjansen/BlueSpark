import { BskyAgent } from '@atproto/api';
import { useStore } from '../store';
import { retryOperation, AuthenticationError } from '../utils/error-handling';
import type { BlueSkyCredentials } from '../../types/bluesky';

export class AuthService {
  private agent: BskyAgent;
  private static instance: AuthService;

  private constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
      persistSession: (_evt, sess) => {
        if (sess) {
          this.agent.session = sess;
        }
      },
    });
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private trackApiCall() {
    const store = useStore.getState();
    store.incrementBlueskyApiCalls();
  }

  checkAuth() {
    if (!this.agent.session) {
      throw new AuthenticationError();
    }
  }

  async login(identifier: string, password: string) {
    try {
      this.trackApiCall();
      // Only try once for login to prevent rate limiting
      const session = await this.agent.login({ identifier, password });
      return session;
    } catch (error) {
      console.error('Login error:', error);
      // Let error-handling.ts handle the error message
      throw error;
    }
  }

  async resumeSession(credentials: BlueSkyCredentials) {
    try {
      // Use retryOperation for session resume since it's less likely to hit rate limits
      const session = await retryOperation(
        () => this.login(credentials.identifier, credentials.password),
        'Resume session'
      );
      return session;
    } catch (error) {
      console.error('Failed to resume session:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.agent.session?.accessJwt;
  }

  getAgent(): BskyAgent {
    return this.agent;
  }
}
