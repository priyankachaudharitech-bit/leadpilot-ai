# LeadPilot AI - Architecture Design Document

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LEADPILOT AI ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────────────────────────────────────────┐  │
│  │   CLIENT     │     │                    SUPABASE                       │  │
│  │  (Next.js)   │────▶│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │  │
│  │              │     │  │  Auth    │  │Database  │  │  Realtime      │  │  │
│  │  - React     │     │  │  (GoTrue)│  │(Postgres)│  │  (WebSockets)  │  │  │
│  │  - TanStack  │     │  └──────────┘  └──────────┘  └────────────────┘  │  │
│  │    Query     │     │         │            │               │           │  │
│  │  - Tailwind  │     │         ▼            ▼               ▼           │  │
│  │  - Zustand   │     │  ┌────────────────────────────────────────────┐  │  │
│  └──────────────┘     │  │            EDGE FUNCTIONS (Deno)           │  │  │
│         │             │  │  ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │  │
│         │ HTTPS/WSS   │  │  │AI Summ- │ │AI Score │ │AI Follow-up │  │  │  │
│         ▼             │  │  │  arize  │ │         │ │  Generate   │  │  │  │
│  ┌──────────────┐     │  │  └─────────┘ └─────────┘ └─────────────┘  │  │  │
│  │  EXTERNAL    │     │  └────────────────────────────────────────────┘  │  │
│  │  SERVICES    │     └──────────────────────────────────────────────────┘  │
│  │              │                                                              │
│  │  - OpenAI    │                                                              │
│  │  - Email     │                                                              │
│  └──────────────┘                                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend Framework | Next.js 14+ App Router | Server Components, streaming, optimal performance |
| Backend | **Supabase Cloud Free Tier** (PostgreSQL + Auth + Realtime + Edge Functions) | No local Docker needed, managed infrastructure, free tier sufficient for MVP |
| Styling | Tailwind CSS | Rapid development, consistent design system |
| State Management | TanStack Query + Zustand | Server state + client state separation |
| AI Integration | Supabase Edge Functions + OpenAI API | Secure, scalable, no API keys on client |
| Database | PostgreSQL (Supabase Cloud) | Relational, JSONB for flexibility, RLS support |
| Deployment | Vercel | Native Next.js support, preview deployments |

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │   leads     │       │  summaries  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◀──────│ id (PK)     │───────▶│ id (PK)     │
│ email       │       │ user_id (FK)│       │ lead_id (FK)│
│ name        │       │ name        │       │ content     │
│ avatar_url  │       │ email       │       │ version     │
│ created_at  │       │ company     │       │ model       │
│ updated_at  │       │ title       │       │ tokens_used │
└─────────────┘       │ source      │       │ created_at  │
                      │ status      │       └─────────────┘
                      │ notes       │              ▲
                      │ custom_fields│             │
                      │ score       │       ┌──────┴──────┐
                      │ created_at  │       │             │
                      │ updated_at  │       ▼             ▼
                      └─────────────┘  ┌─────────┐ ┌───────────┐
                              ▲        │ scores  │ │follow_ups │
                              │        ├─────────┤ ├───────────┤
                      ┌───────┴───────┐│ id (PK) │ │ id (PK)   │
                      │  activities   ││ lead_id │ │ lead_id   │
                      ├───────────────┤│ value   │ │ type      │
                      │ id (PK)       ││ factors │ │ content   │
                      │ lead_id (FK)  ││ model   │ │ tone      │
                      │ user_id (FK)  ││ tokens  │ │ length    │
                      │ type          ││ created_│ │ model     │
                      │ description   ││ at      │ │ tokens    │
                      │ metadata      │└─────────┘ │ created_  │
                      │ created_at    │            │ at        │
                      └───────────────┘            └───────────┘
```

### 2.2 Table Definitions

#### `users` (extends Supabase auth.users via trigger)
```sql
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

#### `leads`
```sql
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

-- Indexes
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_score ON public.leads(score DESC);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_company ON public.leads(company);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);
```

