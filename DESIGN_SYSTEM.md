# LeadPilot AI - Design System Specification

## Version: 1.0.0
## Status: Approved

---

## 1. Design Principles

### 1.1 Core Principles
- **AI-First**: AI insights are prominently displayed, not hidden
- **Speed**: Instant visual feedback for all AI operations
- **Clarity**: Data-dense but scannable; hierarchy guides the eye
- **Efficiency**: Sales reps need to act fast; minimize clicks to value

### 1.2 Tone & Voice
- Professional yet approachable
- Confident but not corporate-stodgy
- Action-oriented language

---

## 2. Color Palette

### 2.1 Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#f5f8ff` | Backgrounds, subtle accents |
| `primary-100` | `#e0eaff` | Hover states, subtle fills |
| `primary-200` | `#c2d4ff` | borders, disabled states |
| `primary-300` | `#94b3ff` | Secondary interactions |
| `primary-400` | `#5a87ff` | Links, secondary actions |
| `primary-500` | `#3b6bd6` | Primary buttons, links |
| `primary-600` | `#2952b7` | Primary actions (hover) |
| `primary-700` | `#1e3a8a` | High-emphasis actions |
| `primary-800` | `#15275e` | Text, deep accents |
| `primary-900` | `#0e1a3d` | Headings, high contrast |
| `primary-950` | `#080f22` | Darkest UI elements |

### 2.2 Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `success-50` | `#effef6` | Background |
| `success-500` | `#10b981` | Score >= 70, positive states |
| `success-600` | `#059669` | Active states |
| `warning-50` | `#fffef3` | Background |
| `warning-500` | `#f59e0b` | Score 40-69, warnings |
| `warning-600` | `#d97706` | Active states |
| `error-50` | `#fef2f2` | Background |
| `error-500` | `#ef4444` | Score < 40, errors |
| `error-600` | `#dc2626` | Active states |
| `info-50` | `#eff6ff` | Background |
| `info-500` | `#3b82f6` | Information |
| `info-600` | `#2563eb` | Active states |

### 2.3 Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| `neutral-50` | `#fafafa` | Page backgrounds |
| `neutral-100` | `#f5f5f5` | Card backgrounds, dividers |
| `neutral-200` | `#e5e5e5` | Borders, separators |
| `neutral-300` | `#d4d4d4` | Disabled states |
| `neutral-400` | `#a3a3a3` | Placeholder text |
| `neutral-500` | `#737373` | Secondary text |
| `neutral-600` | `#525252` | Body text |
| `neutral-700` | `#404040` | Primary text |
| `neutral-800` | `#262626` | Headings |
| `neutral-900` | `#171717` | Page backgrounds (dark) |
| `neutral-950` | `#0f0f0f` | Darkest UI (dark mode) |

### 2.4 Score Colors

| Range | Color | Label |
|---|---|---|
| 0-39 | `error-500` (red) | Cold / Needs attention |
| 40-69 | `warning-500` (amber) | Warm / Moderate |
| 70-100 | `success-500` (green) | Hot / Priority |

---

## 3. Typography

### 3.1 Font Stack
- **Headings**: Inter, system-ui, sans-serif
- **Body**: Inter, system-ui, sans-serif
- **Mono** (code, data): Fira Code, monospace

### 3.2 Scale

| Size | Font Size | Line Height | Letter Spacing | Weight | Usage |
|---|---|---|---|---|---|
| `display-2xl` | 4rem (64px) | 1.1 | -0.02em | 700 | Hero, landing |
| `display-xl` | 3rem (48px) | 1.1 | -0.01em | 700 | Page headers |
| `display-lg` | 2.25rem (36px) | 1.2 | -0.01em | 600 | Section headers |
| `display-md` | 1.875rem (30px) | 1.2 | 0 | 600 | Card titles |
| `display-sm` | 1.5rem (24px) | 1.2 | 0 | 600 | Subsection headers |
| `text-xl` | 1.25rem (20px) | 1.5 | 0 | 500 | Lead names, key values |
| `text-lg` | 1.125rem (18px) | 1.5 | 0 | 500 | Body-large |
| `text-base` | 1rem (16px) | 1.5 | 0 | 400 | Body text |
| `text-sm` | 0.875rem (14px) | 1.4 | 0 | 400 | Secondary text, labels |
| `text-xs` | 0.75rem (12px) | 1.3 | 0.01em | 500 | Captions, tags |
| `text-2xs` | 0.625rem (10px) | 1.2 | 0.02em | 600 | Micro labels |

