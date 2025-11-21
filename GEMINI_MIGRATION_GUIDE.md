# Google Gemini Migration Guide

This guide outlines all changes needed to rebrand the business card scanner for Google/Gemini events.

## 🔄 Critical Changes Required

### 1. **API Migration: OpenAI → Google Gemini**

#### Files to Modify:
- `src/lib/ocr.ts` - Replace `extractDataWithOpenAIVision()` function
- `src/lib/dataParser.ts` - Replace `cleanOCRTextWithAI()` and `enhanceParsedDataWithAI()` functions
- `src/pages/Upload.tsx` - Update API key references

#### Gemini API Implementation:
```typescript
// Replace OpenAI Vision API calls with Gemini API
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
        ]
      }]
    })
  }
);
```

#### Environment Variables:
- ❌ Remove: `VITE_OPENAI_API_KEY`
- ✅ Add: `VITE_GEMINI_API_KEY`

### 2. **Color Scheme Update**

#### Google Brand Colors (HSL):
- **Google Blue**: `217 89% 61%` (#4285F4)
- **Google Red**: `4 90% 58%` (#EA4335)
- **Google Yellow**: `45 100% 51%` (#FBBC05)
- **Google Green**: `134 61% 41%` (#34A853)

#### Update `src/index.css`:
```css
--primary: 217 89% 61%;        /* Google Blue */
--accent: 4 90% 58%;           /* Google Red */
--gradient-ai: linear-gradient(135deg, 
  hsl(217 89% 61%) 0%,        /* Blue */
  hsl(4 90% 58%) 25%,         /* Red */
  hsl(45 100% 51%) 50%,       /* Yellow */
  hsl(134 61% 41%) 100%       /* Green */
);
```

### 3. **Branding Updates**

#### Text Replacements:
| Old Text | New Text |
|----------|----------|
| "AI-Powered Card Scanner" | "Gemini-Powered Card Scanner" |
| "Powered by AI" | "Powered by Google Gemini" |
| "OpenAI" | "Google Gemini" |
| "CardVault" | "GeminiCard" or "Gemini Scanner" |
| "Analyzing with AI..." | "Analyzing with Gemini..." |

#### Files to Update:
- `src/pages/Upload.tsx` - All UI text
- `src/pages/Dashboard.tsx` - Page titles
- `src/components/Navbar.tsx` - App name
- `index.html` - Meta tags and title
- `README.md` - Documentation

### 4. **Project Metadata**

#### `index.html`:
```html
<title>Gemini Card Scanner - Powered by Google Gemini</title>
<meta name="description" content="AI-powered business card scanner using Google Gemini" />
```

#### `package.json`:
```json
{
  "name": "gemini-card-scanner",
  "description": "Business card scanner powered by Google Gemini AI"
}
```

### 5. **Visual Branding**

#### Add Google/Gemini Elements:
- Update favicon to Google/Gemini logo
- Add "Powered by Google Gemini" badge in footer
- Update app icon/logo in Navbar
- Consider adding Google logo in hero section

### 6. **Documentation Updates**

#### `README.md` Changes:
- Update project description
- Replace OpenAI setup with Gemini API setup
- Update environment variables section
- Add Google Gemini API key instructions
- Update technology stack mentions

## 📋 Implementation Checklist

- [ ] Install Google Gemini SDK (if using SDK) or implement REST API calls
- [ ] Replace all OpenAI API calls with Gemini API
- [ ] Update environment variables
- [ ] Change color scheme to Google brand colors
- [ ] Update all text references from OpenAI to Gemini
- [ ] Update project name and branding
- [ ] Update `index.html` metadata
- [ ] Update `package.json` name/description
- [ ] Update `README.md` documentation
- [ ] Add Google/Gemini logos and favicon
- [ ] Test Gemini API integration
- [ ] Update error messages and user-facing text
- [ ] Update Supabase edge functions (if using)

## 🔑 Gemini API Setup

1. Get API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Update API calls to use Gemini endpoint

## 🎨 Google Brand Guidelines

- Use official Google colors
- Maintain Google's design principles (clean, simple, accessible)
- Follow Google's logo usage guidelines
- Ensure proper attribution to Google/Gemini

## 🚀 Quick Start After Migration

1. Update environment variables
2. Run `npm install` (if adding new dependencies)
3. Test Gemini API integration
4. Verify all UI text is updated
5. Check color scheme matches Google branding
6. Deploy and test

