import { describe, it, expect } from 'vitest';
import { generateFollowUp, FollowUpType, FollowUpTone, FollowUpLength } from '@/lib/ai/followup';

describe('AI Follow-up - Real Groq Integration', () => {
  const testLead = {
    name: 'Michael Chen',
    email: 'mchen@globaltech.com',
    company: 'GlobalTech Solutions',
    title: 'Director of DevOps',
    source: 'linkedin',
    notes: 'Connected on LinkedIn. Mentioned they are evaluating CI/CD tools for their Kubernetes migration. Team of 12. Currently using GitLab CI.',
    custom_fields: { company_size: '500-1000', industry: 'Enterprise Software' }
  };

  const testSummary = 'Michael leads DevOps at GlobalTech (500-1000 employees) and is actively evaluating CI/CD solutions for their Kubernetes migration. Currently on GitLab CI but looking for better scalability. Budget approved, decision timeline Q2.';

  const testScore = { value: 82, fit_score: 85, intent_score: 90, engagement_score: 65 };

  it('should generate email follow-up', async () => {
    const result = await generateFollowUp(testLead, testSummary, testScore, { type: 'email', tone: 'professional', length: 'medium' });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe('string');
    expect(result.content.length).toBeGreaterThan(50);
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThan(0);
    
    console.log('Email Follow-up:');
    console.log(result.content);
    console.log('Tokens:', result.tokensUsed, '| Latency:', result.latencyMs, 'ms');
  }, 30000);

  it('should generate LinkedIn follow-up', async () => {
    const result = await generateFollowUp(testLead, testSummary, testScore, { type: 'linkedin', tone: 'casual', length: 'short' });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeLessThan(300);
    expect(result.tokensUsed).toBeGreaterThan(0);
    
    console.log('LinkedIn Follow-up:');
    console.log(result.content);
    console.log('Tokens:', result.tokensUsed, '| Latency:', result.latencyMs, 'ms');
  }, 30000);

  it('should generate call script follow-up', async () => {
    const result = await generateFollowUp(testLead, testSummary, testScore, { type: 'call_script', tone: 'consultative', length: 'long' });
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(200);
    expect(result.tokensUsed).toBeGreaterThan(0);
    
    console.log('Call Script Follow-up:');
    console.log(result.content);
    console.log('Tokens:', result.tokensUsed, '| Latency:', result.latencyMs, 'ms');
  }, 30000);
});