# Google M - AI-Powered Productivity Suite

## Project Overview

Google M is an AI-powered suite of tools built with Google Gemini AI, featuring business card scanning, document analysis, text processing, flash cards, and more. This comprehensive productivity platform combines the power of Google's AI with modern web technologies to transform your workflow.

## ✨ Features

### Core Features (9 AI-Powered Tools)

1. **Card Scanner** - Scan and extract information from business cards using AI-powered OCR
   - Drag & drop image support
   - Camera capture
   - Automatic data extraction
   - Form auto-fill

2. **AI Chat Assistant** - Chat with Google M for instant answers and assistance
   - Conversational AI
   - Context-aware responses
   - Multi-turn conversations

3. **Document Analyzer** - Analyze documents with Gemini Vision API
   - Extract key information
   - Summarize content
   - Get AI-powered insights

4. **Image to Text** - Extract text from images using advanced OCR technology
   - Tesseract.js integration
   - Multi-language support
   - High accuracy extraction

5. **Text Summarizer** - Summarize long texts instantly
   - Concise summaries
   - Key points extraction
   - AI-powered analysis

6. **Code Generator** - Generate code from natural language descriptions
   - Multiple language support (JavaScript, Python, TypeScript, etc.)
   - Best practices included
   - Clean, well-structured code

7. **Quick Actions** - Improve, expand, or rewrite text instantly
   - Text enhancement
   - Content expansion
   - Writing transformation

8. **Translator** - Translate text between 11 languages
   - Accurate translations
   - Context-aware
   - Multiple language pairs

9. **Flash Cards** - Create colorful flash cards from any topic or text
   - AI-generated questions and answers
   - Beautiful colored cards (8 gradient colors)
   - 3D flip animation
   - Study tools (shuffle, navigate, progress tracking)

## 🛠️ Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI framework
- **shadcn-ui** - Modern component library
- **Tailwind CSS** - Utility-first styling
- **Tesseract.js** - OCR for text extraction
- **Firebase** - Database (Firestore) for data storage
- **Cloudinary** - Image storage and CDN
- **Google Gemini AI** - AI-powered features
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for database)
- Cloudinary account (for image storage)
- Google Gemini API key

### Installation

