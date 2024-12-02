import { XRPCError } from '@atproto/xrpc';

export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated. Please log in first.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  public retryAfter?: number;

  constructor(message = 'Too many requests. Please wait a few minutes and try again.', retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

type HeadersLike = Headers | Record<string, any>;

/**
 * Parse rate limit information from response headers
 */
export function parseRateLimitHeaders(headers: HeadersLike): {
  limit: number;
  remaining: number;
  reset: number;
} | null {
  try {
    // Handle both Headers object and plain header object
    const getValue = (key: string): string | null => {
      if (headers instanceof Headers) {
        return headers.get(key);
      }
      return headers[key]?.toString() || null;
    };

    const limitStr = getValue('ratelimit-limit');
    const remainingStr = getValue('ratelimit-remaining');
    const resetStr = getValue('ratelimit-reset');

    if (!limitStr || !remainingStr || !resetStr) {
      return null;
    }

    const limit = parseInt(limitStr, 10);
    const remaining = parseInt(remainingStr, 10);
    const reset = parseInt(resetStr, 10);

    if (!isNaN(limit) && !isNaN(remaining) && !isNaN(reset)) {
      return { limit, remaining, reset };
    }
  } catch (error) {
    console.debug('No rate limit headers found');
  }

  return null;
}

/**
 * Checks if an error is a rate limit error and extracts retry-after if available
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof XRPCError && error.status === 429) {
    // Try to get retry-after header if available
    const retryAfter = error.headers && typeof error.headers === 'object' 
      ? (error.headers as Record<string, string>)['retry-after']
      : undefined;

    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        throw new RateLimitError(
          `Rate limit exceeded. Please wait ${Math.ceil(seconds / 60)} minutes before trying again.`,
          seconds
        );
      }
    }
    return true;
  }
  return false;
}

/**
 * Gets a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof RateLimitError) {
    return error.message;
  }
  if (error instanceof AuthenticationError) {
    return error.message;
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
}

/**
 * Retries an async operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await operation();
      
      // Check rate limit headers on successful response
      if (result && typeof result === 'object' && 'headers' in result) {
        const headers = result.headers;
        if (headers && (headers instanceof Headers || typeof headers === 'object')) {
          const rateLimits = parseRateLimitHeaders(headers);
          if (rateLimits && rateLimits.remaining === 0) {
            throw new RateLimitError(
              `Rate limit reached. Please wait ${Math.ceil(rateLimits.reset / 60)} minutes before trying again.`,
              rateLimits.reset
            );
          }
        }
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `${operationName} failed (attempt ${attempt + 1}/${maxRetries}):`,
        error
      );
      
      // Don't retry rate limit or authentication errors
      if (error instanceof RateLimitError) {
        throw error;
      }
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(getErrorMessage(lastError));
}
