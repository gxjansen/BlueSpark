import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const webhookUrl = process.env.VITE_ANALYTICS_WEBHOOK_URL;

if (!webhookUrl) {
  console.error('No webhook URL found in .env file');
  process.exit(1);
}

// Function to send events
async function sendEvent(eventData) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...eventData,
      timestamp: new Date().toISOString(),
      environment: 'test',
      app_version: '1.0.0',
      app_url: 'https://bluespark.gui.do',
      user_agent: 'Test Script'
    })
  });

  console.log(`${eventData.event} event status:`, response.status);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const text = await response.text();
  console.log('Response:', text);
}

// Test both login and API usage events
async function runTests() {
  try {
    console.log('Sending test login event...');
    await sendEvent({
      event: 'login',
      handle: '@gui.do'
    });

    console.log('\nSending test API usage event...');
    await sendEvent({
      event: 'api_usage',
      handle: '@gui.do',
      calls: 10,
      type: 'openrouter'
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

runTests();
