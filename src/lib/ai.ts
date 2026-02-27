const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

export async function summariseNotes(title: string, author: string, thoughts: string): Promise<string> {
  const prompt = `You are a literary editor. The following are a reader's personal reflections on "${title}" by ${author}. Write a 2–3 sentence literary summary of their reading experience. Be elegant, specific, and avoid clichés. Do not begin with "The reader" — make it feel like a capsule review.\n\nReflections: ${thoughts}`;
  return callClaude(prompt);
}

export async function extractThemes(title: string, author: string, thoughts: string): Promise<string[]> {
  const prompt = `You are a literary critic. Based on these reader reflections on "${title}" by ${author}, identify 3–5 intellectual or literary themes present in the book or the reader's engagement with it. Return ONLY a JSON array of theme strings, each 1–3 words. No explanation, no markdown, just the JSON array.\n\nReflections: ${thoughts}`;
  const raw = await callClaude(prompt);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return raw.split('\n').filter(Boolean).slice(0, 5);
  }
}

export async function suggestBooks(title: string, author: string, thoughts: string): Promise<Array<{ title: string; author: string; reason: string }>> {
  const prompt = `Based on these reflections on "${title}" by ${author}, recommend 3 books this reader would genuinely love. Return ONLY a JSON array of objects with keys: title, author, reason (one elegant sentence). No markdown, just valid JSON.\n\nReflections: ${thoughts}`;
  const raw = await callClaude(prompt);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}
