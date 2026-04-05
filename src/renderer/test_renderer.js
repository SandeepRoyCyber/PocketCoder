const { generateApp } = require('../engine/inference');
const { generateHTML } = require('./generateHTML');
const fs = require('fs');

async function test() {
  console.log('🚀 Testing full pipeline...\n');
  console.log('Step 1: Generating JSON from prompt...');

  const result = await generateApp(`
    Create a medicine tracker for my mother.
    She takes one tablet every 6 hours.
    She visits Dr. Sharma every month.
  `);

  if (result.error) {
    console.log('❌ Error:', result.error);
    return;
  }

  console.log('✅ JSON generated successfully');
  console.log('📱 App:', result.schema.app_name);
  console.log('\nStep 2: Generating HTML from JSON...');

  const html = generateHTML(result.schema);
  
  const outputPath = '/workspaces/PocketCoder/src/renderer/preview.html';
  fs.writeFileSync(outputPath, html);

  console.log('✅ HTML generated successfully');
  console.log('📄 Preview saved to: src/renderer/preview.html');
  console.log('📊 File size:', (html.length / 1024).toFixed(1), 'KB');
  console.log('\n🎉 Full pipeline working!');
  console.log('\nSchema summary:');
  console.log('  App type:', result.schema.app_type);
  console.log('  Screens:', result.schema.screens?.length);
  console.log('  Alerts:', result.schema.alerts?.length);
  console.log('  Rules:', result.schema.rules?.length);
}

test().catch(console.error);
