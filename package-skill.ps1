#!/usr/bin/env pwsh
<#
.SYNOPSIS
打包MiniMax Vision & Search技能

.DESCRIPTION
将技能打包为ZIP文件，准备上传到GitHub或ClawHub

.PARAMETER OutputPath
输出ZIP文件路径（默认：当前目录）

.PARAMETER Version
版本号（默认：从package.json读取）

.EXAMPLE
.\package-skill.ps1
.\package-skill.ps1 -OutputPath "C:\Downloads\"
.\package-skill.ps1 -Version "1.0.1"
#>

param(
    [string]$OutputPath = ".",
    [string]$Version = ""
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 获取脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillDir = $ScriptDir

# 读取版本号
if ([string]::IsNullOrEmpty($Version)) {
    $packageJson = Get-Content -Path "$SkillDir\package.json" -Raw | ConvertFrom-Json
    $Version = $packageJson.version
}

# 创建输出文件名
$OutputFile = "$OutputPath\minimax-vision-search-v$Version.zip"
$TempDir = "$env:TEMP\minimax-vision-search-$Version"

Write-Host "📦 开始打包 MiniMax Vision & Search v$Version" -ForegroundColor Cyan
Write-Host "技能目录: $SkillDir" -ForegroundColor Gray
Write-Host "输出文件: $OutputFile" -ForegroundColor Gray
Write-Host "临时目录: $TempDir" -ForegroundColor Gray

# 清理临时目录
if (Test-Path $TempDir) {
    Write-Host "清理临时目录..." -ForegroundColor Yellow
    Remove-Item -Path $TempDir -Recurse -Force
}

# 创建临时目录结构
Write-Host "创建目录结构..." -ForegroundColor Green
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
New-Item -ItemType Directory -Path "$TempDir\api" -Force | Out-Null
New-Item -ItemType Directory -Path "$TempDir\scripts" -Force | Out-Null
New-Item -ItemType Directory -Path "$TempDir\web" -Force | Out-Null
New-Item -ItemType Directory -Path "$TempDir\examples" -Force | Out-Null
New-Item -ItemType Directory -Path "$TempDir\api\uploads" -Force | Out-Null

# 复制核心文件
Write-Host "复制核心文件..." -ForegroundColor Green
$CoreFiles = @(
    "SKILL.md",
    "README.md",
    "package.json",
    ".gitignore",
    "package-skill.ps1"
)

foreach ($file in $CoreFiles) {
    if (Test-Path "$SkillDir\$file") {
        Copy-Item -Path "$SkillDir\$file" -Destination "$TempDir\" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# 复制脚本文件
Write-Host "复制脚本文件..." -ForegroundColor Green
$ScriptFiles = Get-ChildItem -Path "$SkillDir\scripts" -File
foreach ($file in $ScriptFiles) {
    Copy-Item -Path $file.FullName -Destination "$TempDir\scripts\" -Force
    Write-Host "  ✓ scripts\$($file.Name)" -ForegroundColor Gray
}

# 复制API文件
Write-Host "复制API文件..." -ForegroundColor Green
$ApiFiles = @(
    "server.js",
    "package.json"
)

foreach ($file in $ApiFiles) {
    if (Test-Path "$SkillDir\api\$file") {
        Copy-Item -Path "$SkillDir\api\$file" -Destination "$TempDir\api\" -Force
        Write-Host "  ✓ api\$file" -ForegroundColor Gray
    }
}

# 复制Web文件
Write-Host "复制Web文件..." -ForegroundColor Green
$WebFiles = Get-ChildItem -Path "$SkillDir\web" -File
foreach ($file in $WebFiles) {
    Copy-Item -Path $file.FullName -Destination "$TempDir\web\" -Force
    Write-Host "  ✓ web\$($file.Name)" -ForegroundColor Gray
}

# 复制示例文件
Write-Host "复制示例文件..." -ForegroundColor Green
$ExampleFiles = Get-ChildItem -Path "$SkillDir\examples" -File
foreach ($file in $ExampleFiles) {
    Copy-Item -Path $file.FullName -Destination "$TempDir\examples\" -Force
    Write-Host "  ✓ examples\$($file.Name)" -ForegroundColor Gray
}

# 创建.gitkeep文件
Write-Host "创建.gitkeep文件..." -ForegroundColor Green
Set-Content -Path "$TempDir\api\uploads\.gitkeep" -Value "# Keep this directory in git"

# 创建版本文件
Write-Host "创建版本文件..." -ForegroundColor Green
$VersionInfo = @{
    version = $Version
    build_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    skill_name = "minimax-vision-search"
    description = "MiniMax Vision & Search Skill for OpenClaw"
}
$VersionInfo | ConvertTo-Json | Set-Content -Path "$TempDir\VERSION.json"

# 创建安装说明
Write-Host "创建安装说明..." -ForegroundColor Green
$InstallGuide = @"
# 安装说明

## 快速安装

1. 解压本ZIP文件到OpenClaw技能目录：
   ```bash
   # Windows
   C:\Users\YourName\.openclaw\skills\minimax-vision-search
   
   # Linux/macOS
   ~/.openclaw/skills/minimax-vision-search
   ```

2. 安装依赖：
   ```bash
   cd minimax-vision-search/api
   npm install
   
   # 全局安装mcporter
   npm install -g @modelcontextprotocol/mcporter
   ```

3. 配置API Key：
   ```bash
   node scripts/setup-config.js --api-key "YOUR_API_KEY_HERE"
   ```

4. 验证安装：
   ```bash
   mcporter list
   node scripts/web-search.js --query "测试"
   ```

## 详细说明

请查看 [README.md](README.md) 和 [SKILL.md](SKILL.md) 获取完整文档。

## 版本信息
- 版本: $Version
- 构建日期: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- 技能名称: minimax-vision-search

## 支持
如有问题，请查看文档或创建GitHub Issue。
"@

Set-Content -Path "$TempDir\INSTALL.md" -Value $InstallGuide

# 创建ZIP文件
Write-Host "创建ZIP文件..." -ForegroundColor Cyan
try {
    # 使用Compress-Archive
    $ZipParams = @{
        Path = "$TempDir\*"
        DestinationPath = $OutputFile
        CompressionLevel = "Optimal"
        Force = $true
    }
    Compress-Archive @ZipParams
    
    # 计算文件大小
    $FileSize = (Get-Item $OutputFile).Length
    $FileSizeMB = [math]::Round($FileSize / 1MB, 2)
    
    Write-Host "✅ 打包完成！" -ForegroundColor Green
    Write-Host "📁 输出文件: $OutputFile" -ForegroundColor Cyan
    Write-Host "📊 文件大小: ${FileSizeMB}MB" -ForegroundColor Cyan
    Write-Host "📦 包含文件:" -ForegroundColor Cyan
    
    # 显示包含的文件
    $FileCount = (Get-ChildItem -Path $TempDir -Recurse -File).Count
    Write-Host "  文件数量: $FileCount 个" -ForegroundColor Gray
    
    # 显示目录结构
    Write-Host "  目录结构:" -ForegroundColor Gray
    Get-ChildItem -Path $TempDir -Recurse | Where-Object { $_.PSIsContainer } | ForEach-Object {
        $RelativePath = $_.FullName.Substring($TempDir.Length + 1)
        if ($RelativePath) {
            Write-Host "    📁 $RelativePath\" -ForegroundColor DarkGray
        }
    }
    
    # 清理临时目录
    Write-Host "清理临时目录..." -ForegroundColor Yellow
    Remove-Item -Path $TempDir -Recurse -Force
    
    Write-Host "🎉 所有操作完成！" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 打包失败: $_" -ForegroundColor Red
    exit 1
}