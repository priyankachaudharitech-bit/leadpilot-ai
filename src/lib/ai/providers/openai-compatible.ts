import { AIProvider, AIProviderConfig, AIProviderError, ChatCompletionRequest, ChatCompletionResponse, GenerateTextResult } from './base';

export abstract class OpenAICompatibleProvider implements AIProvider {
  abstract readonly name: string;
  protected readonly config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.trim().length > 0;
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<{ content: string; usage: ChatCompletionResponse['usage'] }> {
    if (!this.isConfigured()) {
      throw AIProviderError.notConfigured(this.name);
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.config.defaultModel,
          messages: request.messages,
          temperature: request.temperature ?? this.config.defaultTemperature,
          max_tokens: request.max_tokens ?? this.config.defaultMaxTokens,
          response_format: request.response_format,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          throw AIProviderError.rateLimited(this.name, retryAfter ? parseInt(retryAfter, 10) : undefined);
        }
        
        if (response.status === 401) {
          throw AIProviderError.providerError(this.name, 'Invalid API key', 401);
        }
        
        if (response.status === 402) {
          throw AIProviderError.providerError(this.name, 'Insufficient credits/quota', 402);
        }

        throw AIProviderError.providerError(
          this.name,
          errorData.error?.message || `HTTP ${response.status}`,
          response.status,
          { latencyMs, ...errorData }
        );
      }

      const data = await response.json() as ChatCompletionResponse;

      const content = data.choices[0]?.message?.content || '';
      if (!content) {
        throw AIProviderError.invalidResponse(this.name, 'Empty response content');
      }

      return {
        content,
        usage: data.usage,
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw AIProviderError.networkError(this.name, error.message);
      }
      
      throw AIProviderError.providerError(
        this.name,
        error instanceof Error ? error.message : 'Unknown error',
        500,
        { originalError: error }
      );
    }
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: { model?: string; temperature?: number; maxTokens?: number; jsonMode?: boolean }
  ): Promise<GenerateTextResult> {
    const startTime = Date.now();

    const result = await this.chatCompletion({
      model: options?.model || this.config.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? this.config.defaultTemperature,
      max_tokens: options?.maxTokens ?? this.config.defaultMaxTokens,
      response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
    });

    return {
      content: result.content,
      tokensUsed: result.usage?.total_tokens || 0,
      latencyMs: Date.now() - startTime,
    };
  }
}