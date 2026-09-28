import { createClient } from '@/lib/supabase/server';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const DEFAULT_AI_RATE_LIMIT = 30;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

async function getRateLimitFromDb(userId: string, action: string): Promise<{ count: number; windowStart: number } | null> {
  try {
    const supabase = await createClient();
    const { data } = await (supabase as any)
      .from('rate_limits')
      .select('count, window_start')
      .eq('user_id', userId)
      .eq('action', action)
      .single();
    return data ? { count: data.count, windowStart: new Date(data.window_start).getTime() } : null;
  } catch {
    return null;
  }
}

async function setRateLimitInDb(userId: string, action: string, count: number, windowStart: number): Promise<void> {
  try {
    const supabase = await createClient();
    await (supabase as any).from('rate_limits').upsert({
      user_id: userId,
      action,
      count,
      window_start: new Date(windowStart).toISOString(),
    });
  } catch {
    // Silently fail - rate limiting is best effort
  }
}

export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number = DEFAULT_AI_RATE_LIMIT,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = memoryStore.get(key);

  if (!entry || entry.windowStart < windowStart) {
    const dbEntry = await getRateLimitFromDb(userId, action);
    if (dbEntry && dbEntry.windowStart >= windowStart) {
      entry = { count: dbEntry.count, windowStart: dbEntry.windowStart };
    } else {
      entry = { count: 0, windowStart: now };
    }
  }

  if (entry.count >= limit) {
    const resetAt = entry.windowStart + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.count += 1;
  memoryStore.set(key, entry);

  await setRateLimitInDb(userId, action, entry.count, entry.windowStart);

  const resetAt = entry.windowStart + windowMs;
  return { allowed: true, remaining: Math.max(0, limit - entry.count), resetAt };
}

export function getRateLimitHeaders(remaining: number, resetAt: number, limit: number = DEFAULT_AI_RATE_LIMIT): HeadersInit {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString(),
  };
}