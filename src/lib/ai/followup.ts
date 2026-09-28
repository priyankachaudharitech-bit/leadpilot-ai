import { aiClient } from '@/lib/ai/client';
import { buildFollowUpPrompt } from '@/lib/ai/prompts';
import type { Lead } from '@/types';

export type FollowUpType = 'email' | 'linkedin' | 'call_script';
export type FollowUpTone = 'professional' | 'casual' | 'direct' | 'consultative';
export type FollowUpLength = 'short' | 'medium' | 'long';

export interface FollowUpResult {
  content: string;
  tokensUsed: number;
  latencyMs: number;
}

export async function generateFollowUp(
  lead: Pick<Lead, 'name' | 'email' | 'company' | 'title' | 'source' | 'notes' | 'custom_fields'>,
  summary: string | null,
  score: { value: number; fit_score: number | null; intent_score: number | null; engagement_score: number | null } | null,
  options: { type: FollowUpType; tone?: FollowUpTone; length?: FollowUpLength }
): Promise<FollowUpResult> {
  if (!aiClient.isConfigured()) {
    throw new Error('AI service not configured');
  }

  const prompt = buildFollowUpPrompt(lead, summary, score, options);
  const systemPrompt = {
    email: 'You are an expert sales copywriter. Write a personalized, high-converting follow-up email. Structure: Subject line | Personalized opening | Value proposition | Soft CTA',
    linkedin: 'You are an expert at LinkedIn outreach. Write a connection request message under 300 characters. Include: Personalized hook | Brief value statement | Low-friction CTA',
    call_script: 'You are an expert sales coach. Write a complete call script with: 1. Opener (30 seconds) 2. Discovery questions (3-5) 3. Value proposition (tailored to lead) 4. Objection handlers (2-3 common ones) 5. Voicemail script (20-30 seconds)',
  }[options.type];

  const toneInstruction = options.tone ? `Tone: ${options.tone}` : 'Tone: professional';
  const lengthInstruction = options.length ? `Length: ${options.length}` : '';

  const fullSystemPrompt = `${systemPrompt}\n${toneInstruction}\n${lengthInstruction}`;

  const result = await aiClient.generateText(
    fullSystemPrompt,
    prompt,
    { temperature: 0.7, maxTokens: options.type === 'call_script' ? 1500 : 800 }
  );

  return {
    content: result.content.trim(),
    tokensUsed: result.tokensUsed,
    latencyMs: result.latencyMs,
  };
}