```sh
# Step 1: Clone the repository
git clone https://github.com/Mustafa-Mohd/build-GoogleM.git

# Step 2: Navigate to the project directory
cd biz-card-glow-main

# Step 3: Install dependencies
npm install

# Step 4: Create .env file (see Environment Variables below)

# Step 5: Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔐 Environment Variables

Create a `.env` file in the root directory with:

```env
# Cloudinary (Required for image storage)
# No API key needed! Just Cloud Name and Upload Preset
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
- **Cloudinary**: 
  - Sign up at [Cloudinary](https://cloudinary.com)
  - Get your **Cloud Name** from dashboard
  - Create an **Upload Preset** in Settings → Upload (set to Unsigned)
  - **No API key needed** for client-side uploads
- **Firebase**: 
  - Sign up at [Firebase Console](https://console.firebase.google.com)
  - Create a new project
  - Enable Firestore Database
  - Get configuration from Project Settings → Your apps → Web app
  - **Note**: Firebase Storage is NOT needed (we use Cloudinary)

## 📋 Features in Detail

### Card Scanner
- **Drag & Drop**: Simply drag images onto the upload area
- **Camera Capture**: Use your device camera to capture cards
- **AI-Powered OCR**: Automatic text extraction with Tesseract.js
- **Smart Parsing**: Automatically identifies name, company, email, phone, etc.
- **Data Confirmation**: Review and edit extracted data before saving
- **Cloud Storage**: Images stored securely in Cloudinary

### Flash Cards
- **Two Input Modes**:
  - **Topic Mode**: Enter a topic (e.g., "JavaScript Basics") and AI generates cards
  - **Text Mode**: Paste information and AI extracts key concepts
- **Colorful Cards**: 8 beautiful gradient colors for visual appeal
- **3D Flip Animation**: Smooth card flipping experience
- **Study Tools**: 
  - Navigate between cards
  - Shuffle for random order
  - Progress tracking
  - Card counter

### AI Chat Assistant
- Conversational interface
- Maintains conversation context
- Powered by Google Gemini AI
- Real-time responses

### Document Analyzer
- Upload images or text files
- AI-powered analysis
- Key information extraction
- Structured insights

## 🗄️ Database & Storage

### Firebase Firestore
- **Database**: Firestore for storing business cards and user data
- **Real-time**: Automatic data synchronization
- **Security**: Configurable security rules
- **Scalable**: Handles growth automatically

### Cloudinary
- **Image Storage**: All images stored in Cloudinary
- **CDN**: Fast global delivery
- **Optimization**: Automatic image optimization
- **Free Tier**: Generous free plan available

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive**: Works on all devices (mobile, tablet, desktop)
- **Dark Mode**: Full dark mode support
- **Animations**: Smooth transitions and hover effects
- **Drag & Drop**: Intuitive file uploads
- **Navigation**: Easy-to-use sidebar and navbar
- **Accessibility**: Built with accessibility in mind

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn-ui components
│   ├── Navbar.tsx    # Top navigation bar
│   ├── SidebarLayout.tsx  # Sidebar navigation
│   └── ...
├── pages/            # Page components
│   ├── Home.tsx      # Landing page
│   ├── CardScanner.tsx
│   ├── AIChat.tsx
│   ├── FlashCards.tsx
│   └── ...
├── lib/              # Core logic
│   ├── gemini.ts     # Gemini AI integration
│   ├── ocr.ts        # OCR processing
│   └── ...
├── hooks/            # Custom React hooks
├── integrations/     # Firebase client setup
│   └── firebase/     # Firebase configuration
└── types/            # TypeScript type definitions
```

## 🏗️ Building for Production

```sh
npm run build
```

The production build will be in the `dist` directory.

## 🚀 Deployment

### Firebase Hosting (Recommended)

```sh
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build and deploy
npm run deploy
```

Your app will be live at:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

See `QUICK_DEPLOY.md` for detailed deployment instructions.

### Other Platforms

You can also deploy to:
- **Vercel** - Recommended for React apps
- **Netlify** - Easy deployment with Git integration
- **Cloudflare Pages** - Fast global CDN
- **Google Cloud Run** - Containerized deployment
- Any static hosting service

## 📚 Documentation

- `FIREBASE_SETUP.md` - Firebase setup guide
- `CLOUDINARY_SETUP.md` - Cloudinary configuration
- `QUICK_DEPLOY.md` - Deployment instructions
- `TROUBLESHOOTING.md` - Common issues and solutions
- `API_KEY_SECURITY.md` - API key security best practices

## 🔒 Security Notes

- **Never commit** `.env` file to Git
- **Rotate API keys** if they're exposed
- **Use environment variables** for all sensitive data
- **Set up Firestore security rules** for production
- See `API_KEY_SECURITY.md` for more details

## 🎯 Key Highlights

- ✅ **9 AI-Powered Features** - Comprehensive productivity suite
- ✅ **Firebase Integration** - Scalable database solution
- ✅ **Cloudinary Storage** - Fast, reliable image hosting
- ✅ **Drag & Drop** - Modern file upload experience
- ✅ **Responsive Design** - Works on all devices
- ✅ **Dark Mode** - Full theme support
- ✅ **Modern UI** - Beautiful, intuitive interface
- ✅ **TypeScript** - Type-safe codebase
- ✅ **Production Ready** - Ready to deploy

## 📝 Recent Updates

- ✨ Added Flash Cards feature with AI generation
- ✨ Added drag & drop support for card scanner
- ✨ Migrated from Supabase to Firebase
- ✨ Enhanced UI with better spacing and responsiveness
- ✨ Fixed text cropping issues
- ✨ Updated navigation (Home, Dashboard, Profile)
- ✨ Improved error handling and user feedback

## 🤝 Contributing

This project is built for Google events and showcases Google Gemini AI capabilities.

## 📄 License

This project is built for Google events and showcases Google M capabilities.

## 🆘 Support

For issues or questions:
- Check `TROUBLESHOOTING.md` for common solutions
- Review `FIREBASE_SETUP.md` for database setup
- See `CLOUDINARY_SETUP.md` for storage configuration
- Open an issue in the repository

---

**Built with ❤️ using Google Gemini AI**
