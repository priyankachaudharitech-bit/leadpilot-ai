import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUpRequest {
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
  type: 'email' | 'linkedin' | 'call_script';
  tone?: 'professional' | 'casual' | 'direct' | 'consultative';
  length?: 'short' | 'medium' | 'long';
}

async function callGroqAPI(systemPrompt: string, userPrompt: string, options: { temperature?: number; maxTokens?: number } = {}): Promise<{ content: string; tokensUsed: number; latencyMs: number }> {
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
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 800,
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
    const { leadId, leadData, type, tone, length }: FollowUpRequest = await req.json();

    if (!leadId || !leadData || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: summary } = await supabase
      .from('summaries')
      .select('content')
      .eq('lead_id', leadId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const { data: score } = await supabase
      .from('scores')
      .select('value, fit_score, intent_score, engagement_score')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const context = [
      `Lead: ${leadData.name} (${leadData.email})`,
      leadData.company ? `Company: ${leadData.company}` : null,
      leadData.title ? `Title: ${leadData.title}` : null,
      leadData.source ? `Source: ${leadData.source}` : null,
      leadData.notes ? `Notes: ${leadData.notes}` : null,
      summary ? `AI Summary: ${summary.content}` : null,
      score ? `Lead Score: ${score.value}/100 (Fit: ${score.fit_score}, Intent: ${score.intent_score}, Engagement: ${score.engagement_score})` : null,
    ].filter(Boolean).join('\n');

    const systemPrompts: Record<string, string> = {
      email: 'You are an expert sales copywriter. Write a personalized, high-converting follow-up email. Structure: Subject line | Personalized opening | Value proposition | Soft CTA',
      linkedin: 'You are an expert at LinkedIn outreach. Write a connection request message under 300 characters. Include: Personalized hook | Brief value statement | Low-friction CTA',
      call_script: 'You are an expert sales coach. Write a complete call script with: 1. Opener (30 seconds) 2. Discovery questions (3-5) 3. Value proposition (tailored to lead) 4. Objection handlers (2-3 common ones) 5. Voicemail script (20-30 seconds)',
    };

    const systemPrompt = `${systemPrompts[type]}\nTone: ${tone || 'professional'}\nLength: ${length || 'medium'}`;

    const maxTokens = type === 'call_script' ? 1500 : 800;
    const { content, tokensUsed, latencyMs } = await callGroqAPI(systemPrompt, context, {
      temperature: 0.7,
      maxTokens,
    });

    const { error: insertError } = await supabase.from('follow_ups').insert({
      lead_id: leadId,
      type,
      content,
      tone: tone || 'professional',
      length: length || 'medium',
      model: Deno.env.get('GROQ_MODEL') || 'llama-3.1-8b-instant',
      prompt_version: 'v1',
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
    });

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ content, tokensUsed, latencyMs }), {
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