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
      persistSession: (evt, sess) => {
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
      const session = await retryOperation(
        () => this.agent.login({ identifier, password }),
        'Login'
      );
      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please check your credentials.');
    }
  }

  async resumeSession(credentials: BlueSkyCredentials) {
    try {
      const session = await this.login(credentials.identifier, credentials.password);
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
