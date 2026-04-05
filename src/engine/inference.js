const { SYSTEM_PROMPT } = require('./system_prompt');

// Extract JSON from raw Gemma output
function extractJSON(rawOutput) {
  let cleaned = rawOutput.replace(/```json/g, '').replace(/```/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

// Extract thinking progress for loading UI
function extractProgress(rawOutput) {
  const lines = rawOutput.split('\n');
  const progress = [];
  let inThinking = false;
  for (const line of lines) {
    if (line.includes('Thinking...')) { inThinking = true; continue; }
    if (line.includes('...done thinking.')) { inThinking = false; continue; }
    if (inThinking) {
      const clean = line
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/`/g, '')
        .trim();
      if (clean.length > 15 && !clean.startsWith('{')) {
        progress.push(clean);
      }
    }
  }
  return progress;
}

// Main generation function
async function generateApp(userPrompt) {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:e2b',
        system: SYSTEM_PROMPT,
        prompt: userPrompt,
        stream: false
      })
    });

    if (!response.ok) {
      return { schema: null, error: 'Model not available' };
    }

    const data = await response.json();
    const rawOutput = data.response;
    const schema = extractJSON(rawOutput);
    const progress = extractProgress(rawOutput);

    if (!schema) {
      return { schema: null, error: 'Could not generate valid app. Please try again.' };
    }

    return { schema, progress, error: null };

  } catch (error) {
    return { schema: null, error: 'Generation failed: ' + error.message };
  }
}

module.exports = { generateApp, extractJSON, extractProgress };
