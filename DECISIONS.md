# Technical Decisions - LeadPilot AI

## ADR-001: Technology Stack Selection
**Date**: 2026-09-25
**Status**: Accepted
**Decision**: 
- Frontend: Next.js 14+ (App Router) with TypeScript
- Styling: Tailwind CSS with custom design system
- Backend/Database: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- AI: OpenAI API (GPT-4o-mini for cost efficiency) with fallback to local/models
- State Management: React Query (TanStack Query) + React Context
- Forms: React Hook Form + Zod validation
- Testing: Vitest (unit), Playwright (E2E)
- Deployment: Vercel
- CI/CD: GitHub Actions

**Rationale**: 
- Next.js App Router provides optimal performance with Server Components
- Supabase eliminates need for separate backend service
- Tailwind enables rapid, consistent UI development
- Vercel offers seamless Next.js deployment with preview URLs
- OpenAI GPT-4o-mini balances cost and quality for AI features

## ADR-002: Database Schema Design
**Date**: 2026-09-25
**Status**: Accepted
**Decision**: PostgreSQL with UUID primary keys, separate tables for leads, summaries, scores, follow_ups, activities. JSONB for flexible fields (custom_fields, factors). RLS policies on all tables.
**Rationale**: Normalized AI data enables querying/analytics, JSONB provides flexibility for custom fields, RLS enforces data isolation at database level.

## ADR-003: Authentication Strategy
**Date**: 2026-09-25
**Status**: Accepted
**Decision**: Supabase Auth (GoTrue) with email/password, email verification, password reset. Session management via secure httpOnly cookies. Role-based access (rep, manager, admin) stored in users table.
**Rationale**: Battle-tested auth solution, handles MFA/OAuth future expansion, cookies managed automatically, integrates with RLS.

## ADR-004: AI Model Selection & Cost Optimization
**Date**: 2026-09-25
**Status**: Accepted
**Decision**: OpenAI GPT-4o-mini for all AI tasks (summarization, scoring, follow-up generation). Use structured outputs for scoring. Implement response caching, rate limiting (30 req/min/user), and prompt versioning.
**Rationale**: GPT-4o-mini costs ~$0.15/1M input tokens, ~$0.60/1M output tokens. Structured outputs ensure valid JSON for scoring. Caching reduces repeat calls.

## ADR-005: Real-time Architecture
**Date**: 2026-09-25
**Status**: Accepted
**Decision**: Supabase Realtime (Postgres changes via WebSocket) with channel filtering by user_id. Subscribe to leads, summaries, scores tables for live updates.
**Rationale**: Native Supabase integration, automatic reconnection, row-level filtering, no additional infrastructure.

## ADR-006: State Management Approach
**Date**: 2026-09-25
**Status**: Accepted
**Decision**: TanStack Query (React Query) for server state (leads, AI insights, user data). Zustand for client UI state (sidebar, modals, toasts). React Hook Form for form state.
**Rationale**: React Query provides caching, deduping, optimistic updates, background refetching. Zustand is lightweight for simple UI state.

## ADR-007: Error Handling & Logging Strategy
**Date**: 2026-09-25
**Status**: Accepted
**Decision**: 
- Frontend: React Error Boundaries per route/section + toast notifications for user-facing errors
- API Routes: Standardized error response format with error codes, messages, status codes
- Edge Functions: Structured JSON logging with correlation IDs, graceful degradation with cached fallbacks
- Monitoring: Sentry for error tracking, Vercel Analytics for performance

**Rationale**: Consistent error handling across layers, debuggable with correlation IDs, graceful AI fallbacks prevent hard failures.