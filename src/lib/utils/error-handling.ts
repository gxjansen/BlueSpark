import { XRPCError } from '@atproto/xrpc';

export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated. Please log in first.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Checks if an error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  return error instanceof XRPCError && error.status === 429;
}

/**
 * Gets a user-friendly error message
 */
function getErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) {
    return 'Too many login attempts. Please wait a moment and try again.';
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
      if (isRateLimitError(error) || error instanceof AuthenticationError) {
        throw new Error(getErrorMessage(error));
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(getErrorMessage(lastError));
}
