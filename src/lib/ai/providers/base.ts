export interface AIProviderConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  defaultMaxTokens: number;
  defaultTemperature: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerateTextResult {
  content: string;
  tokensUsed: number;
  latencyMs: number;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  chatCompletion(request: ChatCompletionRequest): Promise<{ content: string; usage: ChatCompletionResponse['usage'] }>;
  generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: { model?: string; temperature?: number; maxTokens?: number; jsonMode?: boolean }
  ): Promise<GenerateTextResult>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AIProviderError';
  }

  static notConfigured(providerName: string): AIProviderError {
    return new AIProviderError(
      `${providerName} AI service not configured`,
      'AI_NOT_CONFIGURED',
      503
    );
  }

  static rateLimited(providerName: string, retryAfter?: number): AIProviderError {
    return new AIProviderError(
      `${providerName} rate limit exceeded`,
      'AI_RATE_LIMITED',
      429,
      { retryAfter }
    );
  }

  static providerError(providerName: string, message: string, statusCode: number, details?: Record<string, unknown>): AIProviderError {
    return new AIProviderError(
      `${providerName} error: ${message}`,
      'AI_PROVIDER_ERROR',
      statusCode,
      details
    );
  }

  static invalidResponse(providerName: string, message: string): AIProviderError {
    return new AIProviderError(
      `${providerName} invalid response: ${message}`,
      'AI_INVALID_RESPONSE',
      500
    );
  }

  static networkError(providerName: string, message: string): AIProviderError {
    return new AIProviderError(
      `${providerName} network error: ${message}`,
      'AI_NETWORK_ERROR',
      503
    );
  }
}