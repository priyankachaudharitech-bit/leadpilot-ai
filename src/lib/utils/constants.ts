export const APP_NAME = 'LeadPilot AI';
export const APP_DESCRIPTION = 'AI-powered lead management for sales teams';

export const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
] as const;

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Cold Call',
  'Social Media',
  'Email Campaign',
  'Trade Show',
  'Partnership',
  'Organic Search',
  'Paid Ads',
  'Other',
];

export const FOLLOW_UP_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'call_script', label: 'Call Script' },
] as const;

export const FOLLOW_UP_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'direct', label: 'Direct' },
  { value: 'consultative', label: 'Consultative' },
] as const;

export const FOLLOW_UP_LENGTHS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
] as const;

export const SCORE_RANGES = {
  hot: { min: 70, max: 100, label: 'Hot', color: 'success' },
  warm: { min: 40, max: 69, label: 'Warm', color: 'warning' },
  cold: { min: 0, max: 39, label: 'Cold', color: 'error' },
} as const;

export const ITEMS_PER_PAGE = 25;
export const MAX_ITEMS_PER_PAGE = 100;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  leads: '/leads',
  leadNew: '/leads/new',
  leadDetail: (id: string) => `/leads/${id}`,
  leadEdit: (id: string) => `/leads/${id}/edit`,
  settings: '/settings',
} as const;
