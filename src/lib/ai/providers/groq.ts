import { OpenAICompatibleProvider } from './openai-compatible';
import { AIProviderConfig } from './base';

export class GroqProvider extends OpenAICompatibleProvider {
  readonly name = 'Groq';

  constructor(apiKey?: string) {
    const config: AIProviderConfig = {
      apiKey: apiKey || process.env.GROQ_API_KEY || '',
      baseUrl: 'https://api.groq.com/openai/v1',
      defaultModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      defaultMaxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
      defaultTemperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    };
    super(config);
  }

  static getRecommendedModels(): string[] {
    return [
      'llama-3.1-8b-instant',      // Fast, good quality (default)
      'llama-3.1-70b-versatile',   // Higher quality, slower
      'mixtral-8x7b-32768',        // Good for reasoning
      'gemma2-9b-it',              // Efficient
      'llama-3.2-3b-preview',      // Very fast, small
    ];
  }

  static getFreeTierLimits(): { requestsPerDay: number; tokensPerMinute: number } {
    return {
      requestsPerDay: 14400,  // 14,400 requests/day free tier
      tokensPerMinute: 6000,  // 6,000 tokens/minute
    };
  }
}