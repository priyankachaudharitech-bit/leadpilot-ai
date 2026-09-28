-- Migration 004: Additional Database Functions
-- Creates helper functions for AI operations and data access

-- Function to get lead with all AI insights
CREATE OR REPLACE FUNCTION public.get_lead_with_insights(lead_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', l.id,
    'user_id', l.user_id,
    'name', l.name,
    'email', l.email,
    'company', l.company,
    'title', l.title,
    'source', l.source,
    'status', l.status,
    'notes', l.notes,
    'custom_fields', l.custom_fields,
    'score', l.score,
    'last_activity_at', l.last_activity_at,
    'created_at', l.created_at,
    'updated_at', l.updated_at,
    'deleted_at', l.deleted_at,
    'summary', (
      SELECT jsonb_build_object(
        'id', s.id,
        'content', s.content,
        'version', s.version,
        'model', s.model,
        'created_at', s.created_at
      )
      FROM public.summaries s
      WHERE s.lead_id = l.id
      ORDER BY s.version DESC
      LIMIT 1
    ),
    'latest_score', (
      SELECT jsonb_build_object(
        'id', sc.id,
        'value', sc.value,
        'fit_score', sc.fit_score,
        'intent_score', sc.intent_score,
        'engagement_score', sc.engagement_score,
        'factors', sc.factors,
        'model', sc.model,
        'created_at', sc.created_at
      )
      FROM public.scores sc
      WHERE sc.lead_id = l.id
      ORDER BY sc.created_at DESC
      LIMIT 1
    ),
    'follow_ups', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', f.id,
        'type', f.type,
        'content', f.content,
        'tone', f.tone,
        'length', f.length,
        'model', f.model,
        'created_at', f.created_at
      ) ORDER BY f.created_at DESC), '[]'::jsonb)
      FROM public.follow_ups f
      WHERE f.lead_id = l.id
    ),
    'activities', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'type', a.type,
        'description', a.description,
        'metadata', a.metadata,
        'created_at', a.created_at
      ) ORDER BY a.created_at DESC), '[]'::jsonb)
      FROM public.activities a
      WHERE a.lead_id = l.id
    )
  )
  INTO result
  FROM public.leads l
  WHERE l.id = lead_uuid AND l.deleted_at IS NULL;

  RETURN result;
END;
$$;

-- Function to get leads with pagination and filters
CREATE OR REPLACE FUNCTION public.get_leads_paginated(
  p_user_id UUID,
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 25,
  p_sort TEXT DEFAULT 'created_at',
  p_order TEXT DEFAULT 'desc',
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_min_score INTEGER DEFAULT NULL,
  p_max_score INTEGER DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  company TEXT,
  title TEXT,
  source TEXT,
  status TEXT,
  notes TEXT,
  custom_fields JSONB,
  score INTEGER,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  summary JSONB,
  latest_score JSONB,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER;
  v_allowed_sorts TEXT[] := ARRAY['name', 'company', 'score', 'status', 'source', 'created_at'];
  v_allowed_orders TEXT[] := ARRAY['asc', 'desc'];
  v_sort TEXT;
  v_order TEXT;
BEGIN
  -- Validate and sanitize sort parameter
  v_sort := CASE WHEN p_sort = ANY(v_allowed_sorts) THEN p_sort ELSE 'created_at' END;
  v_order := CASE WHEN p_order = ANY(v_allowed_orders) THEN p_order ELSE 'desc' END;
  v_offset := (p_page - 1) * p_limit;

  RETURN QUERY
  WITH filtered_leads AS (
    SELECT
      l.*,
      (
        SELECT jsonb_build_object(
          'id', s.id,
          'content', s.content,
          'version', s.version,
          'model', s.model,
          'created_at', s.created_at
        )
        FROM public.summaries s
        WHERE s.lead_id = l.id
        ORDER BY s.version DESC
        LIMIT 1
      ) AS summary,
      (
        SELECT jsonb_build_object(
          'id', sc.id,
          'value', sc.value,
          'fit_score', sc.fit_score,
          'intent_score', sc.intent_score,
          'engagement_score', sc.engagement_score,
          'factors', sc.factors,
          'model', sc.model,
          'created_at', sc.created_at
        )
        FROM public.scores sc
        WHERE sc.lead_id = l.id
        ORDER BY sc.created_at DESC
        LIMIT 1
      ) AS latest_score,
      COUNT(*) OVER() AS total_count
    FROM public.leads l
    WHERE l.user_id = p_user_id
      AND l.deleted_at IS NULL
      AND (p_search IS NULL OR l.name ILIKE '%' || p_search || '%' OR l.email ILIKE '%' || p_search || '%' OR l.company ILIKE '%' || p_search || '%')
      AND (p_status IS NULL OR l.status = p_status)
      AND (p_min_score IS NULL OR l.score >= p_min_score)
      AND (p_max_score IS NULL OR l.score <= p_max_score)
      AND (p_date_from IS NULL OR l.created_at >= p_date_from)
      AND (p_date_to IS NULL OR l.created_at <= p_date_to)
  )
  SELECT
    fl.id,
    fl.user_id,
    fl.name,
    fl.email,
    fl.company,
    fl.title,
    fl.source,
    fl.status,
    fl.notes,
    fl.custom_fields,
    fl.score,
    fl.last_activity_at,
    fl.created_at,
    fl.updated_at,
    fl.deleted_at,
    fl.summary,
    fl.latest_score,
    fl.total_count
  FROM filtered_leads fl
  ORDER BY
    CASE WHEN v_sort = 'name' AND v_order = 'asc' THEN fl.name END ASC,
    CASE WHEN v_sort = 'name' AND v_order = 'desc' THEN fl.name END DESC,
    CASE WHEN v_sort = 'company' AND v_order = 'asc' THEN fl.company END ASC,
    CASE WHEN v_sort = 'company' AND v_order = 'desc' THEN fl.company END DESC,
    CASE WHEN v_sort = 'score' AND v_order = 'asc' THEN fl.score END ASC,
    CASE WHEN v_sort = 'score' AND v_order = 'desc' THEN fl.score END DESC,
    CASE WHEN v_sort = 'status' AND v_order = 'asc' THEN fl.status END ASC,
    CASE WHEN v_sort = 'status' AND v_order = 'desc' THEN fl.status END DESC,
    CASE WHEN v_sort = 'source' AND v_order = 'asc' THEN fl.source END ASC,
    CASE WHEN v_sort = 'source' AND v_order = 'desc' THEN fl.source END DESC,
    CASE WHEN v_sort = 'created_at' AND v_order = 'asc' THEN fl.created_at END ASC,
    CASE WHEN v_sort = 'created_at' AND v_order = 'desc' THEN fl.created_at END DESC
  LIMIT p_limit OFFSET v_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_lead_with_insights(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leads_paginated(UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;