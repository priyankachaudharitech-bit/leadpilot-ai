import { getProvider, isProviderConfigured, type GenerateTextResult } from '@/lib/ai/providers';
import { AIProviderError } from '@/lib/ai/providers/base';
import { ApiError, errorResponses } from '@/lib/utils/errors';

class AIClient {
  isConfigured(): boolean {
    return isProviderConfigured();
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: { model?: string; temperature?: number; maxTokens?: number; jsonMode?: boolean }
  ): Promise<GenerateTextResult> {
    const provider = getProvider();

    if (!provider.isConfigured()) {
      throw errorResponses.aiUnavailable();
    }

    try {
      return await provider.generateText(systemPrompt, userPrompt, options);
    } catch (error) {
      if (error instanceof AIProviderError) {
        switch (error.code) {
          case 'AI_RATE_LIMITED':
            throw errorResponses.aiRateLimited();
          case 'AI_NOT_CONFIGURED':
            throw errorResponses.aiUnavailable();
          default:
            throw new ApiError(
              error.statusCode,
              error.code,
              error.message,
              error.details
            );
        }
      }
      
      if (error instanceof ApiError) throw error;
      
      throw new ApiError(
        500,
        'AI_REQUEST_FAILED',
        error instanceof Error ? error.message : 'Failed to call AI service',
        { originalError: error }
      );
    }
  }

  getProviderName(): string {
    return getProvider().name;
  }
}

export const aiClient = new AIClient();