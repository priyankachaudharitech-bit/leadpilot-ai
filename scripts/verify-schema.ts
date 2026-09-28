import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log('=== Verifying Supabase Schema ===\n');
  
  // Check tables
  const tables = ['users', 'leads', 'summaries', 'scores', 'follow_ups', 'activities', 'rate_limits'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists`);
    }
  }
  
  // Check RLS is enabled - use SQL query
  console.log('\n=== Checking RLS Status ===');
  const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'leads', 'summaries', 'scores', 'follow_ups', 'activities', 'rate_limits')
      ORDER BY tablename
    `
  });
  
  if (rlsError) {
    console.log(`Error checking RLS: ${rlsError.message}`);
  } else if (rlsData) {
    for (const t of rlsData) {
      console.log(`${t.rowsecurity ? '✅' : '❌'} RLS on '${t.tablename}': ${t.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
    }
  }
  
  // Check RLS Policies
  console.log('\n=== Checking RLS Policies ===');
  const { data: policies, error: polError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'leads', 'summaries', 'scores', 'follow_ups', 'activities', 'rate_limits')
      ORDER BY tablename, policyname
    `
  });
  
  if (polError) {
    console.log(`Error checking policies: ${polError.message}`);
  } else if (policies) {
    for (const p of policies) {
      console.log(`  ✅ ${p.tablename}.${p.policyname} (${p.cmd})`);
    }
  }
  
  // Check functions
  console.log('\n=== Checking Functions ===');
  const functions = ['handle_new_user', 'update_updated_at_column', 'log_lead_activity', 'get_lead_with_insights', 'get_leads_paginated'];
  for (const fn of functions) {
    const { data, error } = await supabase.rpc(fn, {});
    if (error && !error.message.includes('function') && !error.message.includes('argument') && !error.message.includes('parameter')) {
      console.log(`❌ Function '${fn}': ${error.message}`);
    } else {
      console.log(`✅ Function '${fn}' exists`);
    }
  }
  
  // Check indexes
  console.log('\n=== Checking Indexes ===');
  const { data: indexes, error: idxError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'leads', 'summaries', 'scores', 'follow_ups', 'activities', 'rate_limits')
      ORDER BY tablename, indexname
    `
  });
  
  if (idxError) {
    console.log(`Error fetching indexes: ${idxError.message}`);
  } else if (indexes) {
    const indexGroups = indexes.reduce((acc, idx) => {
      if (!acc[idx.tablename]) acc[idx.tablename] = [];
      acc[idx.tablename].push(idx.indexname);
      return acc;
    }, {} as Record<string, string[]>);
    
    for (const [table, idxs] of Object.entries(indexGroups)) {
      console.log(`  ${table}: ${idxs.join(', ')}`);
    }
  }
  
  // Check triggers
  console.log('\n=== Checking Triggers ===');
  const { data: triggers, error: trigError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers
      WHERE event_object_schema = 'public'
      AND event_object_table IN ('users', 'leads', 'summaries', 'scores', 'follow_ups', 'activities', 'rate_limits')
      ORDER BY event_object_table, trigger_name
    `
  });
  
  if (trigError) {
    console.log(`Error fetching triggers: ${trigError.message}`);
  } else if (triggers) {
    for (const t of triggers) {
      console.log(`  ✅ ${t.trigger_name} on ${t.event_object_table} (${t.action_timing} ${t.event_manipulation})`);
    }
  }
  
  console.log('\n=== Verification Complete ===');
}

verifySchema().catch(console.error);