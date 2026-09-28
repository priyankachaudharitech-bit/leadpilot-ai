# LeadPilot AI - Product Requirements Document (PRD)

## 1. Problem Statement

Sales teams waste 30-40% of their time on manual lead qualification, research, and follow-up writing instead of selling. Existing CRM tools store data but don't help synthesize it into actionable insights or automate the cognitive work of lead processing.

**LeadPilot AI** solves this by providing an AI-powered lead intelligence layer that automatically summarizes leads, scores them for priority, and generates personalized follow-up communications - all within a streamlined, modern SaaS interface.

## 2. Target Users

### Primary: Sales Representatives (SDRs, AEs)
- Need: Quickly understand new leads, prioritize outreach, write effective follow-ups
- Pain: Manual research, writer's block, inconsistent qualification

### Secondary: Sales Managers
- Need: Visibility into lead quality, team performance, pipeline health
- Pain: No standardized scoring, subjective assessments

### Tertiary: Marketing Operations
- Need: Lead quality feedback loop, scoring model tuning
- Pain: Disconnected from sales outcomes

## 3. Core Value Propositions

1. **Instant Lead Intelligence**: AI summarizes lead context in seconds, not minutes
2. **Objective Prioritization**: Consistent scoring algorithm removes bias
3. **Automated Outreach**: Personalized follow-ups generated from lead context
4. **Unified Workflow**: Single pane of glass for lead management + AI insights

## 4. Functional Requirements

### FR-001: Lead Management
| ID | Requirement | Priority |
|---|---|---|
| FR-001.1 | Users can create leads with: name, email, company, title, source, notes, custom fields | MVP |
| FR-001.2 | Users can view paginated, filterable, sortable lead list | MVP |
| FR-001.3 | Users can view lead detail with all fields and AI insights | MVP |
| FR-001.4 | Users can edit lead information | MVP |
| FR-001.5 | Users can delete leads (soft delete with recovery) | MVP |
| FR-001.6 | Users can bulk select leads for actions | Post-MVP |
| FR-001.7 | Lead import from CSV/Excel | Post-MVP |
| FR-001.8 | Lead export to CSV | Post-MVP |

### FR-002: AI Lead Summarization
| ID | Requirement | Priority |
|---|---|---|
| FR-002.1 | Generate concise summary (2-3 sentences) from lead data | MVP |
| FR-002.2 | Summary includes: key pain points, buying signals, company context | MVP |
| FR-002.3 | Regenerate summary on demand | MVP |
| FR-002.4 | Summary updates automatically when lead data changes | MVP |
| FR-002.5 | Summary generation < 5 seconds | MVP |
| FR-002.6 | Fallback to cached summary on AI failure | MVP |

### FR-003: AI Lead Scoring
| ID | Requirement | Priority |
|---|---|---|
| FR-003.1 | Score leads 0-100 based on fit, intent, engagement signals | MVP |
| FR-003.2 | Display score with visual indicator (color-coded: red/yellow/green) | MVP |
| FR-003.3 | Show score breakdown: fit (40%), intent (40%), engagement (20%) | MVP |
| FR-003.4 | Re-score on demand or when lead data changes | MVP |
| FR-003.5 | Score explanation with key factors | MVP |
| FR-003.6 | Configurable scoring weights (admin) | Post-MVP |

### FR-004: AI Follow-Up Generation
| ID | Requirement | Priority |
|---|---|---|
| FR-004.1 | Generate personalized email follow-up from lead context | MVP |
| FR-004.2 | Generate LinkedIn connection message | MVP |
| FR-004.3 | Generate call script/voicemail script | MVP |
| FR-004.4 | Tone options: professional, casual, direct, consultative | MVP |
| FR-004.5 | Length options: short, medium, long | MVP |
| FR-004.6 | Edit generated content before sending | MVP |
| FR-004.7 | Copy to clipboard / send via email integration | Post-MVP |
| FR-004.8 | A/B test follow-up variants | Post-MVP |

