import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/utils/rate-limit';
import { generateScore } from '@/lib/ai/score';
import { handleApiError, errorResponses } from '@/lib/utils/errors';

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

    const rateLimit = await checkRateLimit(user.id, 'score');
    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);
      return NextResponse.json(errorResponses.aiRateLimited(), { status: 429, headers });
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

    const { data: previousScores } = await (supabase as any)
      .from('scores')
      .select('value, fit_score, intent_score, engagement_score, factors, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { value, fit_score, intent_score, engagement_score, factors, tokensUsed, latencyMs } =
      await generateScore(lead, previousScores || []);

    const { data: scoreRecord, error: insertError } = await (supabase as any)
      .from('scores')
      .insert({
        lead_id: id,
        value,
        fit_score,
        intent_score,
        engagement_score,
        factors,
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

    await (supabase as any)
      .from('leads')
      .update({ score: value })
      .eq('id', id)
      .eq('user_id', user.id);

    const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);
    return NextResponse.json({ score: scoreRecord }, { headers });
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode });
  }
}