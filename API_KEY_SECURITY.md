# API Key Security Guide

## ⚠️ Your API Key Was Leaked

If you see the error: **"Your API key was reported as leaked. Please use another API key."**

This means your API key was exposed publicly (likely in code that was committed to GitHub or shared publicly).

## Immediate Steps

### 1. Create a New API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click on your current API key (or create a new one)
3. **Delete the old/leaked key** (click the trash icon)
4. Click **"Create API Key"** to generate a new one
5. Copy the new API key

### 2. Update Your .env File

Replace the old key in your `.env` file:

```env
VITE_GEMINI_API_KEY=your_new_api_key_here
```

### 3. Restart Your Dev Server

1. Stop the server (Ctrl+C)
2. Start it again: `npm run dev`
3. Clear browser cache or do a hard refresh (Ctrl+Shift+R)

## How to Prevent This in the Future

### ✅ DO:
- ✅ Keep API keys in `.env` file (which is in `.gitignore`)
- ✅ Use `.env.example` file with placeholder values
- ✅ Never commit `.env` to Git
- ✅ Use environment variables in production
- ✅ Rotate keys regularly

### ❌ DON'T:
- ❌ Commit `.env` file to Git
- ❌ Share API keys in screenshots or messages
- ❌ Hardcode API keys in source code
- ❌ Push code with API keys to public repositories
- ❌ Share API keys in documentation or README files

## Check if Your .env is in .gitignore

Make sure your `.gitignore` file includes:

```
.env
.env.local
.env.*.local
```

## If You Already Committed the Key

1. **Delete the key** from Google AI Studio immediately
2. **Create a new key**
3. **Remove the key from Git history** (if it was committed):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
   Or use a tool like [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

## Production Best Practices

- Use environment variables provided by your hosting platform
- Never expose API keys in client-side code if possible
- Use server-side API routes for sensitive operations
- Monitor API usage for unusual activity
- Set up API key restrictions in Google Cloud Console

## Quota Exceeded (429 Error)

If you see **"Resource has been exhausted"**:

1. **Check your quota** in [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Wait** - quotas reset daily/monthly depending on your plan
3. **Upgrade** your plan if needed
4. **Check for abuse** - if your key was leaked, someone might be using it

## Need Help?

- [Google AI Studio](https://makersuite.google.com/app/apikey) - Manage API keys
- [Google Cloud Console](https://console.cloud.google.com) - Monitor usage and set restrictions

