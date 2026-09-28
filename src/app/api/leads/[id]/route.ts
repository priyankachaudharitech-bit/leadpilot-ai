import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { leadUpdateSchema } from '@/lib/validations/schemas';
import { handleApiError, errorResponses } from '@/lib/utils/errors';
import type { LeadWithInsights } from '@/types';

export async function GET(
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

    const { data: lead, error } = await (supabase as any).rpc('get_lead_with_insights', {
      lead_uuid: id,
    });

    if (error) {
      throw error;
    }

    if (!lead) {
      return NextResponse.json(errorResponses.notFound('Lead'), { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode });
  }
}

export async function PATCH(
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

    const body = await request.json();
    const validatedData = leadUpdateSchema.parse(body);

    const { data: existingLead } = await (supabase as any)
      .from('leads')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingLead) {
      return NextResponse.json(errorResponses.notFound('Lead'), { status: 404 });
    }

    const { data: lead, error } = await (supabase as any)
      .from('leads')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(errorResponses.validationFailed({ email: 'A lead with this email already exists' }), { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(lead);
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode });
  }
}

export async function DELETE(
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

    const { data: existingLead } = await (supabase as any)
      .from('leads')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingLead) {
      return NextResponse.json(errorResponses.notFound('Lead'), { status: 404 });
    }

    const { error } = await (supabase as any)
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    const { statusCode, code, message, details } = handleApiError(error);
    return NextResponse.json({ error: { code, message, details } }, { status: statusCode });
  }
}