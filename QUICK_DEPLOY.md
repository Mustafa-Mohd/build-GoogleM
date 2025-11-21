# Quick Deployment Guide - Firebase Hosting

## Step-by-Step Instructions

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate with Google.

### Step 3: Initialize Firebase Hosting

```bash
firebase init hosting
```

**Answer the prompts:**
1. **Select Firebase project**: Choose your existing Firebase project (the one you created earlier)
2. **What do you want to use as your public directory?**: Type `dist` and press Enter
3. **Configure as a single-page app?**: Type `y` (yes) and press Enter
4. **Set up automatic builds and deploys with GitHub?**: Type `n` (no) for now
5. **File dist/index.html already exists. Overwrite?**: Type `n` (no)

### Step 4: Update .firebaserc

Open `.firebaserc` and replace `your-project-id` with your actual Firebase project ID.

You can find your project ID in:
- Firebase Console → Project Settings → General tab
- Or in your Firebase config

### Step 5: Build Your Project

```bash
npm run build
```

This creates the `dist` folder with your production build.

### Step 6: Deploy!

```bash
firebase deploy --only hosting
```

Or use the npm script:
```bash
npm run deploy
```

### Step 7: Access Your App

After deployment, you'll see URLs like:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

## Environment Variables for Production

Since Firebase Hosting is static, you need to handle environment variables differently:

### Option 1: Build-time Variables (Recommended)

1. Create a `.env.production` file:
```env
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

2. Build with production mode:
```bash
npm run build
```

Vite will automatically use `.env.production` when building.

### Option 2: Use Firebase Functions (Advanced)

For more security, you can use Firebase Functions to serve environment variables.

## Troubleshooting

### "Firebase CLI not found"
- Make sure you installed it globally: `npm install -g firebase-tools`
- Or use: `npx firebase-tools` instead

### "Project not found"
- Check your `.firebaserc` file has the correct project ID
- Make sure you're logged in: `firebase login`

### "Build failed"
- Make sure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run lint`

### "Environment variables not working"
- Make sure you're using `VITE_` prefix
- Rebuild after changing `.env.production`
- Check browser console for errors

## Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify your domain
4. Update DNS records as instructed

## Continuous Deployment (Optional)

Set up GitHub Actions for automatic deployment:

1. Create `.github/workflows/deploy.yml`
2. Add Firebase token as GitHub secret
3. Push to GitHub → Auto-deploy!

## Quick Commands Reference

```bash
# Login
firebase login

# Initialize (first time only)
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting

# Deploy everything (hosting + functions)
firebase deploy

# View deployment history
firebase hosting:channel:list

# Rollback (if needed)
firebase hosting:rollback
```

## Next Steps After Deployment

1. ✅ Test your live app
2. ✅ Check all features work
3. ✅ Test on mobile devices
4. ✅ Set up custom domain (optional)
5. ✅ Enable analytics (optional)
6. ✅ Set up monitoring (optional)

Your app is now live on Google Cloud! 🚀

