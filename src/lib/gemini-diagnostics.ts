/**
 * Diagnostic tool to check Gemini API configuration
 * Run this in browser console to debug API issues
 */

import { listAvailableModels } from './gemini';

export async function diagnoseGeminiAPI() {
  console.log('=== Gemini API Diagnostics ===');
  console.log('API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY);
  console.log('API Key (first 10 chars):', import.meta.env.VITE_GEMINI_API_KEY?.substring(0, 10) + '...');
  
  try {
    console.log('\nFetching available models...');
    const models = await listAvailableModels();
    console.log('Available models:', models);
    
    if (models.length === 0) {
      console.error('❌ No models available! This could mean:');
      console.error('1. API key is invalid');
      console.error('2. API key doesn\'t have access to Gemini models');
      console.error('3. API endpoint is incorrect');
      console.error('\nPlease check:');
      console.error('- Is your API key from Google AI Studio?');
      console.error('- Does it have Gemini API access enabled?');
      console.error('- Try creating a new API key at: https://makersuite.google.com/app/apikey');
    } else {
      console.log('✅ Found', models.length, 'available models');
      console.log('You can use any of these models in your code.');
    }
  } catch (error) {
    console.error('❌ Error fetching models:', error);
    console.error('\nPossible issues:');
    console.error('1. API key is invalid or expired');
    console.error('2. Network/CORS issue');
    console.error('3. API endpoint format is wrong');
  }
  
  console.log('\n=== End Diagnostics ===');
}

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).diagnoseGeminiAPI = diagnoseGeminiAPI;
}

