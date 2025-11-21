# Deploy Google M to Google Cloud Run

This guide will walk you through deploying your Google M application to Google Cloud Run step by step.

## Prerequisites

1. **Google Cloud Account** - Sign up at [Google Cloud Console](https://console.cloud.google.com)
2. **Google Cloud CLI** - Install from [here](https://cloud.google.com/sdk/docs/install)
3. **Docker** (optional, for local testing) - Install from [here](https://www.docker.com/get-started)
4. **Billing Enabled** - Cloud Run requires a billing account (free tier available)

## Step 1: Install Google Cloud CLI

### Windows
1. Download the installer from [Google Cloud SDK](https://cloud.google.com/sdk/docs/install-sdk#windows)
2. Run the installer and follow the prompts
3. Restart your terminal

### Mac
```bash
# Using Homebrew
brew install --cask google-cloud-sdk

# Or download from website
# https://cloud.google.com/sdk/docs/install-sdk#mac
```

### Linux
```bash
# Download and install
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

## Step 2: Initialize Google Cloud

### 2.1 Login to Google Cloud

```bash
gcloud auth login
```

This will open a browser window. Sign in with your Google account.

### 2.2 Set Up a Project

```bash
# Create a new project (or use existing)
gcloud projects create google-m-project --name="Google M App"

# Set the project as active
gcloud config set project google-m-project

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

**Note**: Replace `google-m-project` with your desired project name (must be globally unique).

### 2.3 Enable Billing

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Billing** → **Link a billing account**
3. Create a billing account or link an existing one
4. Link it to your project

**Important**: Cloud Run has a generous free tier (2 million requests/month, 360,000 GB-seconds of memory, 180,000 vCPU-seconds).

## Step 3: Configure Environment Variables

Since Cloud Run runs in a container, you need to set environment variables in Cloud Run.

### Option A: Set via gcloud command (Recommended)

You'll set these during deployment (see Step 6).

### Option B: Use Secret Manager (For Production)

For production, use Google Secret Manager:

```bash
# Create secrets
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-
echo -n "your-cloudinary-cloud-name" | gcloud secrets create cloudinary-cloud-name --data-file=-
echo -n "your-cloudinary-upload-preset" | gcloud secrets create cloudinary-upload-preset --data-file=-
echo -n "your-firebase-api-key" | gcloud secrets create firebase-api-key --data-file=-
echo -n "your-firebase-auth-domain" | gcloud secrets create firebase-auth-domain --data-file=-
echo -n "your-firebase-project-id" | gcloud secrets create firebase-project-id --data-file=-
echo -n "your-firebase-messaging-sender-id" | gcloud secrets create firebase-messaging-sender-id --data-file=-
echo -n "your-firebase-app-id" | gcloud secrets create firebase-app-id --data-file=-
```

## Step 4: Build the Docker Image

### 4.1 Verify Files Exist

Make sure you have:
- ✅ `Dockerfile` (already created)
- ✅ `nginx.conf` (already created)
- ✅ `.dockerignore` (already created)
- ✅ `.env` file with your variables (for reference)

### 4.2 Build Locally (Optional - for testing)

```bash
# Build the image
docker build -t google-m-app .

# Test locally
docker run -p 8080:80 google-m-app

# Visit http://localhost:8080
```

### 4.3 Build in Google Cloud Build

```bash
# Set your project ID
export PROJECT_ID=$(gcloud config get-value project)
export SERVICE_NAME=google-m-app

# Build the container image
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
```

This will:
1. Upload your code to Cloud Build
2. Build the Docker image
3. Push it to Google Container Registry (GCR)

**Time**: This takes 3-5 minutes.

## Step 5: Deploy to Cloud Run

### 5.1 Basic Deployment

```bash
# Deploy with environment variables
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_GEMINI_API_KEY="your-gemini-api-key" \
  --set-env-vars VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name" \
  --set-env-vars VITE_CLOUDINARY_UPLOAD_PRESET="your-upload-preset" \
  --set-env-vars VITE_FIREBASE_API_KEY="your-firebase-api-key" \
  --set-env-vars VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com" \
  --set-env-vars VITE_FIREBASE_PROJECT_ID="your-project-id" \
  --set-env-vars VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id" \
  --set-env-vars VITE_FIREBASE_APP_ID="your-app-id" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### 5.2 Deploy with Secret Manager (Production)

```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --update-secrets VITE_GEMINI_API_KEY=gemini-api-key:latest \
  --update-secrets VITE_CLOUDINARY_CLOUD_NAME=cloudinary-cloud-name:latest \
  --update-secrets VITE_CLOUDINARY_UPLOAD_PRESET=cloudinary-upload-preset:latest \
  --update-secrets VITE_FIREBASE_API_KEY=firebase-api-key:latest \
  --update-secrets VITE_FIREBASE_AUTH_DOMAIN=firebase-auth-domain:latest \
  --update-secrets VITE_FIREBASE_PROJECT_ID=firebase-project-id:latest \
  --update-secrets VITE_FIREBASE_MESSAGING_SENDER_ID=firebase-messaging-sender-id:latest \
  --update-secrets VITE_FIREBASE_APP_ID=firebase-app-id:latest \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### 5.3 Deployment Options Explained

- `--platform managed`: Fully managed by Google
- `--region us-central1`: Choose closest region (us-east1, europe-west1, asia-southeast1, etc.)
- `--allow-unauthenticated`: Makes service publicly accessible
- `--memory 512Mi`: Memory allocation (256Mi minimum)
- `--cpu 1`: CPU allocation (1 vCPU)
- `--max-instances 10`: Maximum concurrent instances

## Step 6: Get Your Service URL

After deployment, you'll see output like:

```
Service [google-m-app] revision [google-m-app-00001-abc] has been deployed and is serving 100 percent of traffic.
Service URL: https://google-m-app-xxxxx-uc.a.run.app
```

**Your app is now live!** 🎉

## Step 7: Update Environment Variables (If Needed)

If you need to update environment variables later:

```bash
gcloud run services update $SERVICE_NAME \
  --region us-central1 \
  --update-env-vars VITE_GEMINI_API_KEY="new-value"
```

## Step 8: View Logs

```bash
# View logs
gcloud run services logs read $SERVICE_NAME --region us-central1

# Follow logs in real-time
gcloud run services logs tail $SERVICE_NAME --region us-central1
```

## Step 9: Set Up Custom Domain (Optional)

### 9.1 Map Custom Domain

```bash
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain yourdomain.com \
  --region us-central1
```

### 9.2 Update DNS

Follow the instructions provided by the command to update your DNS records.

## Troubleshooting

### Issue: Build fails with "npm ci" error

**Solution**: Make sure `package-lock.json` is committed to your repository.

### Issue: Environment variables not working

**Problem**: Vite requires `VITE_` prefix, but Cloud Run doesn't automatically inject these at build time.

**Solution**: Since we're building in Docker, the environment variables need to be available at build time OR we need to use runtime configuration.

**Fix**: Update `Dockerfile` to accept build args:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_GEMINI_API_KEY
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# Set as environment variables for build
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ... rest of Dockerfile
```

Then build with:

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --substitutions=_GEMINI_API_KEY="your-key",_CLOUDINARY_CLOUD_NAME="your-name",...
```

**Better Solution**: Use a `cloudbuild.yaml` file (see below).

### Issue: 404 errors on routes

**Solution**: The nginx.conf already handles SPA routing. Make sure it's copied correctly in Dockerfile.

### Issue: CORS errors

**Solution**: Add CORS headers in nginx.conf if needed for API calls.

## Advanced: Using cloudbuild.yaml

Create `cloudbuild.yaml` for better build control:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/google-m-app', '.']
    secretEnv: ['GEMINI_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_UPLOAD_PRESET', 'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID']
    env:
      - 'VITE_GEMINI_API_KEY=${_GEMINI_API_KEY}'
      - 'VITE_CLOUDINARY_CLOUD_NAME=${_CLOUDINARY_CLOUD_NAME}'
      - 'VITE_CLOUDINARY_UPLOAD_PRESET=${_CLOUDINARY_UPLOAD_PRESET}'
      - 'VITE_FIREBASE_API_KEY=${_FIREBASE_API_KEY}'
      - 'VITE_FIREBASE_AUTH_DOMAIN=${_FIREBASE_AUTH_DOMAIN}'
      - 'VITE_FIREBASE_PROJECT_ID=${_FIREBASE_PROJECT_ID}'
      - 'VITE_FIREBASE_MESSAGING_SENDER_ID=${_FIREBASE_MESSAGING_SENDER_ID}'
      - 'VITE_FIREBASE_APP_ID=${_FIREBASE_APP_ID}'

  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/google-m-app']

  # Deploy container image to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'google-m-app'
      - '--image'
      - 'gcr.io/$PROJECT_ID/google-m-app'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/google-m-app'

options:
  logging: CLOUD_LOGGING_ONLY
```

Then build with:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY="your-key",_CLOUDINARY_CLOUD_NAME="your-name",...
```

## Quick Deploy Script

Create `deploy.sh` for easy deployment:

```bash
#!/bin/bash

# Set variables
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="google-m-app"
REGION="us-central1"

# Build and deploy
echo "Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" \
  --set-env-vars VITE_CLOUDINARY_CLOUD_NAME="$VITE_CLOUDINARY_CLOUD_NAME" \
  --set-env-vars VITE_CLOUDINARY_UPLOAD_PRESET="$VITE_CLOUDINARY_UPLOAD_PRESET" \
  --set-env-vars VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  --set-env-vars VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
  --set-env-vars VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
  --set-env-vars VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
  --set-env-vars VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
  --memory 512Mi \
  --cpu 1

echo "Deployment complete!"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Cost Estimation

Cloud Run pricing (as of 2024):
- **Free Tier**: 2 million requests/month, 360,000 GB-seconds, 180,000 vCPU-seconds
- **After Free Tier**: 
  - $0.40 per million requests
  - $0.0000025 per GB-second
  - $0.0000100 per vCPU-second

For a small to medium app, you'll likely stay within the free tier.

## Next Steps

1. ✅ Set up monitoring in Cloud Console
2. ✅ Configure custom domain
3. ✅ Set up CI/CD with Cloud Build
4. ✅ Enable Cloud CDN for faster global delivery
5. ✅ Set up alerts for errors and performance

## Support

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/tips)

---

**Your app is now running on Google Cloud Run!** 🚀

