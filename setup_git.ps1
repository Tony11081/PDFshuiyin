# PDF Watermark Remover - Git Setup Script
# Author: Tony11081
# Repository: https://github.com/Tony11081/PDFshuiyin

Write-Host "=== PDF Watermark Remover Git Setup ===" -ForegroundColor Green
Write-Host "Starting Git configuration and code commit..." -ForegroundColor Yellow

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "Error: Git is not installed" -ForegroundColor Red
    exit 1
}

# Initialize Git repository
Write-Host "`n1. Initializing Git repository..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "Git repository already exists" -ForegroundColor Green
} else {
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
}

# Configure user information
Write-Host "`n2. Configuring Git user information..." -ForegroundColor Cyan
git config user.name "Tony11081"
git config user.email "chengyadong1112@gmail.com"
Write-Host "User information configured" -ForegroundColor Green

# Check working directory status
Write-Host "`n3. Checking file status..." -ForegroundColor Cyan
git status

# Add all files to staging area
Write-Host "`n4. Adding files to staging area..." -ForegroundColor Cyan
git add .
Write-Host "All files added to staging area" -ForegroundColor Green

# Commit code
Write-Host "`n5. Committing code..." -ForegroundColor Cyan
$commitMessage = "Initial commit: PDF Watermark Remover Tool

Features:
- Next.js Frontend Interface
- Python Flask Backend Processing
- PDF Upload and Preview
- PDF Watermark Removal Processing
- File Download Functionality
- Responsive Design

Tech Stack:
- Frontend: Next.js 15, TypeScript, Tailwind CSS
- Backend: Python Flask, PyPDF2/pikepdf
- File Processing: PDF-lib, Canvas API
- Styling: PostCSS, CSS Modules"

git commit -m "$commitMessage"
Write-Host "Code committed successfully" -ForegroundColor Green

# Configure remote repository
Write-Host "`n6. Configuring remote repository..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/Tony11081/PDFshuiyin.git"

# Remove existing origin if exists
git remote remove origin 2>$null

# Add remote repository
git remote add origin $remoteUrl
Write-Host "Remote repository configured: $remoteUrl" -ForegroundColor Green

# Set default branch to main
Write-Host "`n7. Setting main branch..." -ForegroundColor Cyan
git branch -M main
Write-Host "Main branch set to main" -ForegroundColor Green

# Push to GitHub
Write-Host "`n8. Pushing code to GitHub..." -ForegroundColor Cyan
Write-Host "Note: First time push may require GitHub username and password/token" -ForegroundColor Yellow
Write-Host "Recommend using Personal Access Token instead of password" -ForegroundColor Yellow

try {
    git push -u origin main
    Write-Host "`nCode successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/Tony11081/PDFshuiyin" -ForegroundColor Blue
}
catch {
    Write-Host "`nPush failed, may need authentication" -ForegroundColor Red
    Write-Host "Please try the following solutions:" -ForegroundColor Yellow
    Write-Host "1. Ensure GitHub repository is created" -ForegroundColor White
    Write-Host "2. Use Personal Access Token for authentication" -ForegroundColor White
    Write-Host "3. Manually execute: git push -u origin main" -ForegroundColor White
}

Write-Host "`n=== Git Setup Complete ===" -ForegroundColor Green
Write-Host "Repository Information:" -ForegroundColor Cyan
Write-Host "- Username: Tony11081" -ForegroundColor White
Write-Host "- Email: chengyadong1112@gmail.com" -ForegroundColor White
Write-Host "- Remote Repository: https://github.com/Tony11081/PDFshuiyin" -ForegroundColor White

# Show final status
Write-Host "`nFinal Git Status:" -ForegroundColor Cyan
git status --short
git remote -v

Write-Host "`nScript execution completed!" -ForegroundColor Green