### FR-005: Authentication & User Management
| ID | Requirement | Priority |
|---|---|---|
| FR-005.1 | Email/password registration with email verification | MVP |
| FR-005.2 | Email/password login | MVP |
| FR-005.3 | Password reset via email | MVP |
| FR-005.4 | OAuth: Google, Microsoft (SSO) | Post-MVP |
| FR-005.5 | Session management with secure cookies | MVP |
| FR-005.6 | User profile management | MVP |

### FR-006: Dashboard & Analytics
| ID | Requirement | Priority |
|---|---|---|
| FR-006.1 | Dashboard with lead count, avg score, high-priority leads | MVP |
| FR-006.2 | Recent activity feed | MVP |
| FR-006.3 | Score distribution chart | Post-MVP |
| FR-006.4 | Conversion funnel | Post-MVP |
| FR-006.5 | Team performance (manager view) | Post-MVP |

### FR-007: Real-time Updates
| ID | Requirement | Priority |
|---|---|---|
| FR-007.1 | Lead list updates in real-time across tabs | MVP |
| FR-007.2 | AI insights update in real-time when generated | MVP |
| FR-007.3 | Presence indicators for team members | Post-MVP |

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Page load time (initial) | < 2 seconds |
| NFR-002 | API response time (p95) | < 500ms |
| NFR-003 | AI generation time (p95) | < 10 seconds |
| NFR-004 | Uptime | 99.9% |
| NFR-005 | Concurrent users | 1,000+ |
| NFR-006 | Data encryption at rest | AES-256 |
| NFR-007 | Data encryption in transit | TLS 1.3 |
| NFR-008 | WCAG 2.1 AA compliance | Full |
| NFR-009 | Mobile responsive | 320px - 1920px+ |
| NFR-010 | Browser support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| NFR-011 | TypeScript strict mode | Zero errors |
| NFR-012 | Test coverage (critical paths) | > 80% |

## 6. User Stories & Acceptance Criteria

### Epic 1: Lead Management

#### US-001: Create Lead
**As a** sales rep  
**I want to** create a new lead with all relevant information  
**So that** I can track and process it through LeadPilot

**Acceptance Criteria:**
```gherkin
Given I am on the "New Lead" page
When I fill in required fields (name, email, company) and optional fields
And I click "Create Lead"
Then the lead is created and I am redirected to the lead detail page
And the lead appears in the lead list
And a success toast is shown
```

**Edge Cases:**
- Duplicate email shows inline validation error
- Invalid email format shows inline error
- Network error shows retry option

#### US-002: View Lead List
**As a** sales rep  
**I want to** view a paginated, filterable list of my leads  
**So that** I can quickly find and prioritize leads

**Acceptance Criteria:**
```gherkin
Given I am on the dashboard
When the page loads
Then I see a table with: Name, Company, Score, Status, Source, Created Date
And I can sort by any column
And I can filter by: score range, status, source, date range
And I can search by name, email, company
And pagination shows 25 leads per page
And loading skeleton shows during fetch
And empty state shows when no leads match
```

#### US-003: View Lead Detail
**As a** sales rep  
**I want to** see complete lead information and AI insights  
**So that** I can make informed outreach decisions

**Acceptance Criteria:**
```gherkin
Given I click on a lead from the list
When the detail page loads
Then I see: all lead fields, AI summary, AI score with breakdown, AI follow-up options
And I can edit the lead inline
And I can regenerate AI insights
And I can navigate back to list
```

#### US-004: Edit Lead
**As a** sales rep  
**I want to** update lead information  
**So that** records stay accurate

**Acceptance Criteria:**
```gherkin
Given I am on a lead detail page
When I click "Edit" and modify fields
And I click "Save"
Then the lead is updated
And AI insights show "regenerate available" indicator
And a success toast is shown
```

#### US-005: Delete Lead
**As a** sales rep  
**I want to** remove irrelevant leads  
**So that** my list stays clean

**Acceptance Criteria:**
```gherkin
Given I am on a lead detail page
When I click "Delete" and confirm
Then the lead is soft-deleted
And it no longer appears in the list
And an "Undo" toast appears for 10 seconds
```

