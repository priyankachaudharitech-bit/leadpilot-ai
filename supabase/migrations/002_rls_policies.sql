-- Migration 002: Row Level Security Policies
-- Enables RLS and creates policies for all tables

-- Users table RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Leads table RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Summaries table RLS
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view summaries for own leads" ON public.summaries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert summaries for own leads" ON public.summaries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

-- Scores table RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores for own leads" ON public.scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert scores for own leads" ON public.scores
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

-- Follow-ups table RLS
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follow-ups for own leads" ON public.follow_ups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert follow-ups for own leads" ON public.follow_ups
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

-- Activities table RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for own leads" ON public.activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert activities for own leads" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