#### `summaries`
```sql
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

CREATE INDEX idx_summaries_lead_id ON public.summaries(lead_id);

ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view summaries for own leads" ON public.summaries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );
```

#### `scores`
```sql
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

CREATE INDEX idx_scores_lead_id ON public.scores(lead_id);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores for own leads" ON public.scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );
```

#### `follow_ups`
```sql
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

CREATE INDEX idx_follow_ups_lead_id ON public.follow_ups(lead_id);

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follow-ups for own leads" ON public.follow_ups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );
```

#### `activities`
```sql
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'updated', 'summary_generated', 'scored', 'follow_up_generated', 'status_changed', 'note_added')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for own leads" ON public.activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert activities for own leads" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2.3 Database Triggers & Functions

```sql
-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Log activity on lead changes
CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (lead_id, user_id, type, description)
    VALUES (NEW.id, NEW.user_id, 'created', 'Lead created');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.activities (lead_id, user_id, type, description, metadata)
      VALUES (NEW.id, NEW.user_id, 'status_changed', 'Status changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    ELSE
      INSERT INTO public.activities (lead_id, user_id, type, description)
      VALUES (NEW.id, NEW.user_id, 'updated', 'Lead updated');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_lead_activity
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_lead_activity();
```

## 3. API Design

### 3.1 REST Endpoints (Next.js App Router API Routes)

#### Leads API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | List leads with pagination, filters, sorting |
| POST | `/api/leads` | Create new lead |
| GET | `/api/leads/[id]` | Get lead detail with AI insights |
| PATCH | `/api/leads/[id]` | Update lead |
| DELETE | `/api/leads/[id]` | Soft delete lead |
| POST | `/api/leads/[id]/regenerate-summary` | Trigger AI summary regeneration |
| POST | `/api/leads/[id]/rescore` | Trigger AI re-scoring |
| POST | `/api/leads/[id]/generate-followup` | Generate follow-up (email/linkedin/call) |

#### Auth API (handled by Supabase client)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/reset-password` | Request password reset |
| POST | `/api/auth/update-password` | Update password |

#### User API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/profile` | Get current user profile |
| PATCH | `/api/user/profile` | Update user profile |

### 3.2 Request/Response Schemas

#### Lead List Request
```typescript
// GET /api/leads?page=1&limit=25&sort=score&order=desc&search=acme&status=new&minScore=50&maxScore=100
interface LeadListParams {
  page?: number;           // default: 1
  limit?: number;          // default: 25, max: 100
  sort?: 'name' | 'company' | 'score' | 'status' | 'source' | 'created_at';
  order?: 'asc' | 'desc';
  search?: string;         // searches name, email, company
  status?: LeadStatus | LeadStatus[];
  source?: string;
  minScore?: number;       // 0-100
  maxScore?: number;       // 0-100
  dateFrom?: string;       // ISO date
  dateTo?: string;         // ISO date
}

interface LeadListResponse {
  data: LeadWithInsights[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### Lead Detail Response
```typescript
interface LeadWithInsights {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string | null;
  title: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  custom_fields: Record<string, unknown>;
  score: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
  summary: Summary | null;
  latest_score: Score | null;
  follow_ups: FollowUp[];
  activities: Activity[];
}

interface Summary {
  id: string;
  content: string;
  version: number;
  model: string;
  created_at: string;
}

interface Score {
  id: string;
  value: number;
  fit_score: number | null;
  intent_score: number | null;
  engagement_score: number | null;
  factors: Record<string, unknown>;
  created_at: string;
}

interface FollowUp {
  id: string;
  type: 'email' | 'linkedin' | 'call_script';
  content: string;
  tone: string | null;
  length: string | null;
  created_at: string;
}
```

#### AI Generation Requests
```typescript
// POST /api/leads/[id]/generate-followup
interface GenerateFollowUpRequest {
  type: 'email' | 'linkedin' | 'call_script';
  tone?: 'professional' | 'casual' | 'direct' | 'consultative';
  length?: 'short' | 'medium' | 'long';
}

interface GenerateFollowUpResponse {
  follow_up: FollowUp;
}
```

### 3.3 Supabase Realtime Subscriptions

```typescript
// Client-side subscription for real-time lead updates
const subscribeToLeads = (userId: string) => {
  return supabase
    .channel(`leads:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // Handle insert, update, delete
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      }
    )
    .subscribe();
};

// Subscribe to AI insights updates
const subscribeToInsights = (leadId: string) => {
  return supabase
    .channel(`insights:${leadId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'summaries',
        filter: `lead_id=eq.${leadId}`
      },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scores',
        filter: `lead_id=eq.${leadId}`
      },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      }
    )
    .subscribe();
};
```

## 4. Folder Structure (Next.js 14+ App Router)

```
leadpilot-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline
│       └── deploy.yml          # Vercel deployment
├── .vscode/
│   └── settings.json
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx      # Auth layout (no sidebar)
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx                    # Lead list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx                # Create lead
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx                # Lead detail
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx            # Edit lead
│   │   │   │   │   └── components/
│   │   │   │   │       ├── LeadSummary.tsx
│   │   │   │   │       ├── LeadScore.tsx
│   │   │   │   │       ├── LeadFollowUps.tsx
│   │   │   │   │       └── LeadActivities.tsx
│   │   │   │   └── components/
│   │   │   │       ├── LeadTable.tsx
│   │   │   │       ├── LeadFilters.tsx
│   │   │   │       └── LeadPagination.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx                      # Dashboard layout with sidebar
│   │   ├── api/
│   │   │   ├── leads/
│   │   │   │   ├── route.ts                    # GET, POST
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts                # GET, PATCH, DELETE
│   │   │   │   │   ├── regenerate-summary/
│   │   │   │   │   │   └── route.ts            # POST
│   │   │   │   │   ├── rescore/
│   │   │   │   │   │   └── route.ts            # POST
│   │   │   │   │   └── generate-followup/
│   │   │   │   │       └── route.ts            # POST
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   ├── reset-password/route.ts
│   │   │   │   └── update-password/route.ts
│   │   │   └── user/
│   │   │       └── profile/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                            # Redirect to dashboard or login
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                                 # Design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageLayout.tsx
│   │   ├── forms/
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   ├── leads/
│   │   │   ├── LeadCard.tsx
│   │   │   ├── LeadRow.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── ai/
│   │       ├── SummaryDisplay.tsx
│   │       ├── ScoreDisplay.tsx
│   │       ├── FollowUpGenerator.tsx
│   │       └── FollowUpDisplay.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Browser client
│   │   │   ├── server.ts                       # Server client (cookies)
│   │   │   ├── admin.ts                        # Service role client
│   │   │   └── middleware.ts                   # Auth middleware
│   │   ├── ai/
│   │   │   ├── prompts.ts                      # Prompt templates
│   │   │   ├── client.ts                       # OpenAI client
│   │   │   ├── summarize.ts                    # Summarization logic
│   │   │   ├── score.ts                        # Scoring logic
│   │   │   └── followup.ts                     # Follow-up generation logic
│   │   ├── validations/
│   │   │   ├── lead.ts                         # Zod schemas
│   │   │   ├── auth.ts
│   │   │   └── followup.ts
│   │   ├── utils/
│   │   │   ├── cn.ts                           # clsx + tailwind-merge
│   │   │   ├── format.ts                       # Date, number formatting
│   │   │   ├── constants.ts                    # App constants
│   │   │   └── errors.ts                       # Error handling utilities
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useLeads.ts
│   │       ├── useLead.ts
│   │       ├── useRealtime.ts
│   │       └── useToast.ts
│   ├── stores/
│   │   ├── authStore.ts                        # Zustand auth state
│   │   ├── uiStore.ts                          # UI state (sidebar, modals)
│   │   └── leadStore.ts                        # Lead draft state
│   ├── types/
│   │   ├── database.ts                         # Supabase generated types
│   │   ├── lead.ts
│   │   ├── ai.ts
│   │   └── api.ts
│   └── middleware.ts                           # Next.js middleware for auth
├── supabase/                                   # Supabase Cloud config (for CI/CD)
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_triggers.sql
│   │   └── 004_functions.sql
│   ├── functions/
│   │   ├── ai-summarize/
│   │   │   └── index.ts                        # Edge Function
│   │   ├── ai-score/
│   │   │   └── index.ts
│   │   └── ai-followup/
│   │       └── index.ts
│   ├── config.toml
│   └── seed.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── README.md
└── AGENTS.md (etc.)
```

## 5. Authentication & Authorization Model

### 5.1 Auth Flow
```
1. User visits /login or /register
2. Supabase Auth handles email/password + email verification
3. On successful auth, Supabase sets secure httpOnly cookies
4. Next.js middleware validates session on protected routes
5. Server components use createServerClient() for authenticated data access
6. Client components use createBrowserClient() for realtime subscriptions
```

### 5.2 Role-Based Access Control

| Role | Permissions |
|---|---|
| `rep` | CRUD own leads, view own AI insights, generate follow-ups |
| `manager` | All rep permissions + view team leads, team analytics |
| `admin` | All manager permissions + user management, system settings |

### 5.3 RLS Policy Summary

All tables have RLS enabled with policies ensuring:
- Users only access their own data (`auth.uid() = user_id`)
- Managers can access team data via `user_id IN (SELECT id FROM users WHERE manager_id = auth.uid())`
- Admins have full access via `auth.jwt() ->> 'role' = 'admin'`

## 6. Edge Functions (AI Processing)

### 6.1 AI Summarize Function (`/functions/ai-summarize`)
```typescript
// Input: { leadId: string, leadData: LeadInput }
// Output: { summary: string, tokensUsed: number, latencyMs: number }
// - Fetches lead data
// - Builds prompt with lead context
// - Calls OpenAI GPT-4o-mini
// - Stores summary in database
// - Returns result
```

### 6.2 AI Score Function (`/functions/ai-score`)
```typescript
// Input: { leadId: string, leadData: LeadInput }
// Output: { value: number, fit: number, intent: number, engagement: number, factors: object }
// - Fetches lead data + previous scores
// - Builds scoring prompt
// - Calls OpenAI GPT-4o-mini with structured output
// - Updates lead.score and creates score record
// - Returns result
```

### 6.3 AI Follow-up Function (`/functions/ai-followup`)
```typescript
// Input: { leadId: string, leadData: LeadInput, type: 'email'|'linkedin'|'call_script', tone?, length? }
// Output: { content: string, tokensUsed: number, latencyMs: number }
// - Fetches lead data + summary + score
// - Builds follow-up prompt based on type
// - Calls OpenAI GPT-4o-mini
// - Creates follow_up record
// - Returns result
```

## 7. Environment Variables

### 7.1 Required Variables

| Variable | Description | Required | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) | Yes | `eyJ...` |
| `OPENAI_API_KEY` | OpenAI API key for AI functions | Yes | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | Production app URL | Yes | `https://leadpilot.ai` |
| `EMAIL_FROM` | Sender email for transactional emails | Yes | `noreply@leadpilot.ai` |
| `RESEND_API_KEY` | Resend API key for emails | No | `re_...` |