---

## 4. Spacing System

Based on 4px grid with 0.5 multiplier for odd values:

```typescript
const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
};
```

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | `0.25rem` (4px) | Small elements, chips |
| `radius-md` | `0.5rem` (8px) | Cards, inputs, buttons |
| `radius-lg` | `0.75rem` (12px) | Modal content, large cards |
| `radius-xl` | `1rem` (16px) | Page containers, hero |
| `radius-2xl` | `1.5rem` (24px) | Large modals |
| `radius-full` | `9999px` | Avatars, badges |

---

## 6. Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Cards, dropdowns |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Elevated cards |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Dropdowns, tooltips |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Modals (heavy) |

---

## 7. Breakpoints

| Name | Min Width | Max Width | Usage |
|---|---|---|---|
| `sm` | 640px | — | Large mobile |
| `md` | 768px | — | Tablet landscape |
| `lg` | 1024px | — | Tablet desktop |
| `xl` | 1280px | — | Small desktop |
| `2xl` | 1536px | — | Large desktop |
| `3xl` | 1792px | — | Wide screen |

**Responsive strategy:**
- Mobile-first (≤767px): Single column, collapsed sidebar, condensed tables
- Tablet (768px-1023px): Two-column layout, mini sidebar labels hidden
- Desktop (≥1024px): Full sidebar with labels, multi-column layouts

---

## 8. Component Library

### 8.1 Button

**Variants:**
- `primary` — filled, `primary-600` bg, white text
- `secondary` — outlined, `primary-600` border/text
- `success` — filled, `success-500` bg
- `destructive` — filled, `error-500` bg
- `ghost` — transparent, subtle hover
- `link` — plain text with underline on hover

**Sizes:**
- `sm` — 32px height
- `md` — 40px height
- `lg` — 48px height

**States:**
- Default, hover, active, focus, disabled, loading (spinner)

### 8.2 Input

**Variants:**
- Default — border, rounded
- Filled — bg-neutral-100
- Subtle — borderless with bottom border only

**States:**
- Default, focus, error, disabled, read-only

**Features:**
- Floating label support
- Inline validation messages
- Leading/trailing icon slots
- Password reveal toggle

### 8.3 Select

**Features:**
- Custom dropdown arrow
- Searchable for long lists
- Multi-select support
- Tag-style selected values
- Keyboard navigation

### 8.4 Textarea

**Features:**
- Auto-resize (optional)
- Character count indicator
- Min/max height constraints

### 8.5 Card

**Variants:**
- Default — subtle shadow
- Elevated — `shadow-md`
- Flat — no shadow, bordered
- Interactive — hover elevation

**Parts:**
- `CardHeader` — title, description, actions
- `CardContent` — body
- `CardFooter` — actions

### 8.6 Modal

**Variants:**
- Small (400px)
- Medium (600px)
- Large (800px)
- Extra Large (1200px)
- Fullscreen mobile

**Features:**
- Overlay backdrop (click to close)
- ESC key to close
- Focus trap
- Slide-in animations
- Scrollable body

### 8.7 Dropdown

**Features:**
- Position-aware (top/right/bottom/left)
- Keyboard navigation (arrow keys, Enter, ESC)
- Separator support
- Icon + label items
- Checkbox items (for filters)

### 8.8 Toast

**Variants:**
- `success` — green
- `error` — red
- `warning` — amber
- `info` — blue

**Positions:**
- Top-right (default)
- Top-center
- Bottom-right
- Bottom-left

**Features:**
- Auto-dismiss (5s default)
- Action button support
- Pause on hover
- Swipe to dismiss (mobile)

### 8.9 Avatar

