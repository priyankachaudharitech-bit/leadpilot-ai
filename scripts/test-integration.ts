import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role
const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Regular anon client
const supabase = createClient(supabaseUrl, anonKey);

async function testAuthAndCRUD() {
  console.log('=== Testing Supabase Integration ===\n');
  
  // Test 1: Create user via admin API (bypasses email)
  console.log('--- Test 1: Create User (Admin API) ---');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Test User' }
  });
  
  if (createError) {
    console.log(`❌ User creation failed: ${createError.message}`);
    return;
  }
  
  console.log(`✅ User created: ${userData.user?.email}`);
  const userId = userData.user?.id;
  
  // Wait for trigger to create profile
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 2: Verify user profile was created
  console.log('\n--- Test 2: Verify Profile Creation ---');
  const { data: profile, error: profileError } = await adminSupabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.log(`❌ Profile check failed: ${profileError.message}`);
  } else {
    console.log(`✅ Profile created: ${profile.email}, name: ${profile.name}`);
  }
  
  // Test 3: Sign in with the created user
  console.log('\n--- Test 3: User Sign In ---');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (signInError) {
    console.log(`❌ Sign in failed: ${signInError.message}`);
    return;
  }
  
  console.log(`✅ User signed in: ${signInData.user?.email}`);
  const session = signInData.session;
  
  // Create a new client with the user's session
  const userSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${session?.access_token}` } }
  });
  
  // Test 4: Create a lead (RLS test - should work)
  console.log('\n--- Test 4: Create Lead (RLS Test) ---');
  const { data: lead, error: leadError } = await userSupabase
    .from('leads')
    .insert({
      user_id: userId,
      name: 'Test Lead',
      email: 'lead@example.com',
      company: 'Test Company',
      title: 'CTO',
      source: 'website',
      status: 'new',
      notes: 'Test note'
    })
    .select()
    .single();
  
  if (leadError) {
    console.log(`❌ Lead creation failed: ${leadError.message}`);
  } else {
    console.log(`✅ Lead created: ${lead.name} (${lead.id})`);
  }
  
  const leadId = lead?.id;
  
  // Test 5: Read own lead (RLS test - should work)
  console.log('\n--- Test 5: Read Own Lead (RLS Test) ---');
  const { data: readLead, error: readError } = await userSupabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (readError) {
    console.log(`❌ Read lead failed: ${readError.message}`);
  } else {
    console.log(`✅ Read own lead: ${readLead.name}`);
  }
  
  // Test 6: Update own lead (RLS test - should work)
  console.log('\n--- Test 6: Update Own Lead (RLS Test) ---');
  const { data: updatedLead, error: updateError } = await userSupabase
    .from('leads')
    .update({ status: 'contacted', notes: 'Updated note' })
    .eq('id', leadId)
    .select()
    .single();
  
  if (updateError) {
    console.log(`❌ Update lead failed: ${updateError.message}`);
  } else {
    console.log(`✅ Updated lead status to: ${updatedLead.status}`);
  }
  
  // Test 7: Test RLS isolation - create another user and try to access first user's lead
  console.log('\n--- Test 7: RLS Isolation Test ---');
  const otherEmail = `other-${Date.now()}@example.com`;
  const { data: otherUserData } = await adminSupabase.auth.admin.createUser({
    email: otherEmail,
    password: 'TestPass123!',
    email_confirm: true,
    user_metadata: { full_name: 'Other User' }
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  const { data: otherSignIn } = await supabase.auth.signInWithPassword({
    email: otherEmail,
    password: 'TestPass123!'
  });
  
  const otherSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${otherSignIn.session?.access_token}` } }
  });
  
  const { data: otherRead, error: otherReadError } = await otherSupabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (otherReadError && otherReadError.code === 'PGRST116') {
    console.log(`✅ RLS Isolation WORKS: Other user cannot access lead (PGRST116 - no rows)`);
  } else if (otherRead) {
    console.log(`❌ RLS Isolation FAILED: Other user CAN access lead: ${otherRead.name}`);
  } else {
    console.log(`❌ RLS Isolation check error: ${otherReadError?.message}`);
  }
  
  // Test 8: Test Leads CRUD - List leads
  console.log('\n--- Test 8: List Leads ---');
  const { data: leadsList, error: listError } = await userSupabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (listError) {
    console.log(`❌ List leads failed: ${listError.message}`);
  } else {
    console.log(`✅ Listed ${leadsList?.length} lead(s)`);
  }
  
  // Test 9: Test activity logging trigger
  console.log('\n--- Test 9: Activity Logging Trigger ---');
  const { data: activities, error: actError } = await userSupabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId);
  
  if (actError) {
    console.log(`❌ Activity check failed: ${actError.message}`);
  } else {
    console.log(`✅ Activities logged: ${activities?.length} activity(ies)`);
    activities?.forEach(a => console.log(`   - ${a.type}: ${a.description}`));
  }
  
  // Test 10: Delete lead (RLS test - should work)
  console.log('\n--- Test 10: Delete Lead (RLS Test) ---');
  const { error: deleteError } = await userSupabase
    .from('leads')
    .delete()
    .eq('id', leadId);
  
  if (deleteError) {
    console.log(`❌ Delete lead failed: ${deleteError.message}`);
  } else {
    console.log(`✅ Lead deleted successfully`);
  }
  
  // Test 11: Verify deleted lead is gone
  const { data: deletedCheck } = await userSupabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (!deletedCheck) {
    console.log(`✅ Lead confirmed deleted`);
  }
  
  // Test 12: Test rate_limits table
  console.log('\n--- Test 12: Rate Limits Table ---');
  const { data: rateLimit, error: rlError } = await userSupabase
    .from('rate_limits')
    .upsert({
      user_id: userId,
      action: 'ai_summary',
      count: 1,
      window_start: new Date().toISOString()
    })
    .select()
    .single();
  
  if (rlError) {
    console.log(`❌ Rate limit test failed: ${rlError.message}`);
  } else {
    console.log(`✅ Rate limit entry created: ${rateLimit.action} = ${rateLimit.count}`);
  }
  
  // Test 13: Test AI functions (get_lead_with_insights, get_leads_paginated)
  console.log('\n--- Test 13: AI Helper Functions ---');
  // First create a new lead for testing
  const { data: newLead } = await userSupabase
    .from('leads')
    .insert({
      user_id: userId,
      name: 'AI Test Lead',
      email: 'ai-test@example.com',
      company: 'AI Company',
      title: 'VP Engineering',
      source: 'referral',
      status: 'qualified',
      score: 85,
      notes: 'High value lead'
    })
    .select()
    .single();
  
  if (newLead) {
    // Test get_lead_with_insights
    const { data: insights, error: insightsError } = await userSupabase.rpc('get_lead_with_insights', {
      lead_uuid: newLead.id
    });
    
    if (insightsError) {
      console.log(`❌ get_lead_with_insights failed: ${insightsError.message}`);
    } else {
      console.log(`✅ get_lead_with_insights works: ${insights?.name}`);
    }
    
    // Test get_leads_paginated
    const { data: paginated, error: pageError } = await userSupabase.rpc('get_leads_paginated', {
      p_user_id: userId,
      p_page: 1,
      p_limit: 10
    });
    
    if (pageError) {
      console.log(`❌ get_leads_paginated failed: ${pageError.message}`);
    } else {
      console.log(`✅ get_leads_paginated works: ${paginated?.length} leads, total: ${paginated?.[0]?.total_count}`);
    }
  }
  
  // Test 14: Sign out
  console.log('\n--- Test 14: Sign Out ---');
  await supabase.auth.signOut();
  console.log(`✅ Signed out`);
  
  console.log('\n=== All Tests Completed ===');
}

testAuthAndCRUD().catch(console.error);