import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { generateSummary } from '@/lib/ai/summarize';
import { generateScore } from '@/lib/ai/score';
import { generateFollowUp } from '@/lib/ai/followup';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testLead = {
  name: 'Test Lead Persistence',
  email: 'test.persistence@leadpilot.ai',
  company: 'Persistence Test Corp',
  title: 'Test Manager',
  source: 'test',
  notes: 'Testing AI persistence',
  custom_fields: { test: true }
};

let testUserId: string;
let testLeadId: string;

describe('AI Persistence/Retrieval - Supabase Integration', () => {
  beforeAll(async () => {
    // Create test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test.persistence@leadpilot.ai',
      password: 'TestPass123!',
      email_confirm: true
    });
    expect(authError).toBeNull();
    testUserId = authData.user!.id;
    
    // Create test lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        user_id: testUserId,
        name: testLead.name,
        email: testLead.email,
        company: testLead.company,
        title: testLead.title,
        source: testLead.source,
        notes: testLead.notes,
        custom_fields: testLead.custom_fields,
        status: 'new'
      })
      .select()
      .single();
    expect(leadError).toBeNull();
    testLeadId = leadData.id;
  });

  afterAll(async () => {
    // Clean up
    await supabase.from('summaries').delete().eq('lead_id', testLeadId);
    await supabase.from('scores').delete().eq('lead_id', testLeadId);
    await supabase.from('follow_ups').delete().eq('lead_id', testLeadId);
    await supabase.from('leads').delete().eq('id', testLeadId);
    await supabase.auth.admin.deleteUser(testUserId);
  });

  it('should persist and retrieve AI summary', async () => {
    // Generate summary via AI
    const summaryResult = await generateSummary(testLead);
    expect(summaryResult.summary).toBeDefined();
    
    // Insert into database
    const { data: summary, error: insertError } = await supabase
      .from('summaries')
      .insert({
        lead_id: testLeadId,
        content: summaryResult.summary,
        version: 1,
        model: 'qwen/qwen3.8-27b',
        prompt_version: 'v1',
        tokens_used: summaryResult.tokensUsed,
        latency_ms: summaryResult.latencyMs
      })
      .select()
      .single();
    expect(insertError).toBeNull();
    expect(summary.content).toBe(summaryResult.summary);
    
    // Retrieve from database
    const { data: retrieved, error: retrieveError } = await supabase
      .from('summaries')
      .select('*')
      .eq('lead_id', testLeadId)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    expect(retrieveError).toBeNull();
    expect(retrieved.content).toBe(summaryResult.summary);
    
    console.log('Summary persisted and retrieved successfully');
  }, 30000);

  it('should persist and retrieve AI score', async () => {
    // Generate score via AI
    const scoreResult = await generateScore(testLead);
    expect(scoreResult.value).toBeDefined();
    
    // Insert into database
    const { data: score, error: insertError } = await supabase
      .from('scores')
      .insert({
        lead_id: testLeadId,
        value: scoreResult.value,
        fit_score: scoreResult.fit_score,
        intent_score: scoreResult.intent_score,
        engagement_score: scoreResult.engagement_score,
        factors: scoreResult.factors,
        model: 'qwen/qwen3.8-27b',
        prompt_version: 'v1',
        tokens_used: scoreResult.tokensUsed,
        latency_ms: scoreResult.latencyMs
      })
      .select()
      .single();
    expect(insertError).toBeNull();
    expect(score.value).toBe(scoreResult.value);
    
    // Retrieve from database
    const { data: retrieved, error: retrieveError } = await supabase
      .from('scores')
      .select('*')
      .eq('lead_id', testLeadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    expect(retrieveError).toBeNull();
    expect(retrieved.value).toBe(scoreResult.value);
    expect(retrieved.fit_score).toBe(scoreResult.fit_score);
    expect(retrieved.intent_score).toBe(scoreResult.intent_score);
    expect(retrieved.engagement_score).toBe(scoreResult.engagement_score);
    
    // Verify classification
    const classification = scoreResult.value >= 70 ? 'hot' : scoreResult.value >= 40 ? 'warm' : 'cold';
    console.log(`Score ${scoreResult.value} classified as: ${classification.toUpperCase()}`);
  }, 30000);

  it('should persist and retrieve AI follow-up', async () => {
    // First need summary and score for context
    let summaryResult;
    let scoreResult;
    
    try {
      summaryResult = await generateSummary(testLead);
      scoreResult = await generateScore(testLead);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('limit') || msg.includes('rate')) {
        console.log('Rate limited on summary/score - using mock data for follow-up test');
        summaryResult = { summary: 'Mock summary', tokensUsed: 0, latencyMs: 0 };
        scoreResult = { value: 75, fit_score: 80, intent_score: 70, engagement_score: 75, factors: {}, tokensUsed: 0, latencyMs: 0 };
      } else {
        throw error;
      }
    }
    
    // Generate follow-up via AI
    let followupResult;
    try {
      followupResult = await generateFollowUp(testLead, summaryResult.summary, scoreResult, { 
        type: 'email', 
        tone: 'professional', 
        length: 'medium' 
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('limit') || msg.includes('rate')) {
        console.log('Rate limited - using mock follow-up for persistence test');
        followupResult = {
          content: 'Mock follow-up for persistence test',
          tokensUsed: 0,
          latencyMs: 0
        };
      } else {
        throw error;
      }
    }
    expect(followupResult.content).toBeDefined();
    
    // Insert into database
    const { data: followup, error: insertError } = await supabase
      .from('follow_ups')
      .insert({
        lead_id: testLeadId,
        type: 'email',
        content: followupResult.content,
        tone: 'professional',
        length: 'medium',
        model: 'qwen/qwen3.8-27b',
        prompt_version: 'v1',
        tokens_used: followupResult.tokensUsed,
        latency_ms: followupResult.latencyMs
      })
      .select()
      .single();
    expect(insertError).toBeNull();
    expect(followup.content).toBe(followupResult.content);
    
    // Retrieve from database
    const { data: retrieved, error: retrieveError } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('lead_id', testLeadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    expect(retrieveError).toBeNull();
    expect(retrieved.content).toBe(followupResult.content);
    expect(retrieved.type).toBe('email');
    
    console.log('Follow-up persisted and retrieved successfully');
  }, 60000);

  it('should verify HOT/WARM/COLD classification persistence', async () => {
    // Get the latest score
    const { data: latestScore } = await supabase
      .from('scores')
      .select('value')
      .eq('lead_id', testLeadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    expect(latestScore).toBeDefined();
    expect(latestScore!.value).toBeDefined();
    
    const classification = latestScore!.value >= 70 ? 'hot' : latestScore!.value >= 40 ? 'warm' : 'cold';
    const colors = { hot: 'success', warm: 'warning', cold: 'error' };
    
    expect(['hot', 'warm', 'cold']).toContain(classification);
    expect(colors[classification as keyof typeof colors]).toBeDefined();
    
    console.log(`Final classification: ${classification.toUpperCase()} (color: ${colors[classification as keyof typeof colors]})`);
  });
});