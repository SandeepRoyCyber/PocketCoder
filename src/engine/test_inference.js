const { SYSTEM_PROMPT } = require('./system_prompt');

async function test() {
  console.log('🚀 Testing PocketCoder inference engine...\n');

  const prompt = `Create a medicine tracker for my mother.
She takes one tablet every 6 hours.
She visits Dr. Sharma every month.`;

  console.log('📝 Prompt:', prompt);
  console.log('\n⏳ Generating... (may take 30-60 seconds on CPU)\n');

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma4:e2b',
      system: SYSTEM_PROMPT,
      prompt: prompt,
      stream: false
    })
  });

  const data = await response.json();
  console.log('✅ Raw output received');
  console.log('\n--- OUTPUT ---');
  console.log(data.response);
}

test().catch(console.error);
