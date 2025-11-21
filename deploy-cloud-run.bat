@echo off
REM Google Cloud Run Deployment Script for Google M (Windows)
REM This script builds and deploys your app to Cloud Run

echo 🚀 Google M - Cloud Run Deployment
echo.

REM Get project ID
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo ⚠️  No project set. Please set your project:
    echo    gcloud config set project YOUR_PROJECT_ID
    exit /b 1
)

echo ✓ Project ID: %PROJECT_ID%

REM Set variables
set SERVICE_NAME=google-m-app
set REGION=us-central1
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Please create one with your environment variables.
    exit /b 1
)

REM Load environment variables from .env file
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    set "%%a=%%b"
)

REM Build the Docker image
echo.
echo 📦 Step 1: Building Docker image...
gcloud builds submit --tag %IMAGE_NAME% ^
    --build-arg VITE_GEMINI_API_KEY="%VITE_GEMINI_API_KEY%" ^
    --build-arg VITE_CLOUDINARY_CLOUD_NAME="%VITE_CLOUDINARY_CLOUD_NAME%" ^
    --build-arg VITE_CLOUDINARY_UPLOAD_PRESET="%VITE_CLOUDINARY_UPLOAD_PRESET%" ^
    --build-arg VITE_FIREBASE_API_KEY="%VITE_FIREBASE_API_KEY%" ^
    --build-arg VITE_FIREBASE_AUTH_DOMAIN="%VITE_FIREBASE_AUTH_DOMAIN%" ^
    --build-arg VITE_FIREBASE_PROJECT_ID="%VITE_FIREBASE_PROJECT_ID%" ^
    --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="%VITE_FIREBASE_MESSAGING_SENDER_ID%" ^
    --build-arg VITE_FIREBASE_APP_ID="%VITE_FIREBASE_APP_ID%"

if errorlevel 1 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✓ Docker image built successfully
echo.

REM Deploy to Cloud Run
echo 🚀 Step 2: Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
    --image %IMAGE_NAME% ^
    --platform managed ^
    --region %REGION% ^
    --allow-unauthenticated ^
    --memory 512Mi ^
    --cpu 1 ^
    --max-instances 10 ^
    --timeout 300 ^
    --port 80

if errorlevel 1 (
    echo ❌ Deployment failed!
    exit /b 1
)

echo.
echo ✓ Deployment complete!
echo.

REM Get the service URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)"') do set SERVICE_URL=%%i

echo 🎉 Your app is live at:
echo    %SERVICE_URL%
echo.
echo 📊 View logs:
echo    gcloud run services logs tail %SERVICE_NAME% --region %REGION%
echo.
echo 🔧 Update service:
echo    gcloud run services update %SERVICE_NAME% --region %REGION%
echo.

pause

