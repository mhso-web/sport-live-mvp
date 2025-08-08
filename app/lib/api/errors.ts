export class ApiError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code || 'API_ERROR',
        message: error.message,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    },
  };
};