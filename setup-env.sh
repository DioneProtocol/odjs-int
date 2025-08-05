#!/bin/bash

# OdysseyJS Environment Setup Script
echo "🚀 Setting up OdysseyJS environment..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Copy the example file
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
else
    echo "❌ env.example file not found!"
    exit 1
fi

echo ""
echo "📝 Please edit the .env file with your specific values:"
echo "   - Set your node IP address"
echo "   - Set your private key (without 0x prefix)"
echo "   - Set your wallet addresses"
echo "   - Set your validator node ID (if applicable)"
echo ""
echo "🔧 You can edit the file with: nano .env"
echo "   or: vim .env"
echo "   or: code .env"
echo ""
echo "⚠️  Remember: Never commit your .env file to version control!"
echo ""
echo "🎯 After editing, you can run example scripts like:"
echo "   npx ts-node ./examples/delta/buildExportTx-ochain.ts" 