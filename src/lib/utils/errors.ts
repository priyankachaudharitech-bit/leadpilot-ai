export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createApiError = (
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): ApiError => {
  return new ApiError(statusCode, code, message, details);
};

export const handleApiError = (error: unknown): { statusCode: number; code: string; message: string; details?: unknown } => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return {
        statusCode: 409,
        code: 'CONFLICT',
        message: 'A record with this value already exists',
        details: error.message,
      };
    }

    if (error.message.includes('foreign key') || error.message.includes('constraint')) {
      return {
        statusCode: 400,
        code: 'INVALID_REFERENCE',
        message: 'Invalid reference to related resource',
        details: error.message,
      };
    }

    return {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  };
};

export const errorResponses = {
  unauthorized: () => createApiError(401, 'UNAUTHORIZED', 'Authentication required'),
  forbidden: () => createApiError(403, 'FORBIDDEN', 'Insufficient permissions'),
  notFound: (resource = 'Resource') => createApiError(404, 'NOT_FOUND', `${resource} not found`),
  validationFailed: (details?: unknown) => createApiError(400, 'VALIDATION_ERROR', 'Validation failed', details),
  rateLimited: () => createApiError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.'),
  internal: (message = 'Internal server error', details?: unknown) =>
    createApiError(500, 'INTERNAL_ERROR', message, details),
  aiUnavailable: () => createApiError(503, 'AI_UNAVAILABLE', 'AI service is temporarily unavailable. Please try again later.'),
  aiRateLimited: () => createApiError(429, 'AI_RATE_LIMITED', 'AI request limit exceeded. Please wait before trying again.'),
};