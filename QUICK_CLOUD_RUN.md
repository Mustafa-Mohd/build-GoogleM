# Quick Start: Deploy to Google Cloud Run

## 🚀 Fast Deployment (5 Steps)

### Step 1: Install Google Cloud CLI

**Windows:**
- Download from: https://cloud.google.com/sdk/docs/install-sdk#windows
- Run installer and restart terminal

**Mac:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Step 2: Login & Setup

```bash
# Login
gcloud auth login

# Create project (or use existing)
gcloud projects create google-m-project --name="Google M App"
gcloud config set project google-m-project

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

**Important:** Enable billing in [Google Cloud Console](https://console.cloud.google.com/billing)

### Step 3: Verify Files

Make sure you have:
- ✅ `Dockerfile`
- ✅ `nginx.conf`
- ✅ `.dockerignore`
- ✅ `.env` file with all your API keys

### Step 4: Deploy

**Windows:**
```cmd
deploy-cloud-run.bat
```

**Mac/Linux:**
```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

**Or manually:**
```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export SERVICE_NAME=google-m-app

# Build (reads from .env file)
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --build-arg VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" \
  --build-arg VITE_CLOUDINARY_CLOUD_NAME="$VITE_CLOUDINARY_CLOUD_NAME" \
  --build-arg VITE_CLOUDINARY_UPLOAD_PRESET="$VITE_CLOUDINARY_UPLOAD_PRESET" \
  --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
  --build-arg VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID"

# Deploy
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

### Step 5: Get Your URL

After deployment, you'll see:
```
Service URL: https://google-m-app-xxxxx-uc.a.run.app
```

**Your app is live!** 🎉

## 📝 Notes

- **First deployment takes 5-10 minutes** (building Docker image)
- **Subsequent deployments are faster** (2-3 minutes)
- **Free tier includes:** 2M requests/month, 360K GB-seconds
- **Cost:** Likely $0/month for small apps

## 🔧 Common Commands

```bash
# View logs
gcloud run services logs tail google-m-app --region us-central1

# Update service
gcloud run services update google-m-app --region us-central1

# Delete service
gcloud run services delete google-m-app --region us-central1

# List services
gcloud run services list
```

## ❓ Troubleshooting

**Build fails?**
- Check `.env` file has all variables
- Verify `package-lock.json` exists
- Check Google Cloud billing is enabled

**Deployment fails?**
- Verify APIs are enabled
- Check you have Cloud Run permissions
- Review logs: `gcloud builds list`

**App not working?**
- Check environment variables are set correctly
- View service logs
- Verify Firebase/Cloudinary credentials

## 📚 Full Guide

See `CLOUD_RUN_DEPLOY.md` for detailed instructions.

---

**Need help?** Check the full deployment guide or Google Cloud documentation.

