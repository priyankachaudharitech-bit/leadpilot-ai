import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToUpdate) {
          try {
            cookiesToUpdate.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if middleware is already handling cookies.
          }
        },
      },
    }
  );
}