### 7.2 Optional Variables

| Variable | Description | Default |
|---|---|---|
| `AI_MODEL` | OpenAI model to use | `gpt-4o-mini` |
| `AI_MAX_TOKENS` | Max tokens per request | `1000` |
| `AI_TEMPERATURE` | Model temperature | `0.7` |
| `RATE_LIMIT_AI_REQUESTS` | Requests per minute per user | `30` |
| `LOG_LEVEL` | Logging level | `info` |

## 8. Technical Decision Records (ADRs)

### ADR-001: Technology Stack (Recorded in DECISIONS.md)

### ADR-002: Database Schema Design
**Status**: Accepted
**Context**: Need relational model with JSONB flexibility for lead custom fields and AI outputs
**Decision**: PostgreSQL with UUID PKs, JSONB for flexible fields, separate tables for AI outputs
**Consequences**: Normalized AI data enables querying/analytics, slight join overhead

### ADR-003: Authentication Strategy
**Status**: Accepted
**Context**: Need secure auth with minimal custom code
**Decision**: Supabase Auth (GoTrue) with email/password, email verification, password reset
**Consequences**: Battle-tested, handles MFA/OAuth future, cookies managed by Supabase

### ADR-004: AI Model Selection
**Status**: Proposed
**Context**: Need cost-effective AI for summarization, scoring, follow-ups
**Decision**: OpenAI GPT-4o-mini for all AI tasks; structured outputs for scoring
**Consequences**: Low cost (~$0.15/1M tokens), good quality, structured output support

