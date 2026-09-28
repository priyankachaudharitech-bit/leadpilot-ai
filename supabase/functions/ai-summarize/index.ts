import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummarizeRequest {
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

function buildSummarizePrompt(leadData: SummarizeRequest['leadData']): string {
  const context = [
    `Name: ${leadData.name}`,
    `Email: ${leadData.email}`,
    leadData.company ? `Company: ${leadData.company}` : null,
    leadData.title ? `Title: ${leadData.title}` : null,
    leadData.source ? `Source: ${leadData.source}` : null,
    leadData.notes ? `Notes: ${leadData.notes}` : null,
    Object.keys(leadData.custom_fields).length > 0 ? `Custom Fields: ${JSON.stringify(leadData.custom_fields)}` : null,
  ].filter(Boolean).join('\n');

  return `You are an expert sales analyst. Generate a concise 2-3 sentence summary of a lead based on their data. Focus on: key pain points, buying signals, company context, and decision-making authority. Be specific and actionable.

Lead Data:
${context}`;
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
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 300,
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
    const { leadId, leadData }: SummarizeRequest = await req.json();

    if (!leadId || !leadData) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = 'You are an expert sales analyst. Generate a concise 2-3 sentence summary of a lead based on their data. Focus on: key pain points, buying signals, company context, and decision-making authority. Be specific and actionable.';
    const userPrompt = buildSummarizePrompt(leadData);

    const { content: summary, tokensUsed, latencyMs } = await callGroqAPI(systemPrompt, userPrompt, {
      temperature: 0.3,
      maxTokens: 300,
    });

    const { error: insertError } = await supabase.from('summaries').insert({
      lead_id: leadId,
      content: summary,
      version: 1,
      model: Deno.env.get('GROQ_MODEL') || 'llama-3.1-8b-instant',
      prompt_version: 'v1',
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
    });

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ summary, tokensUsed, latencyMs }), {
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