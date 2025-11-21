import { createWorker, PSM } from 'tesseract.js';
import { ParsedCardData } from './dataParser';

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Clean OCR text by removing noise while preserving important information
 */
function cleanOCRText(text: string): string {
  if (!text) return '';
  
  // Remove excessive whitespace but preserve line breaks
  let cleaned = text.replace(/[ \t]+/g, ' ').trim();
  
  // Remove lines with only symbols or very short random text
  // But be more lenient - keep lines with numbers or meaningful content
  const lines = cleaned.split('\n').filter(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;
    
    // Keep lines that have:
    // - At least 2 alphanumeric characters (letters or numbers)
    // - Or contain numbers (phone numbers, addresses, etc.)
    // - Or are longer than 3 characters (might be meaningful)
    const alphanumericCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
    const hasNumbers = /\d/.test(trimmed);
    const hasLetters = /[a-zA-Z]/.test(trimmed);
    
    return (alphanumericCount >= 2) || (hasNumbers && hasLetters) || trimmed.length > 3;
  });
  
  return lines.join('\n').trim();
}

/**
 * Convert image file to base64 for OpenAI Vision API
 */
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/...;base64, prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text from an image using Tesseract.js OCR with improved settings
 */
export async function extractTextFromImage(imageFile: File | string): Promise<OCRResult> {
  const worker = await createWorker('eng');
  
  try {
    // Configure OCR for maximum accuracy - include all characters including numbers
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO_OSD, // Auto page segmentation with orientation detection
      // Remove character whitelist to allow all characters including numbers and special chars
      preserve_interword_spaces: '1', // Preserve spaces between words
      tessedit_char_whitelist: '', // Empty whitelist = allow all characters
    });
    
    let ocrResult;
    if (typeof imageFile === 'string') {
      // If it's a URL, fetch the image first
      const response = await fetch(imageFile);
      const blob = await response.blob();
      ocrResult = await worker.recognize(blob);
    } else {
      // If it's a File object
      ocrResult = await worker.recognize(imageFile);
    }
    
    // Get raw text with all details
    const rawText = ocrResult.data.text;
    
    // Also get words with confidence scores to filter low-confidence text
    const words = ocrResult.data.words || [];
    const highConfidenceText = words
      .filter((word: any) => word.confidence > 30) // Filter out very low confidence
      .map((word: any) => word.text)
      .join(' ');
    
    // Use high confidence text if available, otherwise use raw text
    const textToUse = highConfidenceText.trim() || rawText;
    
    // Clean the extracted text but preserve numbers and important characters
    const cleanedText = cleanOCRText(textToUse);
    
    return {
      text: cleanedText,
      confidence: ocrResult.data.confidence,
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Extract data directly using OpenAI Vision API (more accurate than OCR)
 */
export async function extractDataWithOpenAIVision(
  images: File[],
  openAIApiKey: string
): Promise<ParsedCardData> {
  try {
    // If we recently hit quota/rate limit, skip calling Vision and force fallback
    try {
      const cooldownStr = typeof window !== 'undefined' ? window.localStorage.getItem('OPENAI_VISION_COOLDOWN_UNTIL') : null;
      const cooldownUntil = cooldownStr ? parseInt(cooldownStr, 10) : 0;
      if (cooldownUntil && Date.now() < cooldownUntil) {
        const remainingMs = cooldownUntil - Date.now();
        throw new Error(`OPENAI_VISION_COOLDOWN:${remainingMs}`);
      }
    } catch {
      // ignore parsing errors
    }
    // Convert images to base64
    const imagePromises = images.map(img => imageToBase64(img));
    const base64Images = await Promise.all(imagePromises);
    
    // Prepare content array with images
    const content: any[] = [
      {
        type: "text",
        text: `Analyze these business card images and extract ALL visible information accurately.

MOST IMPORTANT FIELDS (extract these first - they are critical):
1. company: The complete company or organization name (read it exactly as written, full name not abbreviated)
2. full_name: The person's complete name (first name, middle name if present, last name - everything visible)
3. phone: All phone numbers visible on the card (extract EXACTLY as written with all formatting: spaces, dashes, parentheses, country codes, extensions)
4. email: The email address (extract exactly as shown, including the full domain)

REQUIRED FIELDS (extract if visible):
- designation: Job title or position (exact title as written)
- website: Website URL (complete URL)
- address: Complete physical address (street number, street name, city, state, zip code, country - everything visible)

ADDITIONAL INFORMATION (extract if present):
- purpose: What is the purpose of this business card? (e.g., "Networking", "Service Provider", "Sales Contact", etc.)
- social_media: Social media handles or links (LinkedIn, Twitter, Facebook, Instagram, etc.)
- services: Services offered or specialties mentioned
- tagline: Any tagline or slogan
- fax: Fax number if present
- mobile: Mobile number if separate from main phone
- other_contact: Other contact methods (WhatsApp, Telegram, etc.)
- Any other relevant information visible on the card

CRITICAL INSTRUCTIONS:
- Read the card carefully line by line
- Extract phone numbers EXACTLY as written - preserve all formatting (spaces, dashes, parentheses, dots)
- Extract email addresses completely - include the full domain
- Extract company name completely - do not abbreviate
- Extract person's name completely - include middle names or initials if present
- Extract addresses completely - include all numbers (street number, zip code, etc.)
- Read numbers character by character - do not miss or misread any digits
- Extract everything visible - nothing should be skipped

Return a JSON object with all extracted fields. If a field is not visible, omit it. Be extremely accurate - extract exactly what you see on the card. Return ONLY valid JSON, no additional text.`
      }
    ];
    
    // Add all images
    for (const base64 of base64Images) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64}`
        }
      });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use vision-capable model
        messages: [
          {
            role: 'system',
            content: 'You are a professional business card data extraction specialist. Your job is to read business card images with 100% accuracy and extract all visible information. Pay special attention to: 1) Company names (extract full name), 2) Person names (extract complete name), 3) Phone numbers (extract exactly with all formatting), 4) Email addresses (extract complete email). Read every character carefully, especially numbers. Extract information exactly as it appears on the card. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0, // Zero temperature for maximum accuracy
        max_tokens: 1500, // Increased significantly to capture all information
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // If rate-limited or insufficient quota, place a temporary cooldown to avoid repeated failing calls
      const status = (response as any).status;
      const errorCode = (errorData?.error?.code || '').toString();
      if (status === 429 || errorCode === 'insufficient_quota') {
        try {
          // 60 minutes cooldown
          const until = Date.now() + 60 * 60 * 1000;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('OPENAI_VISION_COOLDOWN_UNTIL', String(until));
          }
        } catch {
          // ignore storage errors
        }
      }
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const responseData = await response.json();
    const aiResponse = responseData.choices[0].message.content;
    
    // Parse JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse extraction response. Please try again.');
    }
    
    // Build result with all extracted fields - prioritize important fields
    const result: ParsedCardData = {};
    
    // MOST IMPORTANT FIELDS - extract first with validation
    if (extractedData.company && typeof extractedData.company === 'string' && extractedData.company.trim().length > 0) {
      result.company = extractedData.company.trim();
    }
    if (extractedData.full_name && typeof extractedData.full_name === 'string' && extractedData.full_name.trim().length > 0) {
      result.full_name = extractedData.full_name.trim();
    }
    if (extractedData.phone && typeof extractedData.phone === 'string' && extractedData.phone.trim().length > 0) {
      result.phone = extractedData.phone.trim();
    }
    if (extractedData.email && typeof extractedData.email === 'string' && extractedData.email.trim().length > 0) {
      result.email = extractedData.email.trim();
    }
    
    // REQUIRED FIELDS - extract with validation
    if (extractedData.designation && typeof extractedData.designation === 'string' && extractedData.designation.trim().length > 0) {
      result.designation = extractedData.designation.trim();
    }
    if (extractedData.website && typeof extractedData.website === 'string' && extractedData.website.trim().length > 0) {
      result.website = extractedData.website.trim();
    }
    if (extractedData.address && typeof extractedData.address === 'string' && extractedData.address.trim().length > 0) {
      result.address = extractedData.address.trim();
    }
    if (extractedData.purpose && typeof extractedData.purpose === 'string' && extractedData.purpose.trim().length > 0) {
      result.purpose = extractedData.purpose.trim();
    }
    
    // ADDITIONAL FIELDS - capture everything else
    Object.keys(extractedData).forEach(key => {
      const standardFields = ['full_name', 'company', 'designation', 'email', 'phone', 'website', 'address', 'purpose'];
      if (!standardFields.includes(key)) {
        const value = extractedData[key];
        // Accept strings, numbers (convert to string), or arrays (join)
        if (value !== null && value !== undefined) {
          if (typeof value === 'string' && value.trim().length > 0) {
            result[key] = value.trim();
          } else if (typeof value === 'number') {
            result[key] = String(value);
          } else if (Array.isArray(value) && value.length > 0) {
            result[key] = value.map(v => String(v)).join(', ');
          }
        }
      }
    });
    
    // Log extracted data for debugging
    console.log('Extracted data:', result);
    
    return result;
  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    throw error;
  }
}

/**
 * Extract text from multiple images and merge the results
 */
export async function extractTextFromImages(images: (File | string)[]): Promise<OCRResult> {
  const results = await Promise.all(
    images.map(img => extractTextFromImage(img))
  );
  
  // Merge all text results and clean
  const mergedText = results.map(r => r.text).join('\n\n');
  const cleanedText = cleanOCRText(mergedText);
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  
  return {
    text: cleanedText,
    confidence: avgConfidence,
  };
}

