import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScoreRequest {
  leadId: string;
  leadData: {
    name: string;
    email: string;
    company: string | null;
    title: string | null;
    source: string | null;
    notes: string | null;
    custom_fields: Record<string, unknown>;
  };
}

function buildScorePrompt(leadData: ScoreRequest['leadData'], previousScores: Array<{ value: number; fit_score: number | null; intent_score: number | null; engagement_score: number | null; factors: Record<string, unknown>; created_at: string }>): string {
  const context = [
    `Name: ${leadData.name}`,
    `Email: ${leadData.email}`,
    leadData.company ? `Company: ${leadData.company}` : null,
    leadData.title ? `Title: ${leadData.title}` : null,
    leadData.source ? `Source: ${leadData.source}` : null,
    leadData.notes ? `Notes: ${leadData.notes}` : null,
    Object.keys(leadData.custom_fields).length > 0 ? `Custom Fields: ${JSON.stringify(leadData.custom_fields)}` : null,
    previousScores && previousScores.length > 0
      ? `Previous Scores:\n${previousScores.map(s => `- ${s.created_at}: ${s.value} (Fit: ${s.fit_score}, Intent: ${s.intent_score}, Engagement: ${s.engagement_score})`).join('\n')}`
      : null,
  ].filter(Boolean).join('\n');

  return `You are an expert lead qualification analyst. Score leads 0-100 based on three dimensions:
- FIT (40%): Company size, industry, role relevance, budget authority
- INTENT (40%): Expressed interest, engagement signals, urgency, timeline
- ENGAGEMENT (20%): Email opens, clicks, replies, meeting attendance, content downloads

Return ONLY valid JSON with: value (0-100), fit_score (0-100), intent_score (0-100), engagement_score (0-100), factors (object with key reasons).

Lead Data:
${context}

Return ONLY valid JSON.`;
}

async function callGroqAPI(systemPrompt: string, userPrompt: string, options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}): Promise<{ content: string; tokensUsed: number; latencyMs: number }> {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  const model = Deno.env.get('GROQ_MODEL') || 'llama-3.1-8b-instant';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const startTime = Date.now();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 500,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error(`Groq API error: ${error.error?.message || response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content?.trim() || '';
  const tokensUsed = data.usage?.total_tokens || 0;

  if (!content) {
    throw new Error('Empty response from AI');
  }

  return { content, tokensUsed, latencyMs };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { leadId, leadData }: ScoreRequest = await req.json();

    if (!leadId || !leadData) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: previousScores } = await supabase
      .from('scores')
      .select('value, fit_score, intent_score, engagement_score, factors, created_at')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(5);

    const systemPrompt = `You are an expert lead qualification analyst. Score leads 0-100 based on three dimensions:
- FIT (40%): Company size, industry, role relevance, budget authority
- INTENT (40%): Expressed interest, engagement signals, urgency, timeline
- ENGAGEMENT (20%): Email opens, clicks, replies, meeting attendance, content downloads

Return a JSON object with: value (0-100), fit_score (0-100), intent_score (0-100), engagement_score (0-100), factors (object with key reasons).`;
    const userPrompt = buildScorePrompt(leadData, previousScores || []);

    const { content, tokensUsed, latencyMs } = await callGroqAPI(systemPrompt, userPrompt, {
      temperature: 0.2,
      maxTokens: 500,
      jsonMode: true,
    });

    let parsed: { value: number; fit_score: number; intent_score: number; engagement_score: number; factors: Record<string, unknown> };
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON response from AI');
    }

    if (
      typeof parsed.value !== 'number' || parsed.value < 0 || parsed.value > 100 ||
      typeof parsed.fit_score !== 'number' ||
      typeof parsed.intent_score !== 'number' ||
      typeof parsed.engagement_score !== 'number'
    ) {
      throw new Error('Invalid score values from AI');
    }

    const { error: insertError } = await supabase.from('scores').insert({
      lead_id: leadId,
      value: parsed.value,
      fit_score: parsed.fit_score,
      intent_score: parsed.intent_score,
      engagement_score: parsed.engagement_score,
      factors: parsed.factors || {},
      model: Deno.env.get('GROQ_MODEL') || 'llama-3.1-8b-instant',
      prompt_version: 'v1',
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
    });

    if (insertError) {
      throw insertError;
    }

    await supabase.from('leads').update({ score: parsed.value }).eq('id', leadId);

    return new Response(JSON.stringify({ ...parsed, tokensUsed, latencyMs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    let status = 500;
    if (message === 'RATE_LIMITED') status = 429;
    if (message.includes('not configured')) status = 503;
    
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});