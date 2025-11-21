# GitHub Setup Guide

## Step 1: Install Git (if not installed)

Download and install Git from: https://git-scm.com/download/win

After installation, restart your terminal/command prompt.

## Step 2: Verify Git Installation

Open a new terminal and run:
```bash
git --version
```

If it shows a version number, Git is installed correctly.

## Step 3: Configure Git (First Time Only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 4: Initialize Git Repository (if not already done)

```bash
cd "C:\Users\saiku\Downloads\GoogleM-project-main\GoogleM-project-main\biz-card-glow-main"
git init
```

## Step 5: Add All Files

```bash
git add .
```

## Step 6: Make Initial Commit

```bash
git commit -m "Initial commit: Google M project"
```

## Step 7: Add Remote Repository

```bash
git remote add origin https://github.com/Mustafa-Mohd/build-GoogleM.git
```

## Step 8: Rename Branch to Main

```bash
git branch -M main
```

## Step 9: Push to GitHub

```bash
git push -u origin main
```

You'll be prompted for your GitHub username and password (or personal access token).

## Important: Before Pushing

Make sure your `.env` file is in `.gitignore` (it should be already).

Check what will be committed:
```bash
git status
```

## If You Get Authentication Errors

GitHub no longer accepts passwords. Use a Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token
5. Use the token as your password when pushing

## Quick Commands Summary

```bash
# Install Git first from https://git-scm.com/download/win

# Then run these commands:
git init
git add .
git commit -m "Initial commit: Google M project"
git remote add origin https://github.com/Mustafa-Mohd/build-GoogleM.git
git branch -M main
git push -u origin main
```

## Troubleshooting

### "git is not recognized"
- Install Git from https://git-scm.com/download/win
- Restart terminal after installation

### "Repository not found"
- Make sure the repository exists on GitHub
- Check you have access to the repository
- Verify the URL is correct

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys

### "Permission denied"
- Make sure you're logged into GitHub
- Check repository permissions