**Sizes:** xs (20px), sm (28px), md (36px), lg (48px), xl (64px)
**Features:** Fallback initials when no image

### 8.10 Badge

**Variants:**
- `solid` — filled
- `outline` — bordered
- `soft` — subtle bg

**Colors:** primary, success, warning, error, neutral

### 8.11 Spinner

**Sizes:** xs (12px), sm (16px), md (24px), lg (32px), xl (48px)

### 8.12 Skeleton

**Variants:** text, rounded, circular

### 8.13 Tooltip

**Positions:** top, right, bottom, left
**Features:** Arrow, smooth fade-in, hover trigger

### 8.14 Table

**Features:**
- Column sorting (click header)
- Row selection (checkbox)
- Row hover
- Empty state
- Loading state
- Responsive (horizontal scroll on mobile)
- Fixed header on scroll

### 8.15 Pagination

**Features:**
- Previous/Next buttons
- Page number buttons
- Ellipsis for long page lists
- Items per page selector
- Showing X-Y of Z text

### 8.16 EmptyState

**Features:**
- Icon/illustration
- Title
- Description
- CTA button

### 8.17 ErrorState

**Features:**
- Error icon
- Title
- Description
- Retry button

---

## 9. Layout System

### 9.1 Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│  Header: [Logo] LeadPilot AI  [User Avatar ▼]        │
├──────────────────────────────────────────────────────┤
│ Sidebar │ Main Content                              │
│           │                                           │
│ [🏠 Dash] │  Dashboard                                │
│ [👥 Leads]│  Lead List                                │
│           │  / New Lead                                │
│           │  / [id] Detail                             │
│           │  / [id] Edit                               │
│ [⚙️ Settings]                                          │
│           │                                           │
└───────────┴───────────────────────────────────────────┘
```

**Sidebar states:**
- Full (desktop): icons + labels
- Mini (tablet): icons only
- Hidden (mobile): slide-out overlay

### 9.2 Auth Layout

Centered card with:
- Logo at top
- Form below
- Background gradient

### 9.3 Lead Detail Layout (Tabs)

```
Lead Detail
[Tabs: Overview | AI Insights | Activity]
───────────────────────────────
[Lead Form Fields]   [AI Summary Card]
[Score Card]         [Follow-up Generator]
                     [Activity Timeline]
```

---

## 10. Accessibility

### 10.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- All text/background combos ≥ 4.5:1 (AA)
- Large text ≥ 3:1
- Interactive elements ≥ 3:1

**Keyboard Navigation:**
- Tab order follows visual flow
- Focus indicators visible (2px outline)
- Arrow key navigation in dropdowns/menus
- ESC closes modals/dropdowns

**ARIA:**
- All interactive elements have accessible names
- Live regions for toasts/alerts
- ARIA labels for icon-only buttons
- Role attributes for tabs, accordions

**Screen Reader:**
- Semantic HTML (main, nav, aside, section, header, footer)
- Skip to main content link
- Form labels properly associated
- Table headers properly marked

---

## 11. Animations & Transitions

| Element | Transition | Duration |
|---|---|---|
| Color | `colors` | 150ms |
| Background | `colors` | 150ms |
| Border | `colors` | 150ms |
| Opacity | `opacity` | 150ms |
| Transform | `transform` | 200ms (ease-out) |
| Modal open | `opacity + scale` | 200ms |
| Modal close | `opacity + scale` | 150ms |
| Sidebar slide | `transform` | 250ms |
| Toast in | `opacity + translateY` | 200ms |
| Toast out | `opacity + translateY` | 150ms |

---

## 12. Design Handoff Checklist

- [x] Color palette defined (primary, semantic, neutral)
- [x] Typography scale defined
- [x] Spacing system defined (4px grid)
- [x] Border radius and shadows defined
- [x] Breakpoints defined
- [x] Component library specified
- [x] Layout system defined (dashboard, auth, lead detail)
- [x] State designs defined (loading, error, empty)
- [x] Auth flow designs defined
- [x] Accessibility requirements defined (WCAG 2.1 AA)
- [x] Animation/transition spec defined
