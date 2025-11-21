#!/bin/bash

# Google Cloud Run Deployment Script for Google M
# This script builds and deploys your app to Cloud Run

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Google M - Cloud Run Deployment${NC}\n"

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No project set. Please set your project:${NC}"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✓ Project ID: ${PROJECT_ID}${NC}"

# Set variables
SERVICE_NAME="google-m-app"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please create one with your environment variables.${NC}"
    exit 1
fi

# Load environment variables from .env file
export $(cat .env | grep -v '^#' | xargs)

# Check required variables
REQUIRED_VARS=(
    "VITE_GEMINI_API_KEY"
    "VITE_CLOUDINARY_CLOUD_NAME"
    "VITE_CLOUDINARY_UPLOAD_PRESET"
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Missing required environment variables:${NC}"
    printf '   %s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo -e "${GREEN}✓ All environment variables found${NC}\n"

# Step 1: Build the Docker image
echo -e "${BLUE}📦 Step 1: Building Docker image...${NC}"
gcloud builds submit \
    --tag $IMAGE_NAME \
    --build-arg VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" \
    --build-arg VITE_CLOUDINARY_CLOUD_NAME="$VITE_CLOUDINARY_CLOUD_NAME" \
    --build-arg VITE_CLOUDINARY_UPLOAD_PRESET="$VITE_CLOUDINARY_UPLOAD_PRESET" \
    --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
    --build-arg VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
    --build-arg VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
    --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
    --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID"

echo -e "${GREEN}✓ Docker image built successfully${NC}\n"

# Step 2: Deploy to Cloud Run
echo -e "${BLUE}🚀 Step 2: Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --port 80

echo -e "${GREEN}✓ Deployment complete!${NC}\n"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region $REGION \
    --format 'value(status.url)')

echo -e "${GREEN}🎉 Your app is live at:${NC}"
echo -e "${BLUE}   ${SERVICE_URL}${NC}\n"

echo -e "${GREEN}📊 View logs:${NC}"
echo "   gcloud run services logs tail $SERVICE_NAME --region $REGION"
echo ""
echo -e "${GREEN}🔧 Update service:${NC}"
echo "   gcloud run services update $SERVICE_NAME --region $REGION"
echo ""



