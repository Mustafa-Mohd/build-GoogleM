# Deployment Guide - Google Cloud / Firebase Hosting

This guide will help you deploy your Google M project to Google Cloud Platform.

## Option 1: Firebase Hosting (Recommended - Easiest)

Since you're already using Firebase, this is the simplest option.

### Prerequisites

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

### Step 1: Initialize Firebase Hosting

1. In your project root, run:
```bash
firebase init hosting
```

2. Follow the prompts:
   - **Select Firebase project**: Choose your existing Firebase project
   - **What do you want to use as your public directory?**: `dist`
   - **Configure as a single-page app?**: Yes
   - **Set up automatic builds and deploys with GitHub?**: No (or Yes if you want CI/CD)
   - **File dist/index.html already exists. Overwrite?**: No

### Step 2: Build Your Project

```bash
npm run build
```

This creates a `dist` folder with your production build.

### Step 3: Deploy

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Step 4: Update Firebase Config (if needed)

Make sure your `.env` variables are set in Firebase Hosting environment or use Firebase Functions for server-side config.

## Option 2: Google Cloud Run (Containerized)

For more control and scalability.

### Step 1: Create Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create nginx.conf

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3: Build and Deploy

```bash
# Set your project ID
export PROJECT_ID=your-project-id
export SERVICE_NAME=google-m-app

# Build the container
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Option 3: Google App Engine

### Step 1: Create app.yaml

Create `app.yaml`:

```yaml
runtime: nodejs18

handlers:
  - url: /(.*\..+)$
    static_files: dist/\1
    upload: dist/(.*\..+)$

  - url: /.*
    static_files: dist/index.html
    upload: dist/index.html
```

### Step 2: Deploy

```bash
# Build first
npm run build

# Deploy
gcloud app deploy
```

## Environment Variables

For all options, you need to handle environment variables:

### Firebase Hosting

Firebase Hosting is static, so you have two options:

1. **Use Firebase Functions** for server-side operations
2. **Build-time variables** - Add to your build script:
   ```json
   "build": "vite build --mode production"
   ```

### Cloud Run / App Engine

Use Google Secret Manager or environment variables:

```bash
gcloud run services update SERVICE_NAME \
  --set-env-vars="VITE_FIREBASE_API_KEY=your_key" \
  --set-env-vars="VITE_GEMINI_API_KEY=your_key"
```

## Recommended: Firebase Hosting Setup

Let me create the Firebase configuration files for you.

