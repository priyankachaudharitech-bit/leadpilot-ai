import { AIProvider } from './base';
import { GroqProvider } from './groq';

export type ProviderType = 'groq' | 'openai' | 'auto';

let currentProvider: AIProvider | null = null;
let currentProviderType: ProviderType = 'auto';

export function createProvider(type: ProviderType, apiKey?: string): AIProvider {
  switch (type) {
    case 'groq':
      return new GroqProvider(apiKey);
    case 'openai':
      // OpenAI provider would go here if needed
      // For now, fall back to Groq if OpenAI key not available
      if (apiKey || process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI provider not yet implemented. Use Groq for free tier.');
      }
      return new GroqProvider();
    case 'auto':
    default:
      // Auto-detect: prefer Groq (free tier), fall back to OpenAI if key exists
      if (process.env.GROQ_API_KEY || apiKey) {
        return new GroqProvider(apiKey);
      }
      if (process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI provider not yet implemented. Set GROQ_API_KEY for free tier.');
      }
      // Return unconfigured Groq provider - will fail gracefully when used
      return new GroqProvider();
  }
}

export function getProvider(): AIProvider {
  if (!currentProvider) {
    currentProvider = createProvider(currentProviderType);
  }
  return currentProvider;
}

export function setProvider(type: ProviderType, apiKey?: string): void {
  currentProvider = createProvider(type, apiKey);
  currentProviderType = type;
}

export function resetProvider(): void {
  currentProvider = null;
}

export function getCurrentProviderType(): ProviderType {
  return currentProviderType;
}

export function isProviderConfigured(): boolean {
  const provider = getProvider();
  return provider.isConfigured();
}