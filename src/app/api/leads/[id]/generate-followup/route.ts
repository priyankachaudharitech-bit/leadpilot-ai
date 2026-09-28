import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/utils/rate-limit';
import { generateFollowUp, type FollowUpType, type FollowUpTone, type FollowUpLength } from '@/lib/ai/followup';
import { handleApiError, errorResponses } from '@/lib/utils/errors';

interface GenerateFollowUpRequest {
  type: FollowUpType;
  tone?: FollowUpTone;
  length?: FollowUpLength;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(errorResponses.unauthorized(), { status: 401 });
    }

    const rateLimit = await checkRateLimit(user.id, 'followup');
    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);
      return NextResponse.json(errorResponses.aiRateLimited(), { status: 429, headers });
    }

    const body = await request.json() as GenerateFollowUpRequest;
    const { type, tone, length } = body;

    if (!['email', 'linkedin', 'call_script'].includes(type)) {
      return NextResponse.json(errorResponses.validationFailed({ type: 'Invalid follow-up type' }), { status: 400 });
    }

    const { data: lead, error: leadError } = await (supabase as any)
      .from('leads')
      .select('name, email, company, title, source, notes, custom_fields, score')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(errorResponses.notFound('Lead'), { status: 404 });
    }

    const { data: summary } = await (supabase as any)
      .from('summaries')
      .select('content')
      .eq('lead_id', id)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const { data: score } = await (supabase as any)
      .from('scores')
      .select('value, fit_score, intent_score, engagement_score')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { content, tokensUsed, latencyMs } = await generateFollowUp(lead, summary?.content || null, score || null, {
      type,
      tone,
      length,
    });

    const { data: followUpRecord, error: insertError } = await (supabase as any)
      .from('follow_ups')
      .insert({
        lead_id: id,
        type,
        content,
        tone: tone || 'professional',
        length: length || 'medium',
        model: 'gpt-4o-mini',
        prompt_version: 'v1',
        tokens_used: tokensUsed,
        latency_ms: latencyMs,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);
    return NextResponse.json({ follow_up: followUpRecord }, { headers });
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode });
  }
}