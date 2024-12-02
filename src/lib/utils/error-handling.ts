import { XRPCError } from '@atproto/xrpc';

export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated. Please log in first.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many login attempts. Please wait a few minutes and try again.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Checks if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  return error instanceof XRPCError && error.status === 429;
}

/**
 * Gets a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) {
    return new RateLimitError().message;
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
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `${operationName} failed (attempt ${attempt + 1}/${maxRetries}):`,
        error
      );
      
      // Don't retry rate limit or authentication errors
      if (isRateLimitError(error)) {
        throw new RateLimitError();
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
