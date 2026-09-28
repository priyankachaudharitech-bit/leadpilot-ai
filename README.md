# LeadPilot AI

AI-powered lead management SaaS for sales teams. Built with Next.js 16, Supabase, and Groq AI.

## Features

- **Lead Management**: Full CRUD with filtering, sorting, and pagination
- **AI Lead Summarization**: 2-3 sentence summaries highlighting pain points, buying signals, and decision authority
- **AI Lead Scoring**: 0-100 score with Fit/Intent/Engagement breakdown and HOT/WARM/COLD classification
- **AI Follow-up Generation**: Email, LinkedIn connection requests, and call scripts with tone/length options
- **Authentication**: Supabase Auth with email/password, protected routes, RLS
- **Real-time Ready**: Supabase Realtime types configured

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **AI**: Groq Free Tier (qwen/qwen3.8-27b), Edge Functions ready
- **Database**: Supabase Cloud Free Tier with RLS, triggers, functions
- **Deployment**: Vercel Free Tier

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account (Free Tier)
- Groq account (Free Tier) - get API key at https://console.groq.com/keys

### Installation

```bash
# Clone and install
git clone <repo-url>
cd leadpilot-ai
npm install

# Copy environment variables
cp .env.example .env.local

# Configure .env.local with your credentials
# See Environment Variables below

# Run development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GROQ_API_KEY` | Groq API key (free tier) | Yes |
| `GROQ_MODEL` | Groq model (default: qwen/qwen3.8-27b) | No |
| `NEXT_PUBLIC_APP_URL` | App URL for auth redirects | Yes |
| `NEXT_PUBLIC_APP_NAME` | App name for UI | No |
| `EMAIL_FROM` | Sender email for auth emails | No |
| `RESEND_API_KEY` | Resend API key for emails | No |

### Database Setup

1. Create Supabase project at https://supabase.com
2. Run migrations in order:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or apply manually in Supabase SQL Editor:
   # 1. supabase/migrations/001_initial_schema.sql
   # 2. supabase/migrations/002_rls_policies.sql
   # 3. supabase/migrations/003_triggers.sql
   # 4. supabase/migrations/004_functions.sql
   # 5. supabase/migrations/005_rate_limits.sql
   ```
3. Set `GROQ_API_KEY` in Supabase Edge Function secrets for AI Edge Functions

### Edge Functions (Optional)

Deploy AI Edge Functions to Supabase:
```bash
supabase functions deploy ai-summarize
supabase functions deploy ai-score
supabase functions deploy ai-followup
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register, password reset)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── ai/                # AI components (Summary, Score, FollowUp)
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   ├── leads/             # Lead-specific components
│   └── ui/                # Base UI components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── ai/                # AI library (prompts, providers, client)
│   ├── supabase/          # Supabase clients
│   ├── utils/             # Utilities (errors, rate-limit, format)
│   └── validations/       # Zod schemas
├── providers/             # React Context providers
├── stores/                # Zustand stores
└── types/                 # TypeScript types

supabase/
├── migrations/            # Database migrations
└── functions/             # Edge Functions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run test         # Run unit/integration tests
npm run test:ui      # Run tests with UI
npm run format       # Format with Prettier
```

## Testing

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run specific test file
npm run test -- tests/unit/ai-score.test.ts
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Required Vercel environment variables:
- All variables from `.env.example`

### Supabase Edge Functions

Set secrets in Supabase Dashboard > Edge Functions > Secrets:
- `GROQ_API_KEY` - Your Groq API key
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided

## AI Models

Tested with Groq Free Tier models:
- `qwen/qwen3.8-27b` - Primary (tested, working)
- `openai/gpt-oss-20b` - Alternative
- `meta-llama/llama-prompt-guard-2-86m` - Safety

## License

MIT