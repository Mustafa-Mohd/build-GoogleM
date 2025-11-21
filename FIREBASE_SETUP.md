# Firebase Setup Guide

This project has been migrated from Supabase to Firebase. Follow these steps to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) - **This is the correct place!**
   - ✅ Use Firebase Console (console.firebase.google.com)
   - ❌ You do NOT need Google Cloud Console
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name
   - Enable/disable Google Analytics (optional)
   - Create the project

## 2. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
4. Select a location for your database
5. Click "Enable"

## 3. Set Up Firestore Security Rules

For development, you can use these rules (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /business_cards/{document=**} {
      allow read, write: if true; // Allow all for development
    }
  }
}
```

**Important**: For production, implement proper authentication and security rules!

## 4. Get Firebase Configuration

**Note**: This project uses **Cloudinary** for image storage, not Firebase Storage. You don't need to enable Firebase Storage, which helps you avoid upgrade requirements.

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app (give it a nickname)
5. Copy the Firebase configuration object

## 5. Add Environment Variables

Create a `.env` file in the root directory with your Firebase config:

```env
# Firebase Configuration (Firestore database only)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary (Required for image storage)
# Note: No API key needed! Just Cloud Name and Upload Preset
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Note**: `VITE_FIREBASE_STORAGE_BUCKET` is not needed since we use Cloudinary for storage.

## 6. Create Firestore Collection

**Note**: The app will automatically create the `business_cards` collection when you add your first card. You don't need to create it manually!

However, if you want to create it manually in Firebase Console, here's what you need to know:

### Understanding Firestore Structure

- **Collection ID**: The name of the collection (like a folder name)
  - For this app, use: `business_cards`
  
- **Document ID**: The unique identifier for each document (like a file name)
  - You can leave this empty or use "auto-id" - Firestore will generate it automatically
  - Or you can skip creating a document entirely since the app will create documents automatically

### Manual Creation (Optional)

If you want to create it manually:
1. Go to Firebase Console → Firestore Database
2. Click "Start collection" or "Add collection"
3. **Collection ID**: Enter `business_cards`
4. Click "Next"
5. **Document ID**: You can either:
   - Click "Auto-ID" (recommended) - Firestore generates a random ID
   - Or enter a custom ID (not necessary)
6. Add a test field (optional) or just click "Save" to create an empty collection
7. The app will add real documents when you upload cards

### Automatic Creation (Recommended)

The app will automatically create the `business_cards` collection when you add your first card. The collection structure is:

- `full_name` (string, required)
- `company` (string, optional)
- `designation` (string, optional)
- `email` (string, optional)
- `phone` (string, optional)
- `website` (string, optional)
- `address` (string, optional)
- `notes` (string, optional)
- `front_image_url` (string, required)
- `back_image_url` (string, optional)
- `created_at` (timestamp, auto-generated)
- `updated_at` (timestamp, auto-generated)

## 7. Test the Setup

1. Start the development server: `npm run dev`
2. Navigate to the upload page
3. Upload a business card
4. Check Firebase Console to verify the data was saved

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly
- Restart the development server after adding environment variables

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Make sure Storage rules allow read/write

### Images not uploading
- Check Cloudinary is configured in `.env` file
- Verify `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` are set
- Check browser console for specific error messages
- Make sure your Cloudinary upload preset allows unsigned uploads

## Migration Notes

- The app now uses **Firestore** instead of Supabase PostgreSQL
- **Cloudinary** is used for image storage (Firebase Storage is not needed)
- All Supabase-specific code has been replaced with Firebase equivalents
- The data structure remains the same, so existing data can be migrated if needed

## Why Cloudinary Instead of Firebase Storage?

- **No upgrade required**: Firebase Storage free tier has limits that may require upgrades
- **Better image optimization**: Cloudinary provides automatic image optimization, transformations, and CDN
- **More storage options**: Cloudinary offers generous free tier for image hosting
- **Simpler setup**: No need to configure Firebase Storage security rules

