const { SYSTEM_PROMPT } = require('./system_prompt');

const DEFAULT_MODEL = 'gemma4:e2b';
const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';

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

function getNativeLLMModule() {
  try {
    const { NativeModules } = require('react-native');
    return NativeModules?.PocketCoderLLM || NativeModules?.PocketCoderOnDeviceLLM || null;
  } catch (error) {
    return null;
  }
}

function getConfig(overrides = {}) {
  return {
    provider: overrides.provider,
    modelName: overrides.modelName || DEFAULT_MODEL,
    ollamaBaseUrl: overrides.ollamaBaseUrl || DEFAULT_OLLAMA_BASE_URL
  };
}

function resolveProvider(config) {
  if (config.provider) return config.provider;
  return getNativeLLMModule() ? 'on_device' : 'ollama';
}

async function generateWithOnDeviceModel(userPrompt, config) {
  const nativeModule = getNativeLLMModule();
  if (!nativeModule || typeof nativeModule.generate !== 'function') {
    return {
      schema: null,
      error: 'On-device model runtime is not installed. Add PocketCoderLLM native module to iOS build.'
    };
  }

  const rawResult = await nativeModule.generate({
    model: config.modelName,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    format: 'json'
  });

  const rawOutput =
    typeof rawResult === 'string'
      ? rawResult
      : rawResult?.text || rawResult?.output || rawResult?.response || '';

  const schema = extractJSON(rawOutput);
  const progress = extractProgress(rawOutput);

  if (!schema) {
    return { schema: null, error: 'On-device model returned invalid JSON. Please try again.' };
  }

  return { schema, progress, error: null };
}

async function generateWithOllama(userPrompt, config) {
  const baseUrl = config.ollamaBaseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.modelName,
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
}

// Main generation function
async function generateApp(userPrompt, overrides = {}) {
  const config = getConfig(overrides);
  const provider = resolveProvider(config);

  try {
    if (provider === 'on_device') {
      return await generateWithOnDeviceModel(userPrompt, config);
    }
    return await generateWithOllama(userPrompt, config);
  } catch (error) {
    return { schema: null, error: 'Generation failed: ' + error.message };
  }
}

module.exports = {
  generateApp,
  extractJSON,
  extractProgress,
  getNativeLLMModule
};
