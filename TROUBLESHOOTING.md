# Troubleshooting Guide

## "Failed to save business card" Error

If you're getting this error, check the following:

### 1. Check Browser Console

Open your browser's developer console (F12) and look for error messages. The error will tell you exactly what's wrong.

### 2. Verify Firebase Configuration

Make sure all Firebase environment variables are set in your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Check:**
- All variables start with `VITE_`
- No typos in variable names
- Values are copied correctly (no extra spaces)
- Restart your dev server after adding/changing `.env` variables

### 3. Check Firestore Security Rules

The most common issue is Firestore security rules blocking writes.

**Go to Firebase Console → Firestore Database → Rules**

For development, use these rules:

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

**Important:** Click "Publish" after updating rules!

### 4. Verify Firestore is Enabled

1. Go to Firebase Console
2. Click on "Firestore Database" in the left menu
3. Make sure it says "Cloud Firestore" (not "Realtime Database")
4. If you see "Create database", click it and enable Firestore

### 5. Check Network Connection

- Make sure you have internet connection
- Check if Firebase is accessible (try opening Firebase Console in browser)
- Some corporate networks block Firebase - try a different network

### 6. Check Required Fields

Make sure you're filling in:
- **Full Name** (required)
- **Front Image** (required - must be uploaded successfully)

### 7. Check Browser Console for Specific Errors

Common error messages and solutions:

#### "Permission denied"
- **Solution:** Update Firestore security rules (see #3 above)

#### "Network error" or "Failed to fetch"
- **Solution:** Check internet connection and Firebase configuration

#### "Firebase: Error (auth/configuration-not-found)"
- **Solution:** Check your `.env` file has all Firebase variables

#### "Quota exceeded"
- **Solution:** Check your Firebase plan limits

#### "Missing or insufficient permissions"
- **Solution:** Update Firestore security rules to allow writes

### 8. Test Firebase Connection

Open browser console and run:

```javascript
// Check if Firebase is initialized
console.log(window.firebase || 'Firebase not found');

// Check Firestore
import { db } from './src/integrations/firebase/client';
console.log('Firestore DB:', db);
```

### 9. Restart Development Server

After changing `.env` file or Firebase configuration:
1. Stop the dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### 10. Verify Collection Name

The app uses collection name: `business_cards`

Make sure:
- No typos in the collection name
- Collection is created (or will be auto-created on first save)

## Still Having Issues?

1. **Check browser console** - The actual error message will be there
2. **Check Firebase Console** - See if any errors appear in Firebase logs
3. **Verify all environment variables** are set correctly
4. **Test with a simple document** - Try creating a document manually in Firebase Console

## Quick Debug Checklist

- [ ] All Firebase env variables in `.env` file
- [ ] Dev server restarted after `.env` changes
- [ ] Firestore security rules allow writes
- [ ] Firestore is enabled in Firebase Console
- [ ] Internet connection is working
- [ ] Browser console shows specific error message
- [ ] Full name and front image are provided