### Epic 2: AI Lead Summarization

#### US-006: Generate Lead Summary
**As a** sales rep  
**I want to** get an AI-generated summary of a lead  
**So that** I understand the lead context without manual research

**Acceptance Criteria:**
```gherkin
Given I am on a lead detail page with no summary
When the page loads
Then AI summary generates automatically
And shows loading state during generation
And displays 2-3 sentence summary when complete
And shows "Regenerate" button
```

#### US-007: Regenerate Summary
**As a** sales rep  
**I want to** regenerate the summary if it's inaccurate  
**So that** I get a better representation

**Acceptance Criteria:**
```gherkin
Given a lead has an existing summary
When I click "Regenerate"
Then loading state shows
And new summary replaces old one
And toast confirms regeneration
```

#### US-008: Summary Fallback
**As a** sales rep  
**I want to** see a fallback when AI fails  
**So that** I'm not blocked

**Acceptance Criteria:**
```gherkin
Given AI service is unavailable
When summary generation is attempted
Then error state shows with "Retry" button
And cached summary shows if available
And message: "Unable to generate summary. Showing cached version. Click Retry to try again."
```

### Epic 3: AI Lead Scoring

#### US-009: View Lead Score
**As a** sales rep  
**I want to** see a numerical score and visual indicator  
**So that** I can prioritize high-value leads

**Acceptance Criteria:**
```gherkin
Given a lead has been scored
When I view the lead list or detail
Then I see score 0-100 with color: 0-39 red, 40-69 yellow, 70-100 green
And score breakdown shows: Fit (40%), Intent (40%), Engagement (20%)
And tooltip explains each factor
```

#### US-010: Re-score Lead
**As a** sales rep  
**I want to** update the score when lead info changes  
**So that** prioritization stays accurate

**Acceptance Criteria:**
```gherkin
Given a lead has a score
When I click "Re-score" or lead data is updated
Then new score generates with loading state
And breakdown updates
And previous score shown for comparison
```

### Epic 4: AI Follow-Up Generation

#### US-011: Generate Email Follow-Up
**As a** sales rep  
**I want to** get a personalized email draft  
**So that** I can send effective outreach faster

**Acceptance Criteria:**
```gherkin
Given I am on a lead detail page
When I click "Generate Follow-up" → "Email"
And I select tone and length
Then AI generates email draft in < 10 seconds
And draft includes: subject line, personalized opening, value prop, CTA
And I can edit the draft inline
And I can copy to clipboard
```

#### US-012: Generate LinkedIn Message
**As a** sales rep  
**I want to** get a LinkedIn connection message  
**So that** I can connect on social

**Acceptance Criteria:**
```gherkin
Given I am on a lead detail page
When I click "Generate Follow-up" → "LinkedIn"
Then AI generates connection note (< 300 chars)
And message references lead context
And I can copy to clipboard
```

#### US-013: Generate Call Script
**As a** sales rep  
**I want to** get a call script and voicemail  
**So that** I'm prepared for phone outreach

**Acceptance Criteria:**
```gherkin
Given I am on a lead detail page
When I click "Generate Follow-up" → "Call Script"
Then AI generates: opener, discovery questions, value prop, objection handlers, voicemail
And I can copy each section independently
```

### Epic 5: Authentication

#### US-014: User Registration
**As a** new user  
**I want to** create an account  
**So that** I can use LeadPilot

**Acceptance Criteria:**
```gherkin
Given I am on the registration page
When I enter valid email, password (8+ chars), confirm password
And I click "Create Account"
Then account is created
And verification email is sent
And I am redirected to "Check your email" page
```

#### US-015: User Login
**As a** registered user  
**I want to** log into my account  
**So that** I can access my leads

**Acceptance Criteria:**
```gherkin
Given I am on the login page
When I enter valid credentials
And I click "Sign In"
Then I am authenticated
And redirected to dashboard
And session persists on refresh
```

