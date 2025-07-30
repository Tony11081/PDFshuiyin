@echo off
echo ======================================
echo PDF Watermark Remover - Git Setup
echo ======================================

echo Checking Git installation...
git --version
if %errorlevel% neq 0 (
    echo Error: Git is not installed
    pause
    exit /b 1
)

echo.
echo 1. Initializing Git repository...
git init

echo.
echo 2. Configuring user information...
git config user.name "Tony11081"
git config user.email "chengyadong1112@gmail.com"

echo.
echo 3. Checking file status...
git status

echo.
echo 4. Adding files to staging area...
git add .

echo.
echo 5. Committing code...
git commit -m "Initial commit: PDF Watermark Remover Tool

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

echo.
echo 6. Configuring remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Tony11081/PDFshuiyin.git

echo.
echo 7. Setting main branch...
git branch -M main

echo.
echo 8. Pushing to GitHub...
echo Note: You may need to enter GitHub credentials
git push -u origin main

echo.
echo ======================================
echo Git Setup Complete!
echo ======================================
echo Repository: https://github.com/Tony11081/PDFshuiyin
echo Username: Tony11081
echo Email: chengyadong1112@gmail.com

echo.
echo Final status:
git status --short
git remote -v

pause