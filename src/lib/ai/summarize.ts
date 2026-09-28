import { aiClient } from '@/lib/ai/client';
import { buildSummarizePrompt } from '@/lib/ai/prompts';
import type { Lead } from '@/types';

export interface SummarizeResult {
  summary: string;
  tokensUsed: number;
  latencyMs: number;
}

export async function generateSummary(lead: Pick<Lead, 'name' | 'email' | 'company' | 'title' | 'source' | 'notes' | 'custom_fields'>): Promise<SummarizeResult> {
  if (!aiClient.isConfigured()) {
    throw new Error('AI service not configured');
  }

  const prompt = buildSummarizePrompt(lead);
  const result = await aiClient.generateText(
    'You are an expert sales analyst. Generate a concise 2-3 sentence summary of a lead based on their data. Focus on: key pain points, buying signals, company context, and decision-making authority. Be specific and actionable.',
    prompt,
    { temperature: 0.3, maxTokens: 300 }
  );

  return {
    summary: result.content.trim(),
    tokensUsed: result.tokensUsed,
    latencyMs: result.latencyMs,
  };
}

export async function generateSummaryWithFallback(
  lead: Pick<Lead, 'name' | 'email' | 'company' | 'title' | 'source' | 'notes' | 'custom_fields'>,
  cachedSummary: string | null
): Promise<{ summary: string; fromCache: boolean; tokensUsed: number; latencyMs: number }> {
  try {
    const result = await generateSummary(lead);
    return { summary: result.summary, fromCache: false, tokensUsed: result.tokensUsed, latencyMs: result.latencyMs };
  } catch (error) {
    if (cachedSummary) {
      return { summary: cachedSummary, fromCache: true, tokensUsed: 0, latencyMs: 0 };
    }
    throw error;
  }
}