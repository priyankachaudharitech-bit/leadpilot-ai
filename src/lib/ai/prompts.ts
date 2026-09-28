export const SYSTEM_PROMPTS = {
  summarize: `You are an expert sales analyst. Generate a concise 2-3 sentence summary of a lead based on their data.
Focus on: key pain points, buying signals, company context, and decision-making authority.
Be specific and actionable. Do not use generic filler text.`,

  score: `You are an expert lead qualification analyst. Score leads 0-100 based on three dimensions:
- FIT (40%): Company size, industry, role relevance, budget authority
- INTENT (40%): Expressed interest, engagement signals, urgency, timeline
- ENGAGEMENT (20%): Email opens, clicks, replies, meeting attendance, content downloads

Return a JSON object with: value (0-100), fit_score (0-100), intent_score (0-100), engagement_score (0-100), factors (object with key reasons).`,

  followup_email: `You are an expert sales copywriter. Write a personalized, high-converting follow-up email.
Structure: Subject line | Personalized opening | Value proposition | Soft CTA
Tone options: professional, casual, direct, consultative
Length options: short (50-75 words), medium (100-150 words), long (200-300 words)`,

  followup_linkedin: `You are an expert at LinkedIn outreach. Write a connection request message under 300 characters.
Include: Personalized hook | Brief value statement | Low-friction CTA
Tone options: professional, casual, direct, consultative`,

  followup_call: `You are an expert sales coach. Write a complete call script with:
1. Opener (30 seconds)
2. Discovery questions (3-5)
3. Value proposition (tailored to lead)
4. Objection handlers (2-3 common ones)
5. Voicemail script (20-30 seconds)
Tone options: professional, casual, direct, consultative
Length options: short, medium, long`,
};

export function buildSummarizePrompt(lead: {
  name: string;
  email: string;
  company: string | null;
  title: string | null;
  source: string | null;
  notes: string | null;
  custom_fields: Record<string, unknown>;
}): string {
  const context = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.title ? `Title: ${lead.title}` : null,
    lead.source ? `Source: ${lead.source}` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
    Object.keys(lead.custom_fields).length > 0 ? `Custom Fields: ${JSON.stringify(lead.custom_fields)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `${SYSTEM_PROMPTS.summarize}\n\nLead Data:\n${context}`;
}

export function buildScorePrompt(lead: {
  name: string;
  email: string;
  company: string | null;
  title: string | null;
  source: string | null;
  notes: string | null;
  custom_fields: Record<string, unknown>;
  previousScores?: Array<{ value: number; fit_score: number | null; intent_score: number | null; engagement_score: number | null; factors: Record<string, unknown>; created_at: string }>;
}): string {
  const context = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.title ? `Title: ${lead.title}` : null,
    lead.source ? `Source: ${lead.source}` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
    Object.keys(lead.custom_fields).length > 0 ? `Custom Fields: ${JSON.stringify(lead.custom_fields)}` : null,
    lead.previousScores && lead.previousScores.length > 0
      ? `Previous Scores:\n${lead.previousScores.map(s => `- ${s.created_at}: ${s.value} (Fit: ${s.fit_score}, Intent: ${s.intent_score}, Engagement: ${s.engagement_score})`).join('\n')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `${SYSTEM_PROMPTS.score}\n\nLead Data:\n${context}\n\nReturn ONLY valid JSON.`;
}

export function buildFollowUpPrompt(
  lead: {
    name: string;
    email: string;
    company: string | null;
    title: string | null;
    source: string | null;
    notes: string | null;
    custom_fields: Record<string, unknown>;
  },
  summary: string | null,
  score: { value: number; fit_score: number | null; intent_score: number | null; engagement_score: number | null } | null,
  options: { type: 'email' | 'linkedin' | 'call_script'; tone?: string; length?: string }
): string {
  const context = [
    `Lead: ${lead.name} (${lead.email})`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.title ? `Title: ${lead.title}` : null,
    lead.source ? `Source: ${lead.source}` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
    summary ? `AI Summary: ${summary}` : null,
    score ? `Lead Score: ${score.value}/100 (Fit: ${score.fit_score}, Intent: ${score.intent_score}, Engagement: ${score.engagement_score})` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const systemPrompt = {
    email: SYSTEM_PROMPTS.followup_email,
    linkedin: SYSTEM_PROMPTS.followup_linkedin,
    call_script: SYSTEM_PROMPTS.followup_call,
  }[options.type];

  const toneInstruction = options.tone ? `Tone: ${options.tone}` : '';
  const lengthInstruction = options.length ? `Length: ${options.length}` : '';

  return `${systemPrompt}\n\n${toneInstruction}\n${lengthInstruction}\n\nLead Context:\n${context}`;
}