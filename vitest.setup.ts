import { resetProvider, setProvider } from '@/lib/ai/providers/factory';

// Configure provider with the actual API key from env
const groqApiKey = process.env.GROQ_API_KEY;
if (groqApiKey) {
  resetProvider();
  setProvider('groq', groqApiKey);
}