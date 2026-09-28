-- Migration 005: Rate Limits Table
-- Creates table for persistent rate limiting across serverless invocations

CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits" ON public.rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits" ON public.rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_rate_limits_user_id ON public.rate_limits(user_id);
CREATE INDEX idx_rate_limits_action ON public.rate_limits(action);
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_rate_limits_updated_at ON public.rate_limits;
CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();