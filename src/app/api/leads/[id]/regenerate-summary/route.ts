import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/utils/rate-limit';
import { generateSummary } from '@/lib/ai/summarize';
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

    const rateLimit = await checkRateLimit(user.id, 'summarize');
    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);
      return NextResponse.json(errorResponses.aiRateLimited(), { status: 429, headers });
    }

    const { data: lead, error: leadError } = await (supabase as any)
      .from('leads')
      .select('name, email, company, title, source, notes, custom_fields')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(errorResponses.notFound('Lead'), { status: 404 });
    }

    const { summary, tokensUsed, latencyMs } = await generateSummary(lead);

    const { data: summaryRecord, error: insertError } = await (supabase as any)
      .from('summaries')
      .insert({
        lead_id: id,
        content: summary,
        version: 1,
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
    return NextResponse.json({ summary: summaryRecord }, { headers });
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    const headers = error instanceof Error && error.message.includes('not configured')
      ? {}
      : {};
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode, headers });
  }
}