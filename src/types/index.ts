export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: 'rep' | 'manager' | 'admin';
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: 'rep' | 'manager' | 'admin';
          preferences?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: 'rep' | 'manager' | 'admin';
          preferences?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          company: string | null;
          title: string | null;
          source: string | null;
          status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'closed_won' | 'closed_lost';
          notes: string | null;
          custom_fields: Record<string, unknown>;
          score: number;
          last_activity_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          company?: string | null;
          title?: string | null;
          source?: string | null;
          status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'closed_won' | 'closed_lost';
          notes?: string | null;
          custom_fields?: Record<string, unknown>;
          score?: number;
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          company?: string | null;
          title?: string | null;
          source?: string | null;
          status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'closed_won' | 'closed_lost';
          notes?: string | null;
          custom_fields?: Record<string, unknown>;
          score?: number;
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      summaries: {
        Row: {
          id: string;
          lead_id: string;
          content: string;
          version: number;
          model: string;
          prompt_version: string;
          tokens_used: number | null;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          content: string;
          version?: number;
          model?: string;
          prompt_version?: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          content?: string;
          version?: number;
          model?: string;
          prompt_version?: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          lead_id: string;
          value: number;
          fit_score: number | null;
          intent_score: number | null;
          engagement_score: number | null;
          factors: Record<string, unknown>;
          model: string;
          prompt_version: string;
          tokens_used: number | null;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          value: number;
          fit_score?: number | null;
          intent_score?: number | null;
          engagement_score?: number | null;
          factors?: Record<string, unknown>;
          model?: string;
          prompt_version?: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          value?: number;
          fit_score?: number | null;
          intent_score?: number | null;
          engagement_score?: number | null;
          factors?: Record<string, unknown>;
          model?: string;
          prompt_version?: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
      };
      follow_ups: {
        Row: {
          id: string;
          lead_id: string;
          type: 'email' | 'linkedin' | 'call_script';
          content: string;
          tone: 'professional' | 'casual' | 'direct' | 'consultative' | null;
          length: 'short' | 'medium' | 'long' | null;
          model: string;
          prompt_version: string;
          tokens_used: number | null;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          type: 'email' | 'linkedin' | 'call_script';
          content: string;
          tone?: 'professional' | 'casual' | 'direct' | 'consultative' | null;
          length?: 'short' | 'medium' | 'long' | null;
          model?: string;
          prompt_version?: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          type?: 'email' | 'linkedin' | 'call_script';
          content?: string;
          tone?: 'professional' | 'casual' | 'direct' | 'consultative' | null;
          length?: 'short' | 'medium' | 'long' | null;
          model?: string;
          prompt_version?: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string;
          type:
            | 'created'
            | 'updated'
            | 'summary_generated'
            | 'scored'
            | 'follow_up_generated'
            | 'status_changed'
            | 'note_added';
          description: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          user_id: string;
          type:
            | 'created'
            | 'updated'
            | 'summary_generated'
            | 'scored'
            | 'follow_up_generated'
            | 'status_changed'
            | 'note_added';
          description: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          user_id?: string;
          type?:
            | 'created'
            | 'updated'
            | 'summary_generated'
            | 'scored'
            | 'follow_up_generated'
            | 'status_changed'
            | 'note_added';
          description?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          count: number;
          window_start: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          count?: number;
          window_start?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          count?: number;
          window_start?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_lead_with_insights: {
        Args: { lead_uuid: string };
        Returns: any;
      };
      get_leads_paginated: {
        Args: {
          p_user_id: string;
          p_page?: number;
          p_limit?: number;
          p_sort?: string;
          p_order?: string;
          p_search?: string;
          p_status?: string;
          p_min_score?: number;
          p_max_score?: number;
          p_date_from?: string;
          p_date_to?: string;
        };
        Returns: any;
      };
    };
  };
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'closed_won' | 'closed_lost';
export type LeadScore = number;
export type FollowUpType = 'email' | 'linkedin' | 'call_script';
export type FollowUpTone = 'professional' | 'casual' | 'direct' | 'consultative';
export type FollowUpLength = 'short' | 'medium' | 'long';
export type ActivityType =
  | 'created'
  | 'updated'
  | 'summary_generated'
  | 'scored'
  | 'follow_up_generated'
  | 'status_changed'
  | 'note_added';

export interface Lead {
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
  deleted_at: string | null;
}

export interface LeadWithInsights extends Lead {
  summary: Summary | null;
  latest_score: Score | null;
  follow_ups: FollowUp[];
  activities: Activity[];
}

export interface Summary {
  id: string;
  lead_id: string;
  content: string;
  version: number;
  model: string;
  created_at: string;
}

export interface Score {
  id: string;
  lead_id: string;
  value: number;
  fit_score: number | null;
  intent_score: number | null;
  engagement_score: number | null;
  factors: Record<string, unknown>;
  model: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  type: FollowUpType;
  content: string;
  tone: FollowUpTone | null;
  length: FollowUpLength | null;
  model: string;
  created_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LeadListParams {
  page?: number;
  limit?: number;
  sort?: 'name' | 'company' | 'score' | 'status' | 'source' | 'created_at';
  order?: 'asc' | 'desc';
  search?: string;
  status?: LeadStatus | LeadStatus[];
  source?: string;
  minScore?: number;
  maxScore?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadListResponse {
  data: LeadWithInsights[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
