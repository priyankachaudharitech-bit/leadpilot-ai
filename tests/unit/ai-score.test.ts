import { describe, it, expect, beforeAll } from 'vitest';
import { generateScore, classifyScore, getScoreColor } from '@/lib/ai/score';

describe('AI Score - Real Groq Integration', () => {
  const testLead = {
    name: 'Sarah Johnson',
    email: 'sarah.j@techstart.io',
    company: 'TechStart.io',
    title: 'CTO',
    source: 'referral',
    notes: 'Referred by existing customer. Urgent need to replace legacy deployment system. Evaluating 3 vendors. Decision in 2 weeks. Team of 8 developers.',
    custom_fields: { company_size: '50-200', industry: 'FinTech', budget: 'approved' }
  };

  it('should generate a real AI score with Groq', async () => {
    const result = await generateScore(testLead);
    
    expect(result).toBeDefined();
    expect(result.value).toBeDefined();
    expect(typeof result.value).toBe('number');
    expect(result.value).toBeGreaterThanOrEqual(0);
    expect(result.value).toBeLessThanOrEqual(100);
    expect(result.fit_score).toBeGreaterThanOrEqual(0);
    expect(result.fit_score).toBeLessThanOrEqual(100);
    expect(result.intent_score).toBeGreaterThanOrEqual(0);
    expect(result.intent_score).toBeLessThanOrEqual(100);
    expect(result.engagement_score).toBeGreaterThanOrEqual(0);
    expect(result.engagement_score).toBeLessThanOrEqual(100);
    expect(result.factors).toBeDefined();
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThan(0);
    
    console.log('Score:', result.value);
    console.log('Fit:', result.fit_score);
    console.log('Intent:', result.intent_score);
    console.log('Engagement:', result.engagement_score);
    console.log('Factors:', JSON.stringify(result.factors, null, 2));
    console.log('Tokens Used:', result.tokensUsed);
    console.log('Latency:', result.latencyMs, 'ms');
  }, 30000);

  it('should classify HOT/WARM/COLD correctly', () => {
    expect(classifyScore(85)).toBe('hot');
    expect(classifyScore(70)).toBe('hot');
    expect(classifyScore(69)).toBe('warm');
    expect(classifyScore(40)).toBe('warm');
    expect(classifyScore(39)).toBe('cold');
    expect(classifyScore(0)).toBe('cold');
  });

  it('should return correct colors for score ranges', () => {
    expect(getScoreColor(85)).toBe('success');
    expect(getScoreColor(70)).toBe('success');
    expect(getScoreColor(69)).toBe('warning');
    expect(getScoreColor(40)).toBe('warning');
    expect(getScoreColor(39)).toBe('error');
    expect(getScoreColor(0)).toBe('error');
  });
});