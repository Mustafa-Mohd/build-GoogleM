# Cloudinary Setup Guide

This app uses Cloudinary for image storage. **No API key is required** - just your Cloud Name and an Upload Preset.

## Step 1: Sign Up for Cloudinary

1. Go to [Cloudinary](https://cloudinary.com)
2. Click "Sign Up" (free account is sufficient)
3. Complete the registration

## Step 2: Get Your Cloud Name

1. After signing up, you'll be taken to your dashboard
2. Your **Cloud Name** is displayed at the top of the dashboard
3. Copy this value - you'll need it for `VITE_CLOUDINARY_CLOUD_NAME`

## Step 3: Create an Upload Preset

1. In Cloudinary dashboard, go to **Settings** (gear icon)
2. Click on **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: Give it a name (e.g., "business-cards")
   - **Signing mode**: Select **Unsigned** (this allows client-side uploads without API key)
   - **Folder** (optional): Set a folder like "business-cards" to organize uploads
   - **Allowed formats**: You can restrict to images only
6. Click **Save**

## Step 4: Add to .env File

Add these two variables to your `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
```

**Example:**
```env
VITE_CLOUDINARY_CLOUD_NAME=demo
VITE_CLOUDINARY_UPLOAD_PRESET=business-cards
```

## Why No API Key?

The app uses **unsigned uploads** with an Upload Preset. This is the recommended approach for client-side uploads because:
- ✅ **More secure**: Your API secret never leaves your server
- ✅ **Simpler setup**: No need to manage API keys in frontend code
- ✅ **Free tier friendly**: Works perfectly with Cloudinary's free plan

## Troubleshooting

### "Upload failed" error
- Verify your Cloud Name is correct
- Make sure your Upload Preset is set to **Unsigned**
- Check that the Upload Preset name matches exactly (case-sensitive)

### "Invalid upload preset" error
- Double-check the preset name spelling
- Ensure the preset is set to **Unsigned** mode
- Make sure the preset is saved and active

### Images not appearing
- Check browser console for specific error messages
- Verify the upload was successful in Cloudinary dashboard → Media Library
- Check that your Upload Preset allows the image format you're uploading

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 monthly transformations

This is usually more than enough for development and small projects!