### ADR-005: Real-time Architecture
**Status**: Accepted
**Context**: Need live updates across browser tabs for leads and AI insights
**Decision**: Supabase Realtime (Postgres changes via WebSocket)
**Consequences**: Native integration, automatic reconnection, filter by user_id

### ADR-006: State Management
**Status**: Accepted
**Context**: Need to manage server state (leads, AI insights) and client state (UI)
**Decision**: TanStack Query for server state, Zustand for client UI state
**Consequences**: Caching, deduping, optimistic updates for server state; lightweight for UI

### ADR-007: Error Handling Strategy
**Status**: Accepted
**Context**: Need consistent error handling across frontend, API, Edge Functions
**Decision**: 
- Frontend: React Error Boundaries + toast notifications
- API Routes: Standardized error responses with codes
- Edge Functions: Structured logging, graceful degradation
**Consequences**: Consistent UX, debuggable errors, monitoring ready

## 9. Security Considerations

1. **No secrets in client bundle**: All AI calls via Edge Functions
2. **RLS on all tables**: Database-enforced access control
3. **Input validation**: Zod schemas on all API inputs
4. **Rate limiting**: Per-user limits on AI endpoints
5. **CSP headers**: Configured in next.config.js
6. **Secure cookies**: HttpOnly, SameSite, Secure flags
7. **Prompt injection protection**: Input sanitization, system prompt separation

