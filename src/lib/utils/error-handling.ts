import toast from 'react-hot-toast';

export class RateLimitError extends Error {
  constructor(message: string, public retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Not authenticated. Please log in first.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export function handleApiError(error: any, context: string) {
  console.error(`${context} error:`, error);

  if (error.status === 429) {
    const retryAfter = parseInt(error.headers?.['retry-after'] || '60', 10);
    throw new RateLimitError(
      `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter
    );
  }

  if (error.status === 502 || error.status === 503 || error.status === 504) {
    throw new ServiceUnavailableError(
      'BlueSky service is temporarily unavailable. Please try again in a few moments.'
    );
  }

  throw error;
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: any;
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      try {
        handleApiError(error, context);
      } catch (handledError) {
        if (handledError instanceof RateLimitError) {
          toast.error(`Rate limit reached. Please wait ${handledError.retryAfter} seconds.`);
          throw handledError;
        }

        if (handledError instanceof AuthenticationError || 
            error.message?.includes('Not authenticated')) {
          throw handledError;
        }

        if (error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (handledError instanceof ServiceUnavailableError) {
          if (i === 0) {
            toast.error('BlueSky service temporarily unavailable. Retrying...');
          }
          console.log(`Retry attempt ${i + 1} for ${context}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  toast.error('Failed to connect to BlueSky. Please try again later.');
  throw lastError;
}
