import { aiClient } from '@/lib/ai/client';
import { buildScorePrompt } from '@/lib/ai/prompts';
import type { Lead } from '@/types';

export interface ScoreResult {
  value: number;
  fit_score: number;
  intent_score: number;
  engagement_score: number;
  factors: Record<string, unknown>;
  tokensUsed: number;
  latencyMs: number;
}

export async function generateScore(
  lead: Pick<Lead, 'name' | 'email' | 'company' | 'title' | 'source' | 'notes' | 'custom_fields'>,
  previousScores?: Array<{ value: number; fit_score: number | null; intent_score: number | null; engagement_score: number | null; factors: Record<string, unknown>; created_at: string }>
): Promise<ScoreResult> {
  if (!aiClient.isConfigured()) {
    throw new Error('AI service not configured');
  }

  const prompt = buildScorePrompt({ ...lead, previousScores });
  const result = await aiClient.generateText(
    'You are an expert lead qualification analyst. Score leads 0-100 based on three dimensions:\n- FIT (40%): Company size, industry, role relevance, budget authority\n- INTENT (40%): Expressed interest, engagement signals, urgency, timeline\n- ENGAGEMENT (20%): Email opens, clicks, replies, meeting attendance, content downloads\n\nReturn a JSON object with: value (0-100), fit_score (0-100), intent_score (0-100), engagement_score (0-100), factors (object with key reasons).',
    prompt,
    { temperature: 0.2, maxTokens: 500, jsonMode: true }
  );

  let parsed: ScoreResult;
  try {
    parsed = JSON.parse(result.content);
  } catch {
    throw new Error('Invalid JSON response from AI');
  }

  if (
    typeof parsed.value !== 'number' ||
    parsed.value < 0 ||
    parsed.value > 100 ||
    typeof parsed.fit_score !== 'number' ||
    typeof parsed.intent_score !== 'number' ||
    typeof parsed.engagement_score !== 'number'
  ) {
    throw new Error('Invalid score values from AI');
  }

  return {
    ...parsed,
    tokensUsed: result.tokensUsed,
    latencyMs: result.latencyMs,
  };
}

export function classifyScore(value: number): 'hot' | 'warm' | 'cold' {
  if (value >= 70) return 'hot';
  if (value >= 40) return 'warm';
  return 'cold';
}

export function getScoreColor(value: number): string {
  if (value >= 70) return 'success';
  if (value >= 40) return 'warning';
  return 'error';
}