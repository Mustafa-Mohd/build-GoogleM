export interface ParsedCardData {
  full_name?: string;
  company?: string;
  designation?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  purpose?: string; // Purpose of the business card
  [key: string]: string | undefined; // Allow dynamic fields
}

/**
 * Extract email addresses from text
 */
function extractEmail(text: string): string | undefined {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  return matches?.[0];
}

/**
 * Extract phone numbers from text
 */
function extractPhone(text: string): string | undefined {
  // Match various phone formats: +1-234-567-8900, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex);
  if (matches && matches.length > 0) {
    // Return the first match, cleaned up
    return matches[0].trim();
  }
  return undefined;
}

/**
 * Extract website URLs from text
 */
function extractWebsite(text: string): string | undefined {
  // Match URLs with or without protocol
  const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  const matches = text.match(urlRegex);
  if (matches && matches.length > 0) {
    // Filter out email addresses and return first valid URL
    const url = matches.find(m => !m.includes('@') && (m.includes('http') || m.includes('www')));
    if (url) {
      return url.startsWith('http') ? url : `https://${url}`;
    }
  }
  return undefined;
}

/**
 * Extract name from text (usually appears at the beginning or in a prominent position)
 */
function extractName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for lines that might be names (2-4 words, capitalized, not emails/phones/URLs)
  for (const line of lines.slice(0, 5)) {
    // Skip if it looks like an email, phone, or URL
    if (line.includes('@') || /^\d/.test(line) || line.includes('http') || line.includes('www')) {
      continue;
    }
    
    // Check if it looks like a name (2-4 words, mostly capitalized)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));
      if (capitalizedWords.length >= 2) {
        return line;
      }
    }
  }
  
  return undefined;
}

/**
 * Extract company name from text
 */
function extractCompany(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for company indicators
  const companyKeywords = ['Inc', 'LLC', 'Ltd', 'Corp', 'Corporation', 'Company', 'Co', 'Group', 'Industries'];
  
  for (const line of lines) {
    // Skip if it looks like an email, phone, or URL
    if (line.includes('@') || /^\d/.test(line) || line.includes('http') || line.includes('www')) {
      continue;
    }
    
    // Check if line contains company keywords
    if (companyKeywords.some(keyword => line.includes(keyword))) {
      return line;
    }
    
    // Check if it's a capitalized line that might be a company (3+ words)
    const words = line.split(/\s+/);
    if (words.length >= 3) {
      const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));
      if (capitalizedWords.length >= 2) {
        return line;
      }
    }
  }
  
  return undefined;
}

/**
 * Extract designation/title from text
 */
function extractDesignation(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Common job titles
  const titleKeywords = [
    'CEO', 'CTO', 'CFO', 'COO', 'President', 'Director', 'Manager', 'Lead', 'Senior', 'Junior',
    'Engineer', 'Developer', 'Designer', 'Analyst', 'Consultant', 'Specialist', 'Executive',
    'Vice President', 'VP', 'Head of', 'Chief'
  ];
  
  for (const line of lines) {
    // Skip if it looks like an email, phone, or URL
    if (line.includes('@') || /^\d/.test(line) || line.includes('http') || line.includes('www')) {
      continue;
    }
    
    // Check if line contains title keywords
    if (titleKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))) {
      return line;
    }
  }
  
  return undefined;
}

/**
 * Extract address from text
 */
function extractAddress(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for lines that might be addresses (contain numbers and street-like words)
  const streetKeywords = ['Street', 'St', 'Avenue', 'Ave', 'Road', 'Rd', 'Drive', 'Dr', 'Lane', 'Ln', 'Boulevard', 'Blvd'];
  
  for (const line of lines) {
    // Skip if it looks like an email, phone, or URL
    if (line.includes('@') || line.includes('http') || line.includes('www')) {
      continue;
    }
    
    // Check if line contains numbers and street keywords
    if (/\d/.test(line) && streetKeywords.some(keyword => line.includes(keyword))) {
      // Try to get the next line as well (city, state, zip)
      const lineIndex = lines.indexOf(line);
      if (lineIndex < lines.length - 1) {
        const nextLine = lines[lineIndex + 1];
        if (!nextLine.includes('@') && !nextLine.includes('http')) {
          return `${line}, ${nextLine}`;
        }
      }
      return line;
    }
    
    // Check for postal code patterns (US: 12345 or 12345-6789, International: various)
    if (/\d{5}(-\d{4})?/.test(line) || /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/.test(line)) {
      // Get previous line as well
      const lineIndex = lines.indexOf(line);
      if (lineIndex > 0) {
        const prevLine = lines[lineIndex - 1];
        if (!prevLine.includes('@') && !prevLine.includes('http') && !/^\d/.test(prevLine)) {
          return `${prevLine}, ${line}`;
        }
      }
      return line;
    }
  }
  
  return undefined;
}

