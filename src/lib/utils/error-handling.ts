export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated. Please log in first.') {
    super(message);
    this.name = 'AuthenticationError';
  }
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
      
      // Don't retry authentication errors
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
}
