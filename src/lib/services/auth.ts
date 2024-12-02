import { BskyAgent } from '@atproto/api';
import { XRPCError } from '@atproto/xrpc';
import { useStore } from '../store';
import { retryOperation, AuthenticationError, RateLimitError, isRateLimitError } from '../utils/error-handling';
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
      // Don't retry on login to prevent rate limiting
      const response = await this.agent.login({ identifier, password });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Check if it's a rate limit error
      if (error instanceof XRPCError && error.status === 429) {
        const retryAfter = error.headers?.['retry-after'];
        const minutes = retryAfter ? Math.ceil(parseInt(retryAfter, 10) / 60) : undefined;
        const message = minutes
          ? `Rate limit exceeded. Please wait ${minutes} minutes before trying again.`
          : 'Rate limit exceeded. Please wait a few minutes before trying again.';
        throw new RateLimitError(message, minutes ? minutes * 60 : undefined);
      }
      // Re-throw the original error
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
