import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  company: z.string().max(100).optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'closed_won', 'closed_lost']).default('new'),
  notes: z.string().max(2000).optional().nullable(),
  custom_fields: z.record(z.string(), z.unknown()).optional().default({}),
});

export const leadUpdateSchema = leadSchema.partial();

export const leadListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.enum(['name', 'company', 'score', 'status', 'source', 'created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const generateFollowUpSchema = z.object({
  type: z.enum(['email', 'linkedin', 'call_script']),
  tone: z.enum(['professional', 'casual', 'direct', 'consultative']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});
