import { describe, it, expect, beforeAll } from 'vitest';
import { generateSummary } from '@/lib/ai/summarize';

describe('AI Summarize - Real Groq Integration', () => {
  const testLead = {
    name: 'John Smith',
    email: 'john.smith@acmecorp.com',
    company: 'Acme Corporation',
    title: 'VP of Engineering',
    source: 'website',
    notes: 'Interested in scaling their CI/CD pipeline. Currently using Jenkins but evaluating alternatives. Team of 15 engineers. Budget approved for Q2.',
    custom_fields: { company_size: '200-500', industry: 'SaaS' }
  };

  it('should generate a real AI summary with Groq', async () => {
    const result = await generateSummary(testLead);
    
    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(typeof result.summary).toBe('string');
    expect(result.summary.length).toBeGreaterThan(20);
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThan(0);
    
    console.log('Generated Summary:', result.summary);
    console.log('Tokens Used:', result.tokensUsed);
    console.log('Latency:', result.latencyMs, 'ms');
  }, 30000);

  it('should generate concise 2-3 sentence summary', async () => {
    const result = await generateSummary(testLead);
    const sentences = result.summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    expect(sentences.length).toBeGreaterThanOrEqual(2);
    expect(sentences.length).toBeLessThanOrEqual(4);
  }, 30000);
});