#### US-016: Password Reset
**As a** user who forgot password  
**I want to** reset my password  
**So that** I can regain access

**Acceptance Criteria:**
```gherkin
Given I am on the login page
When I click "Forgot password" and enter my email
And I click "Send reset link"
Then reset email is sent
And I see confirmation message
And link in email allows new password entry
```

### Epic 6: Dashboard

#### US-017: Dashboard Overview
**As a** sales rep  
**I want to** see a summary of my leads  
**So that** I get quick insight

**Acceptance Criteria:**
```gherkin
Given I am logged in
When I visit the dashboard
Then I see: total leads, high-priority count (score ≥70), avg score, leads this week
And recent activity feed (last 10 actions)
And quick action buttons: "New Lead", "Import"
```

## 7. MVP Scope Definition

### MVP Features (Must Have)
- ✅ Lead CRUD (create, read, update, delete)
- ✅ Lead list with search, filter, sort, pagination
- ✅ Lead detail view
- ✅ AI lead summarization (auto + manual regenerate)
- ✅ AI lead scoring (0-100 with breakdown)
- ✅ AI follow-up generation (email, LinkedIn, call script)
- ✅ Email/password auth with verification
- ✅ Password reset
- ✅ Dashboard with key metrics
- ✅ Real-time updates via Supabase Realtime
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading, error, empty states
- ✅ WCAG 2.1 AA accessibility

### Post-MVP Features (Nice to Have)
- ⏳ Bulk lead actions
- ⏳ CSV import/export
- ⏳ Configurable scoring weights
- ⏳ OAuth (Google, Microsoft)
- ⏳ Advanced analytics (charts, funnels)
- ⏳ Team collaboration features
- ⏳ Email integration (send from app)
- ⏳ A/B testing for follow-ups
- ⏳ Custom fields
- ⏳ Webhooks/API access

## 8. Success Metrics & KPIs

| Metric | Target | Measurement |
|---|---|---|
| Time to first value (lead created → AI insights) | < 30 seconds | Product analytics |
| Lead processing time reduction | 50% vs manual | User survey + telemetry |
| AI summary accuracy rating | ≥ 4/5 | In-app feedback |
| Follow-up generation adoption | > 60% of leads | Event tracking |
| Daily active users (DAU) | 100+ by month 3 | Auth logs |
| User retention (30-day) | > 40% | Cohort analysis |
| Net Promoter Score (NPS) | > 50 | Quarterly survey |

## 9. Assumptions & Constraints

### Assumptions
1. Users have basic lead data (name, email, company) at minimum
2. OpenAI API available for AI features (with fallback strategy)
3. Supabase free tier sufficient for MVP scale
4. Vercel free tier sufficient for frontend hosting
5. Users comfortable with AI-generated content review

### Constraints
1. No custom backend server - must use Supabase Edge Functions or Next.js API routes
2. AI costs must stay within free tier limits initially
3. No native mobile app - responsive web only
4. Single-tenant initially (multi-tenant post-MVP)
5. English language only for MVP

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI hallucination in summaries | Medium | High | Prompt engineering, user edit capability, confidence scoring |
| AI cost overrun | Medium | High | Caching, rate limiting, model selection (GPT-4o-mini), usage monitoring |
| Supabase free tier limits | Low | Medium | Monitor usage, plan upgrade path |
| Low user adoption | Medium | High | UX focus, onboarding, quick time-to-value |
| Data privacy concerns | Low | High | Clear privacy policy, data export/deletion, no training on user data |

## 11. Acceptance Criteria Summary

All MVP user stories must pass their Gherkin acceptance criteria. Additionally:

- [ ] TypeScript compiles with zero errors in strict mode
- [ ] ESLint passes with zero errors
- [ ] Production build succeeds on Vercel
- [ ] All critical user flows tested manually
- [ ] Accessibility audit passes (axe-core)
- [ ] Mobile responsive verified on 320px, 768px, 1024px, 1440px
- [ ] No console errors in production build
- [ ] Environment variables documented in .env.example
- [ ] README accurate for setup and deployment