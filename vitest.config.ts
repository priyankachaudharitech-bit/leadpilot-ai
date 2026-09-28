import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { loadEnv } from 'vite';

const env = loadEnv('', process.cwd(), '');

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e'],
    globals: true,
    env: {
      GROQ_API_KEY: env.GROQ_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
      GROQ_MODEL: env.GROQ_MODEL,
      AI_MAX_TOKENS: env.AI_MAX_TOKENS,
      AI_TEMPERATURE: env.AI_TEMPERATURE,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'src/**/*.d.ts',
        'src/types/**',
        'supabase/migrations/**',
        'tests/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
