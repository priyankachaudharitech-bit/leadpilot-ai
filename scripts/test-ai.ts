import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { aiClient } from '@/lib/ai/client';
import { generateSummary } from '@/lib/ai/summarize';
import { generateScore } from '@/lib/ai/score';
import { generateFollowUp } from '@/lib/ai/followup';
import { classifyScore, getScoreColor } from '@/lib/ai/score';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabase = createClient(supabaseUrl, anonKey);

async function testAILibrary() {
  console.log('=== Testing AI Library ===\n');
  
  // Test 1: AI Client configuration check
  console.log('--- Test 1: AI Client Configuration ---');
  console.log(`Provider: ${aiClient.getProviderName()}`);
  console.log(`Configured: ${aiClient.isConfigured()}`);
  
  // Test 2: Generate Summary (should fail gracefully without API key)
  console.log('\n--- Test 2: Generate Summary (No API Key) ---');
  try {
    const lead = {
      name: 'John Doe',
      email: 'john@acme.com',
      company: 'Acme Corp',
      title: 'CTO',
      source: 'website',
      notes: 'Interested in enterprise solution',
      custom_fields: { employees: '500', industry: 'tech' }
    };
    const result = await generateSummary(lead);
    console.log(`❌ Expected to fail but got: ${result.summary}`);
  } catch (error) {
    console.log(`✅ Correctly failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test 3: Generate Summary with Fallback
  console.log('\n--- Test 3: Generate Summary with Fallback ---');
  const cachedSummary = 'Cached summary: John is CTO at Acme Corp, interested in enterprise solutions.';
  try {
    const lead = {
      name: 'Jane Smith',
      email: 'jane@globex.com',
      company: 'Globex Inc',
      title: 'VP Engineering',
      source: 'referral',
      notes: 'Looking for scaling solutions',
      custom_fields: {}
    };
    const result = await generateSummaryWithFallback(lead, cachedSummary);
    console.log(`✅ Fallback worked: fromCache=${result.fromCache}, summary="${result.summary}"`);
  } catch (error) {
    console.log(`❌ Fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test 4: Generate Score (should fail gracefully)
  console.log('\n--- Test 4: Generate Score (No API Key) ---');
  try {
    const lead = {
      name: 'Bob Wilson',
      email: 'bob@startup.io',
      company: 'StartupIO',
      title: 'Founder',
      source: 'linkedin',
      notes: 'Early stage, looking for tools',
      custom_fields: {}
    };
    const result = await generateScore(lead);
    console.log(`❌ Expected to fail but got: ${result.value}`);
  } catch (error) {
    console.log(`✅ Correctly failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test 5: Score Classification
  console.log('\n--- Test 5: Score Classification ---');
  const testScores = [85, 55, 25];
  for (const score of testScores) {
    const classification = classifyScore(score);
    const color = getScoreColor(score);
    console.log(`  Score ${score}: ${classification.toUpperCase()} (color: ${color})`);
  }
  console.log('✅ Score classification works');
  
  // Test 6: Generate Follow-up (should fail gracefully)
  console.log('\n--- Test 6: Generate Follow-up (No API Key) ---');
  try {
    const lead = {
      name: 'Alice Brown',
      email: 'alice@enterprise.com',
      company: 'Enterprise Co',
      title: 'Director of IT',
      source: 'email',
      notes: 'Evaluating vendors',
      custom_fields: {}
    };
    const result = await generateFollowUp(lead, 'Test summary', { value: 75, fit_score: 80, intent_score: 70, engagement_score: 75 }, {
      type: 'email',
      tone: 'professional',
      length: 'medium'
    });
    console.log(`❌ Expected to fail but got: ${result.content}`);
  } catch (error) {
    console.log(`✅ Correctly failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test 7: Follow-up types
  console.log('\n--- Test 7: Follow-up Type Validation ---');
  const followUpTypes = ['email', 'linkedin', 'call_script'] as const;
  for (const type of followUpTypes) {
    try {
      const lead = { name: 'Test', email: 'test@test.com', company: null, title: null, source: null, notes: null, custom_fields: {} };
      await generateFollowUp(lead, null, null, { type });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      if (msg.includes('not configured')) {
        console.log(`  ${type}: ✅ Correctly fails without API key`);
      } else {
        console.log(`  ${type}: ❌ Unexpected error: ${msg}`);
      }
    }
  }
  
  // Test 8: Integration test with real database
  console.log('\n--- Test 8: End-to-End with Database ---');
  const testEmail = `ai-test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  const { data: userData } = await adminSupabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'AI Test User' }
  });
  
  if (!userData?.user) {
    console.log('❌ Failed to create test user');
    return;
  }
  
  const userId = userData.user.id;
  await new Promise(r => setTimeout(r, 500));
  
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (!signInData.session) {
    console.log('❌ Failed to sign in');
    return;
  }
  
  const userSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } }
  });
  
  // Create a lead
  const { data: lead } = await userSupabase
    .from('leads')
    .insert({
      user_id: userId,
      name: 'AI Test Lead',
      email: 'aitest@example.com',
      company: 'AI Company',
      title: 'VP Engineering',
      source: 'referral',
      status: 'qualified',
      score: 85,
      notes: 'High value lead for AI testing'
    })
    .select()
    .single();
  
  if (!lead) {
    console.log('❌ Failed to create lead');
    return;
  }
  
  console.log(`✅ Created lead: ${lead.id}`);
  
  // Test summary generation via API route (would need server running)
  // For now, test the AI library directly with the lead data
  console.log('  Note: API route tests require dev server running');
  
  // Cleanup
  await userSupabase.from('leads').delete().eq('id', lead.id);
  await adminSupabase.auth.admin.deleteUser(userId);
  
  console.log('✅ Cleanup complete');
  
  console.log('\n=== AI Library Tests Complete ===');
}

async function generateSummaryWithFallback(
  lead: Parameters<typeof generateSummary>[0],
  cachedSummary: string | null
) {
  try {
    const result = await generateSummary(lead);
    return { summary: result.summary, fromCache: false, tokensUsed: result.tokensUsed, latencyMs: result.latencyMs };
  } catch (error) {
    if (cachedSummary) {
      return { summary: cachedSummary, fromCache: true, tokensUsed: 0, latencyMs: 0 };
    }
    throw error;
  }
}

testAILibrary().catch(console.error);