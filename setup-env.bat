@echo off
REM OdysseyJS Environment Setup Script for Windows
echo 🚀 Setting up OdysseyJS environment...

REM Check if .env already exists
if exist ".env" (
    echo ⚠️  .env file already exists. Backing up to .env.backup
    copy .env .env.backup
)

REM Copy the example file
if exist ".env.example" (
    copy .env.example .env
    echo ✅ Created .env file from .env.example
) else (
    echo ❌ .env.example file not found!
    echo    Please ensure you're running this script from the odysseyjs root directory
    pause
    exit /b 1
)

echo.
echo 📝 Please edit the .env file with your specific values:
echo    - Set your node IP address
echo    - Set your private key (without 0x prefix)
echo    - Set your wallet addresses
echo    - Set your validator node ID (if applicable)
echo.
echo 🔧 You can edit the file with:
echo    - notepad .env
echo    - code .env (VS Code)
echo    - Any text editor of your choice
echo.
echo ⚠️  Remember: Never commit your .env file to version control!
echo.
echo 🎯 After editing, you can run example scripts like:
echo    npx ts-node ./examples/delta/buildExportTx-ochain.ts
echo.
echo 💡 Troubleshooting:
echo    - For Docker nodes, ensure the node is accessible from your host
echo    - If scripts fail, try running in WSL or Git Bash
echo    - Check that your node is running and accessible
pause 