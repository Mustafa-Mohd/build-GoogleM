# 🚀 Cloud Run Deployment Checklist

Follow these steps in order to deploy your app to Google Cloud Run.

## ✅ Step 1: Complete Google Cloud CLI Installation

**If you just downloaded the installer:**
1. Run the installer (GoogleCloudSDKInstaller.exe)
2. Follow the installation wizard
3. **IMPORTANT:** Restart your terminal/PowerShell after installation
4. Verify installation:
   ```powershell
   gcloud --version
   ```

**If gcloud still doesn't work after restart:**
- Try using the full path: `C:\Program Files\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd`
- Or manually add to PATH (see INSTALL_GCLOUD.md)

---

## ✅ Step 2: Login to Google Cloud

```powershell
gcloud auth login
```

This will open a browser window. Sign in with your Google account.

---

## ✅ Step 3: Create/Select a Project

```powershell
# Create a new project (choose a unique name)
gcloud projects create YOUR-PROJECT-ID --name="Your App Name"

# Set it as active
gcloud config set project YOUR-PROJECT-ID
```

**Note:** Project IDs must be globally unique. Try something like: `my-app-2024` or `biz-card-glow-12345`

---

## ✅ Step 4: Enable Billing

1. Go to: https://console.cloud.google.com/billing
2. Link a billing account to your project
3. **Don't worry:** Cloud Run has a generous free tier (2M requests/month)

---

## ✅ Step 5: Enable Required APIs

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## ✅ Step 6: Create .env File

Create a `.env` file in the project root with your API keys:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Where to find these:**
- **Gemini API Key:** https://aistudio.google.com/app/apikey
- **Cloudinary:** https://cloudinary.com/console
- **Firebase:** https://console.firebase.google.com → Project Settings → General

---

## ✅ Step 7: Deploy!

Once all above steps are complete, navigate to your project directory and run:

**Windows:**
```cmd
cd C:\Users\saiku\Downloads\GoogleM-project-main\GoogleM-project-main\biz-card-glow-main
deploy-cloud-run.bat
```

**Or from any directory using the full path:**
```cmd
C:\Users\saiku\Downloads\GoogleM-project-main\GoogleM-project-main\biz-card-glow-main\deploy-cloud-run.bat
```

**Or manually:**
```powershell
# Set variables
$PROJECT_ID = (gcloud config get-value project)
$SERVICE_NAME = "google-m-app"

# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME `
  --build-arg VITE_GEMINI_API_KEY="$env:VITE_GEMINI_API_KEY" `
  --build-arg VITE_CLOUDINARY_CLOUD_NAME="$env:VITE_CLOUDINARY_CLOUD_NAME" `
  --build-arg VITE_CLOUDINARY_UPLOAD_PRESET="$env:VITE_CLOUDINARY_UPLOAD_PRESET" `
  --build-arg VITE_FIREBASE_API_KEY="$env:VITE_FIREBASE_API_KEY" `
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="$env:VITE_FIREBASE_AUTH_DOMAIN" `
  --build-arg VITE_FIREBASE_PROJECT_ID="$env:VITE_FIREBASE_PROJECT_ID" `
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$env:VITE_FIREBASE_MESSAGING_SENDER_ID" `
  --build-arg VITE_FIREBASE_APP_ID="$env:VITE_FIREBASE_APP_ID"

gcloud run deploy $SERVICE_NAME `
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1
```

---

## ✅ Step 8: Get Your URL

After deployment completes, you'll see:
```
Service URL: https://google-m-app-xxxxx-uc.a.run.app
```

**Your app is live!** 🎉

---

## 📋 Quick Status Check

Run these to verify your setup:

```powershell
# Check gcloud is installed
gcloud --version

# Check you're logged in
gcloud auth list

# Check project is set
gcloud config get-value project

# Check APIs are enabled
gcloud services list --enabled
```

---

## ❓ Need Help?

- **gcloud not found:** Restart terminal or check INSTALL_GCLOUD.md
- **Authentication issues:** Run `gcloud auth login` again
- **Project creation fails:** Project ID must be globally unique
- **Build fails:** Check your `.env` file has all variables
- **Deployment fails:** Verify billing is enabled and APIs are active

---

**Ready to deploy?** Complete steps 1-6, then let me know and I'll help you run the deployment! 🚀

