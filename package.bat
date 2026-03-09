@echo off
setlocal enabledelayedexpansion

echo 📦 打包 MiniMax Vision & Search 技能
echo.

REM 设置路径
set "SKILL_DIR=%~dp0"
set "OUTPUT_FILE=%SKILL_DIR%minimax-vision-search-v1.0.0.zip"
set "TEMP_DIR=%TEMP%\minimax-vision-search"

echo 技能目录: %SKILL_DIR%
echo 输出文件: %OUTPUT_FILE%
echo 临时目录: %TEMP_DIR%
echo.

REM 清理临时目录
if exist "%TEMP_DIR%" (
    echo 清理临时目录...
    rmdir /s /q "%TEMP_DIR%"
)

REM 创建临时目录结构
echo 创建目录结构...
mkdir "%TEMP_DIR%"
mkdir "%TEMP_DIR%\api"
mkdir "%TEMP_DIR%\scripts"
mkdir "%TEMP_DIR%\web"
mkdir "%TEMP_DIR%\examples"
mkdir "%TEMP_DIR%\api\uploads"

REM 复制核心文件
echo 复制核心文件...
copy "%SKILL_DIR%SKILL.md" "%TEMP_DIR%\" >nul
copy "%SKILL_DIR%README.md" "%TEMP_DIR%\" >nul
copy "%SKILL_DIR%package.json" "%TEMP_DIR%\" >nul
copy "%SKILL_DIR%.gitignore" "%TEMP_DIR%\" >nul
echo   ✓ 核心文件已复制

REM 复制脚本文件
echo 复制脚本文件...
for %%f in ("%SKILL_DIR%scripts\*.js") do (
    copy "%%f" "%TEMP_DIR%\scripts\" >nul
    echo   ✓ scripts\%%~nxf
)

REM 复制API文件
echo 复制API文件...
copy "%SKILL_DIR%api\server.js" "%TEMP_DIR%\api\" >nul
copy "%SKILL_DIR%api\package.json" "%TEMP_DIR%\api\" >nul
echo   ✓ API文件已复制

REM 复制Web文件
echo 复制Web文件...
copy "%SKILL_DIR%web\index.html" "%TEMP_DIR%\web\" >nul
echo   ✓ Web文件已复制

REM 复制示例文件
echo 复制示例文件...
copy "%SKILL_DIR%examples\example-usage.md" "%TEMP_DIR%\examples\" >nul
echo   ✓ 示例文件已复制

REM 创建.gitkeep文件
echo 创建.gitkeep文件...
echo # Keep this directory in git > "%TEMP_DIR%\api\uploads\.gitkeep"

REM 创建版本文件
echo 创建版本文件...
echo { > "%TEMP_DIR%\VERSION.json"
echo   "version": "1.0.0", >> "%TEMP_DIR%\VERSION.json"
echo   "build_date": "%date% %time%", >> "%TEMP_DIR%\VERSION.json"
echo   "skill_name": "minimax-vision-search", >> "%TEMP_DIR%\VERSION.json"
echo   "description": "MiniMax Vision & Search Skill for OpenClaw" >> "%TEMP_DIR%\VERSION.json"
echo } >> "%TEMP_DIR%\VERSION.json"

REM 创建安装说明
echo 创建安装说明...
echo # 安装说明 > "%TEMP_DIR%\INSTALL.md"
echo. >> "%TEMP_DIR%\INSTALL.md"
echo ## 快速安装 >> "%TEMP_DIR%\INSTALL.md"
echo. >> "%TEMP_DIR%\INSTALL.md"
echo 1. 解压本ZIP文件到OpenClaw技能目录： >> "%TEMP_DIR%\INSTALL.md"
echo    ```bash >> "%TEMP_DIR%\INSTALL.md"
echo    # Windows >> "%TEMP_DIR%\INSTALL.md"
echo    C:\Users\YourName\.openclaw\skills\minimax-vision-search >> "%TEMP_DIR%\INSTALL.md"
echo. >> "%TEMP_DIR%\INSTALL.md"
echo    # Linux/macOS >> "%TEMP_DIR%\INSTALL.md"
echo    ~/.openclaw/skills/minimax-vision-search >> "%TEMP_DIR%\INSTALL.md"
echo    ``` >> "%TEMP_DIR%\INSTALL.md"
echo. >> "%TEMP_DIR%\INSTALL.md"
echo 2. 安装依赖： >> "%TEMP_DIR%\INSTALL.md"
echo    ```bash >> "%TEMP_DIR%\INSTALL.md"
echo    cd minimax-vision-search/api >> "%TEMP_DIR%\INSTALL.md"
echo    npm install >> "%TEMP_DIR%\INSTALL.md"
echo. >> "%TEMP_DIR%\INSTALL.md"
echo    # 全局安装mcporter >> "%TEMP_DIR%\INSTALL.md"
echo    npm install -g @modelcontextprotocol/mcporter >> "%TEMP_DIR%\INSTALL.md"
echo    ``` >> "%TEMP_DIR%\INSTALL.md"
echo. >> "%TEMP_DIR%\INSTALL.md"
echo 3. 配置API Key： >> "%TEMP_DIR%\INSTALL.md"
echo    ```bash >> "%TEMP_DIR%\INSTALL.md"
echo    node scripts/setup-config.js --api-key "YOUR_API_KEY_HERE" >> "%TEMP_DIR%\INSTALL.md"
echo    ``` >> "%TEMP_DIR%\INSTALL.md"
echo. >> "%TEMP_DIR%\INSTALL.md"
echo 4. 验证安装： >> "%TEMP_DIR%\INSTALL.md"
echo    ```bash >> "%TEMP_DIR%\INSTALL.md"
echo    mcporter list >> "%TEMP_DIR%\INSTALL.md"
echo    node scripts/web-search.js --query "测试" >> "%TEMP_DIR%\INSTALL.md"
echo    ``` >> "%TEMP_DIR%\INSTALL.md"

REM 创建ZIP文件
echo 创建ZIP文件...
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%OUTPUT_FILE%' -CompressionLevel Optimal -Force"

REM 计算文件大小
for %%F in ("%OUTPUT_FILE%") do set "FILESIZE=%%~zF"
set /a FILESIZE_MB=FILESIZE/1048576

echo.
echo ✅ 打包完成！
echo 📁 输出文件: %OUTPUT_FILE%
echo 📊 文件大小: %FILESIZE_MB%MB

REM 显示包含的文件
dir "%TEMP_DIR%" /s /b | find /c /v "" >nul
set /a FILECOUNT=0
for /f %%a in ('dir "%TEMP_DIR%" /s /b ^| find /c /v ""') do set /a FILECOUNT=%%a
echo 📦 包含文件: %FILECOUNT% 个

REM 清理临时目录
echo 清理临时目录...
rmdir /s /q "%TEMP_DIR%"

echo.
echo 🎉 所有操作完成！
pause