## 10. Performance Targets

| Metric | Target |
|---|---|
| Initial page load (dashboard) | < 2s |
| Lead list API (p95) | < 300ms |
| Lead detail API (p95) | < 400ms |
| AI summary generation (p95) | < 8s |
| AI scoring (p95) | < 5s |
| AI follow-up (p95) | < 10s |
| Realtime latency | < 200ms |

## 11. Deployment Architecture

```
┌─────────────┐     ┌─────────────┐     ┌────────────────────────────┐
│   GitHub    │────▶│   Vercel    │────▶│  Production (Vercel)       │
│   (main)    │     │  (Preview)  │     │  + Supabase Cloud (Prod)   │
└─────────────┘     └─────────────┘     └────────────────────────────┘
                           │
                           ▼
                    ┌────────────────────────────┐
                    │  Supabase Cloud Free Tier  │
                    │  (PostgreSQL + Auth +      │
                    │   Realtime + Edge Functions)│
                    └────────────────────────────┘
```

- **Preview**: Every PR gets unique Vercel preview URL + Supabase preview branch (or shared dev project)
- **Production**: Main branch deploys to production Vercel + Supabase Cloud production project
- **Database Migrations**: Run via Supabase CLI in CI/CD pipeline against cloud database
- **No local Docker required**: All backend services hosted on Supabase Cloud Free Tier

## 12. Monitoring & Observability

- **Error Tracking**: Sentry (frontend + Edge Functions)
- **Performance**: Vercel Analytics + Supabase Dashboard
- **Logs**: Supabase Logs + Vercel Function Logs
- **AI Usage**: Custom metrics in Edge Functions (tokens, latency, cost)