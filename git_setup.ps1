# PDF水印移除工具 - Git设置和提交脚本
# 作者: Tony11081
# 仓库: https://github.com/Tony11081/PDFshuiyin

Write-Host "=== PDF水印移除工具 Git设置脚本 ===" -ForegroundColor Green
Write-Host "开始配置Git并提交代码到GitHub..." -ForegroundColor Yellow

# 检查Git是否已安装
try {
    $gitVersion = git --version
    Write-Host "✓ Git已安装: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ 错误: Git未安装，请先安装Git" -ForegroundColor Red
    exit 1
}

# 初始化Git仓库
Write-Host "`n1. 初始化Git仓库..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "✓ Git仓库已存在" -ForegroundColor Green
} else {
    git init
    Write-Host "✓ Git仓库初始化完成" -ForegroundColor Green
}

# 配置用户信息
Write-Host "`n2. 配置Git用户信息..." -ForegroundColor Cyan
git config user.name "Tony11081"
git config user.email "chengyadong1112@gmail.com"
Write-Host "✓ 用户信息配置完成" -ForegroundColor Green

# 检查工作区状态
Write-Host "`n3. 检查文件状态..." -ForegroundColor Cyan
git status

# 添加所有文件到暂存区
Write-Host "`n4. 添加文件到暂存区..." -ForegroundColor Cyan
git add .
Write-Host "✓ 所有文件已添加到暂存区" -ForegroundColor Green

# 提交代码
Write-Host "`n5. 提交代码..." -ForegroundColor Cyan
$commitMessage = "Initial commit: PDF水印移除工具

功能特性:
- 🖥️ Next.js 前端界面
- 🐍 Python Flask 后端处理
- 📄 PDF上传和预览功能
- 🔧 PDF水印移除处理
- 💾 文件下载功能
- 📱 响应式设计

技术栈:
- Frontend: Next.js 15, TypeScript, Tailwind CSS
- Backend: Python Flask, PyPDF2/pikepdf
- 文件处理: PDF-lib, Canvas API
- 样式: PostCSS, CSS Modules"

git commit -m "$commitMessage"
Write-Host "✓ 代码提交完成" -ForegroundColor Green

# 检查远程仓库
Write-Host "`n6. 配置远程仓库..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/Tony11081/PDFshuiyin.git"

# 移除可能存在的origin
git remote remove origin 2>$null

# 添加远程仓库
git remote add origin $remoteUrl
Write-Host "✓ 远程仓库配置完成: $remoteUrl" -ForegroundColor Green

# 设置默认分支为main
Write-Host "`n7. 设置主分支..." -ForegroundColor Cyan
git branch -M main
Write-Host "✓ 主分支设置为main" -ForegroundColor Green

# 推送到GitHub
Write-Host "`n8. 推送代码到GitHub..." -ForegroundColor Cyan
Write-Host "注意: 如果是第一次推送，可能需要输入GitHub用户名和密码/令牌" -ForegroundColor Yellow
Write-Host "推荐使用Personal Access Token替代密码" -ForegroundColor Yellow

try {
    git push -u origin main
    Write-Host "`n✅ 代码成功推送到GitHub!" -ForegroundColor Green
    Write-Host "仓库地址: https://github.com/Tony11081/PDFshuiyin" -ForegroundColor Blue
}
catch {
    Write-Host "`n⚠️  推送失败，可能需要认证" -ForegroundColor Red
    Write-Host "请尝试以下解决方案:" -ForegroundColor Yellow
    Write-Host "1. 确保GitHub仓库已创建" -ForegroundColor White
    Write-Host "2. 使用Personal Access Token进行认证" -ForegroundColor White
    Write-Host "3. 手动执行: git push -u origin main" -ForegroundColor White
}

Write-Host "`n=== Git设置完成 ===" -ForegroundColor Green
Write-Host "仓库信息:" -ForegroundColor Cyan
Write-Host "- 用户名: Tony11081" -ForegroundColor White
Write-Host "- 邮箱: chengyadong1112@gmail.com" -ForegroundColor White
Write-Host "- 远程仓库: https://github.com/Tony11081/PDFshuiyin" -ForegroundColor White

# 显示最终状态
Write-Host "`n最终Git状态:" -ForegroundColor Cyan
git status --short
git remote -v

Write-Host "`n脚本执行完成!" -ForegroundColor Green