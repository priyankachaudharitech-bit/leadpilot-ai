-- Migration 001: Initial Schema
-- Creates all tables for LeadPilot AI

-- Users table (extends Supabase auth.users via trigger)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'rep' CHECK (role IN ('rep', 'manager', 'admin')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  title TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'closed_won', 'closed_lost')),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Summaries table (AI-generated summaries)
CREATE TABLE public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  model TEXT DEFAULT 'gpt-4o-mini',
  prompt_version TEXT DEFAULT 'v1',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table (AI-generated scores)
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 0 AND value <= 100),
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  intent_score INTEGER CHECK (intent_score >= 0 AND intent_score <= 100),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  factors JSONB DEFAULT '{}',
  model TEXT DEFAULT 'gpt-4o-mini',
  prompt_version TEXT DEFAULT 'v1',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups table (AI-generated follow-up content)
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'linkedin', 'call_script')),
  content TEXT NOT NULL,
  tone TEXT CHECK (tone IN ('professional', 'casual', 'direct', 'consultative')),
  length TEXT CHECK (length IN ('short', 'medium', 'long')),
  model TEXT DEFAULT 'gpt-4o-mini',
  prompt_version TEXT DEFAULT 'v1',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table (audit trail)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'updated', 'summary_generated', 'scored', 'follow_up_generated', 'status_changed', 'note_added')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_score ON public.leads(score DESC);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_company ON public.leads(company);

CREATE INDEX idx_summaries_lead_id ON public.summaries(lead_id);
CREATE INDEX idx_scores_lead_id ON public.scores(lead_id);
CREATE INDEX idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
