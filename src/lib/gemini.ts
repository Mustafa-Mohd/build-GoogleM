/**
 * Google Gemini API Integration
 * Handles all API calls to Google Gemini
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * List available models for the API key
 */
export async function listAvailableModels(): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }

  try {
    const url = `${GEMINI_API_URL}/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      console.error('Failed to list models:', response.status, errorMessage);
      throw new Error(`Failed to list models: ${errorMessage}`);
    }

    const data = await response.json();
    const models = data.models?.map((m: any) => {
      // Extract model name (could be "models/gemini-pro" or just "gemini-pro")
      const name = m.name || '';
      return name.replace('models/', '');
    }).filter((name: string) => name.length > 0) || [];
    
    console.log('Fetched available models:', models);
    return models;
  } catch (error) {
    console.error('Error listing models:', error);
    // Return empty array instead of throwing so fallback models can be used
    return [];
  }
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }>;
}

/**
 * Convert image file to base64
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Call Gemini API for text generation
 */
export async function callGeminiAPI(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
  } = {}
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // First, try to get available models
  let modelsToTry: string[] = [];
  try {
    const availableModels = await listAvailableModels();
    console.log('Available models:', availableModels);
    
    if (availableModels.length > 0) {
      // Use available models, prioritizing common ones
      const preferredModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
      for (const preferred of preferredModels) {
        const found = availableModels.find(m => m.includes(preferred) || preferred.includes(m));
        if (found) {
          modelsToTry.push(found);
        }
      }
      // If no preferred models found, use first available
      if (modelsToTry.length === 0) {
        modelsToTry = [availableModels[0]];
      }
    } else {
      // Fallback to defaults if listing fails
      modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    }
  } catch (error) {
    console.warn('Could not fetch available models, using defaults:', error);
    modelsToTry = options.model ? [options.model] : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  }
  
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens || 2048;

  const requestBody: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  if (options.systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  // Try each model until one works
  let lastError: Error | null = null;
  for (const model of modelsToTry) {
      const url = `${GEMINI_API_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        lastError = new Error(`Model "${model}" failed: ${errorMessage}`);
        
        // If it's a 404, try next model
        if (response.status === 404) {
          continue;
        }
        
        throw new Error(
          response.status === 403 && errorMessage.includes('leaked')
            ? `Your API key was leaked and is no longer valid. Please create a new API key at https://makersuite.google.com/app/apikey and update your .env file.`
            : response.status === 429
            ? `API quota exceeded. Please wait or check your quota limits.`
            : `Gemini API error: ${response.status} - ${errorMessage}`
        );
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      return text;
    } catch (error) {
      // If this is the last model to try, throw the error
      if (model === modelsToTry[modelsToTry.length - 1]) {
        console.error('All Gemini models failed. Last error:', error);
        throw lastError || error;
      }
      // Otherwise, continue to next model
      continue;
    }
  }
  
  // If we get here, all models failed
  throw lastError || new Error('All Gemini models failed. Please check your API key and model availability.');
}

/**
 * Call Gemini API with image input
 */
export async function callGeminiVisionAPI(
  prompt: string,
  images: File[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // First, try to get available models
  let modelsToTry: string[] = [];
  try {
    const availableModels = await listAvailableModels();
    console.log('Available models for vision:', availableModels);
    
    if (availableModels.length > 0) {
      // Use available models, prioritizing vision-capable ones
      const preferredModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
      for (const preferred of preferredModels) {
        const found = availableModels.find(m => m.includes(preferred) || preferred.includes(m));
        if (found) {
          modelsToTry.push(found);
        }
      }
      // If no preferred models found, use first available
      if (modelsToTry.length === 0) {
        modelsToTry = [availableModels[0]];
      }
    } else {
      // Fallback to defaults if listing fails
      modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-pro'];
    }
  } catch (error) {
    console.warn('Could not fetch available models, using defaults:', error);
    modelsToTry = options.model ? [options.model] : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-pro'];
  }
  
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens || 2048;

  // Convert images to base64
  const imagePromises = images.map(async (img) => {
    const base64 = await imageToBase64(img);
    const mimeType = img.type || 'image/jpeg';
    return {
      inline_data: {
        mime_type: mimeType,
        data: base64,
      },
    };
  });

  const imageParts = await Promise.all(imagePromises);

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          ...imageParts,
        ],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  // Try each model until one works
  let lastError: Error | null = null;
  for (const model of modelsToTry) {
      const url = `${GEMINI_API_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        lastError = new Error(`Model "${model}" failed: ${errorMessage}`);
        
        // If it's a 404, try next model
        if (response.status === 404) {
          continue;
        }
        
        throw new Error(
          response.status === 403 && errorMessage.includes('leaked')
            ? `Your API key was leaked and is no longer valid. Please create a new API key at https://makersuite.google.com/app/apikey and update your .env file.`
            : response.status === 429
            ? `API quota exceeded. Please wait or check your quota limits.`
            : `Gemini API error: ${response.status} - ${errorMessage}`
        );
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      return text;
    } catch (error) {
      // If this is the last model to try, throw the error
      if (model === modelsToTry[modelsToTry.length - 1]) {
        console.error('All Gemini models failed. Last error:', error);
        throw lastError || error;
      }
      // Otherwise, continue to next model
      continue;
    }
  }
  
  // If we get here, all models failed
  throw lastError || new Error('All Gemini models failed. Please check your API key and model availability.');
}

/**
 * Chat with Gemini (maintains conversation context)
 */
export async function chatWithGemini(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // First, try to get available models
  let modelsToTry: string[] = [];
  try {
    const availableModels = await listAvailableModels();
    console.log('Available models for chat:', availableModels);
    
    if (availableModels.length > 0) {
      // Use available models, prioritizing common ones
      const preferredModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
      for (const preferred of preferredModels) {
        const found = availableModels.find(m => m.includes(preferred) || preferred.includes(m));
        if (found) {
          modelsToTry.push(found);
        }
      }
      // If no preferred models found, use first available
      if (modelsToTry.length === 0) {
        modelsToTry = [availableModels[0]];
      }
    } else {
      // Fallback to defaults if listing fails
      modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    }
  } catch (error) {
    console.warn('Could not fetch available models, using defaults:', error);
    modelsToTry = options.model ? [options.model] : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  }
  
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens || 2048;

  // Convert messages to Gemini format
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const requestBody = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  // Try each model until one works
  let lastError: Error | null = null;
  for (const model of modelsToTry) {
      const url = `${GEMINI_API_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        lastError = new Error(`Model "${model}" failed: ${errorMessage}`);
        
        // If it's a 404, try next model
        if (response.status === 404) {
          continue;
        }
        
        throw new Error(
          response.status === 403 && errorMessage.includes('leaked')
            ? `Your API key was leaked and is no longer valid. Please create a new API key at https://makersuite.google.com/app/apikey and update your .env file.`
            : response.status === 429
            ? `API quota exceeded. Please wait or check your quota limits.`
            : `Gemini API error: ${response.status} - ${errorMessage}`
        );
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      return text;
    } catch (error) {
      // If this is the last model to try, throw the error
      if (model === modelsToTry[modelsToTry.length - 1]) {
        console.error('All Gemini models failed. Last error:', error);
        throw lastError || error;
      }
      // Otherwise, continue to next model
      continue;
    }
  }
  
  // If we get here, all models failed
  throw lastError || new Error('All Gemini models failed. Please check your API key and model availability.');
}

