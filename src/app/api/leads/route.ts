import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { leadSchema, leadListParamsSchema } from '@/lib/validations/schemas';
import { handleApiError, errorResponses } from '@/lib/utils/errors';
import type { LeadListParams, LeadListResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(errorResponses.unauthorized(), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25,
      sort: searchParams.get('sort') || 'created_at',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!, 10) : undefined,
      maxScore: searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!, 10) : undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    const validatedParams = leadListParamsSchema.parse(params);

    const { data: leads, error } = await (supabase as any).rpc('get_leads_paginated', {
      p_user_id: user.id,
      p_page: validatedParams.page,
      p_limit: validatedParams.limit,
      p_sort: validatedParams.sort,
      p_order: validatedParams.order,
      p_search: validatedParams.search,
      p_status: validatedParams.status,
      p_min_score: validatedParams.minScore,
      p_max_score: validatedParams.maxScore,
      p_date_from: validatedParams.dateFrom,
      p_date_to: validatedParams.dateTo,
    });

    if (error) {
      throw error;
    }

    const total = leads && leads.length > 0 ? Number(leads[0].total_count) : 0;

    const response: LeadListResponse = {
      data: (leads || []).map((lead: any) => ({
        ...lead,
        summary: lead.summary,
        latest_score: lead.latest_score,
      })),
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(errorResponses.unauthorized(), { status: 401 });
    }

    const body = await request.json();
    const validatedData = leadSchema.parse(body);

    const { data: lead, error } = await (supabase as any)
      .from('leads')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(errorResponses.validationFailed({ email: 'A lead with this email already exists' }), { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode });
  }
}