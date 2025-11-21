# Google M - AI-Powered Business Card Scanner

## Project Overview

Google M is an AI-powered suite of tools built with Google Gemini, featuring business card scanning, document analysis, text processing, and more.

## Features

### Core Features
- **Card Scanner** - Scan and extract information from business cards using AI
- **AI Chat Assistant** - Chat with Google M
- **Document Analyzer** - Analyze documents with AI-powered insights
- **Image to Text** - Extract text from images using OCR
- **Text Summarizer** - Summarize long texts with AI
- **Code Generator** - Generate code from natural language descriptions
- **Quick Actions** - Improve, expand, or rewrite text
- **Translator** - Translate text between multiple languages

## Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **Tesseract.js** - OCR for text extraction
- **Firebase** - Database (Firestore) & Storage
- **Cloudinary** - Image Storage
- **Google M** - AI-powered features

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd biz-card-glow-main

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Environment Variables

Create a `.env` file in the root directory with:

```env
# Cloudinary (Required for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Google Gemini (Required for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase (Required - only Firestore database, storage uses Cloudinary)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Getting API Keys

- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Cloudinary**: Sign up at [Cloudinary](https://cloudinary.com) - **Required** for image storage. You need:
  - **Cloud Name** (found in dashboard)
  - **Upload Preset** (create an unsigned upload preset in Settings → Upload)
  - **No API key needed** for client-side uploads
- **Firebase**: Sign up at [Firebase Console](https://console.firebase.google.com) and create a new project (only Firestore database needed, Storage is not required)
  - ✅ Use **Firebase Console** (console.firebase.google.com) - this is the correct place
  - ❌ You do NOT need Google Cloud Console

## OCR & AI Features

### Automatic OCR Processing
- **Tesseract.js** extracts text from business card images
- Text is automatically parsed using regex patterns to identify:
  - Name
  - Company
  - Designation
  - Email
  - Phone
  - Website
  - Address

### AI Enhancement
- Google M enhances extracted data for better accuracy
- Provides intelligent text processing and analysis
- Supports multiple languages and formats

### User Experience
- Real-time OCR processing with progress indicators
- Confirmation dialog to review extracted data before saving
- Form auto-fill with extracted information
- Editable fields before final submission

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Core logic (OCR, data parsing)
├── hooks/         # Custom React hooks
├── integrations/  # Firebase client setup
└── types/         # TypeScript type definitions
```

## Building for Production

```sh
npm run build
```

The production build will be in the `dist` directory.

## Deployment

You can deploy this project to:
- **Vercel** - Recommended for React apps
- **Netlify** - Easy deployment with Git integration
- **Cloudflare Pages** - Fast global CDN
- Any static hosting service

## License

This project is built for Google events and showcases Google M capabilities.

## Support

For issues or questions, please open an issue in the repository.