/**
 * Parse OCR text to extract structured business card data using regex patterns
 */
export function parseCardDataFromText(ocrText: string): ParsedCardData {
  const data: ParsedCardData = {};
  
  // Extract each field
  const email = extractEmail(ocrText);
  if (email) data.email = email;
  
  const phone = extractPhone(ocrText);
  if (phone) data.phone = phone;
  
  const website = extractWebsite(ocrText);
  if (website) data.website = website;
  
  const name = extractName(ocrText);
  if (name) data.full_name = name;
  
  const company = extractCompany(ocrText);
  if (company) data.company = company;
  
  const designation = extractDesignation(ocrText);
  if (designation) data.designation = designation;
  
  const address = extractAddress(ocrText);
  if (address) data.address = address;
  
  return data;
}

/**
 * Clean and enhance OCR text using OpenAI API for better accuracy
 */
export async function cleanOCRTextWithAI(
  ocrText: string,
  openAIApiKey: string
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at cleaning and correcting OCR text from business cards. Remove random characters, fix common OCR errors, and return clean readable text.'
          },
          {
            role: 'user',
            content: `Clean and correct this OCR text from a business card. Remove random symbols, fix character recognition errors, and return only the clean readable text:\n\n${ocrText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return ocrText; // Return original if cleaning fails
    }
    
    const result = await response.json();
    return result.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error cleaning OCR text with AI:', error);
    return ocrText; // Return original if cleaning fails
  }
}

/**
 * Enhance parsed data using OpenAI API (optional)
 */
export async function enhanceParsedDataWithAI(
  ocrText: string,
  parsedData: ParsedCardData,
  openAIApiKey?: string
): Promise<ParsedCardData> {
  if (!openAIApiKey) {
    return parsedData;
  }
  
  try {
    // First clean the OCR text
    const cleanedText = await cleanOCRTextWithAI(ocrText, openAIApiKey);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional business card data extraction specialist. Your priority is to extract these CRITICAL fields accurately: 1) Company name (full name), 2) Person name (complete name), 3) Phone number (exactly as written with formatting), 4) Email address (complete email). Then extract all other visible information. Read every character carefully, especially numbers. Extract information exactly as it appears. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: `Analyze this OCR text from a business card and extract ALL visible information accurately.

MOST IMPORTANT FIELDS (extract these first - they are critical):
1. company: The complete company or organization name (read it exactly as written, full name not abbreviated)
2. full_name: The person's complete name (first name, middle name if present, last name - everything visible)
3. phone: All phone numbers visible (extract EXACTLY as written with all formatting: spaces, dashes, parentheses, country codes, extensions)
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
- Any other relevant information visible

CRITICAL INSTRUCTIONS:
- Read the text carefully line by line
- Extract phone numbers EXACTLY as written - preserve all formatting (spaces, dashes, parentheses, dots)
- Extract email addresses completely - include the full domain
- Extract company name completely - do not abbreviate
- Extract person's name completely - include middle names or initials if present
- Extract addresses completely - include all numbers (street number, zip code, etc.)
- Read numbers character by character - do not miss or misread any digits
- Extract everything visible - nothing should be skipped

Cleaned OCR Text:\n${cleanedText}\n\nPreviously parsed data (for reference):\n${JSON.stringify(parsedData, null, 2)}

Return a JSON object with all extracted fields. If a field is not visible, omit it. Be extremely accurate - extract exactly what you see. Return ONLY valid JSON, no additional text.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0, // Zero temperature for maximum accuracy
        max_tokens: 1000, // Increased for comprehensive extraction
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      return parsedData;
    }
    
    const result = await response.json();
    const aiData = JSON.parse(result.choices[0].message.content);
    
    // Merge AI-enhanced data with regex-parsed data (AI takes precedence)
    // Only include non-empty values
    const cleanedAIData: ParsedCardData = {};
    Object.entries(aiData).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim().length > 0) {
        cleanedAIData[key as keyof ParsedCardData] = value.trim();
      }
    });
    
    return {
      ...parsedData,
      ...cleanedAIData,
    };
  } catch (error) {
    console.error('Error enhancing data with AI:', error);
    return parsedData;
  }
}

