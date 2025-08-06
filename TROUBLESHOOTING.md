# OdysseyJS Troubleshooting Guide

## Common Issues and Solutions

### 1. Build Issues

#### TypeScript Compilation Error
**Error:** `This is not the tsc command you are looking for`

**Solution:**
```bash
# Install TypeScript globally
npm install -g typescript
# or
yarn global add typescript

# Then try building again
npm run build
# or
yarn build
```

**Alternative Solution:**
```bash
# Use npx with explicit TypeScript installation
npx tsc --version
npm run build
```

### 2. Setup Script Issues

#### Windows PowerShell Issues
**Problem:** Script opens in editor instead of executing

**Solution:**
```cmd
# Use the Windows batch file instead
setup-env.bat
```

#### WSL Line Ending Issues
**Error:** `-bash: ./setup-env.sh: /bin/bash^M: bad interpreter: No such file or directory`

**Solution:**
```bash
# Fix line endings
dos2unix setup-env.sh
chmod +x setup-env.sh
./setup-env.sh
```

#### File Not Found Error
**Error:** `cp: cannot stat 'env.example': No such file or directory`

**Solution:**
```bash
# The correct file name is .env.example (with dot)
cp .env.example .env
```

### 3. Node Connectivity Issues

#### Docker Node Access
**Problem:** Scripts fail when connecting to Docker-based nodes

**Solutions:**
1. **Check Docker Port Mapping:**
   ```bash
   # Ensure port 9650 is mapped to host
   docker ps
   # Should show something like: 0.0.0.0:9650->9650/tcp
   ```

2. **Test Node Connectivity:**
   ```bash
   # Test basic connectivity
   curl http://127.0.0.1:9650/ext/info
   # or for Docker
   curl http://localhost:9650/ext/info
   ```

3. **Check Network Configuration:**
   ```bash
   # Verify your .env file has correct settings
   cat .env
   ```

#### Private Node Issues
**Problem:** Scripts fail on private nodes

**Solutions:**
1. **Add Authentication:**
   ```bash
   # In your .env file, add:
   PASSWORD=your_password
   TOKEN=your_token
   USER=your_username
   ```

2. **Check Node Status:**
   ```bash
   # Test if node is running and accessible
   curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkID"}' \
     http://your-node-ip:9650/ext/info
   ```

### 4. Export Script Failures

#### Common Causes:
1. **Insufficient Balance:** Ensure you have enough funds in the source chain
2. **Node Not Synced:** Wait for the node to fully sync
3. **Wrong Network ID:** Verify NETWORK_ID matches your node configuration
4. **Port Issues:** Check if the correct ports are accessible

#### Debugging Steps:
```bash
# 1. Check your balance
npx ts-node ./examples/alpha/getBalance.ts

# 2. Test basic connectivity
npx ts-node ./examples/info/getNetworkID.ts

# 3. Check transaction status
npx ts-node ./examples/alpha/getTxStatus.ts
```

### 5. Validator Setup Issues

#### Wrong Command
**Error:** `bash: odyssey-installer.sh: No such file or directory`

**Solution:** The correct command is:
```bash
# Use the correct installer script
./odysseygo-installer.sh --version develop --testnet
```

**Note:** The validator setup scripts are in the separate `odysseygo-installer` repository, not in this `odysseyjs` repository.

### 6. Environment Configuration

#### Recommended .env Configuration
```bash
# Odyssey Node Configuration
IP=127.0.0.1
PORT=9650
PROTOCOL=http
NETWORK_ID=5  # 5 for testnet, 1 for mainnet

# For Docker nodes
# IP=localhost
# PORT=9650
# PROTOCOL=http

# Transaction-specific variables
PRIVATE_KEY=your_private_key_without_0x_prefix
WALLET_ADDRESS=your_ethereum_style_wallet_address
REWARD_ADDRESS=your_ochain_reward_address
NODE_ID=NodeID-your_node_id_here
DELEGATION_FEE=2

# For private nodes (if needed)
# PASSWORD=your_password
# TOKEN=your_token
# USER=your_username
```

### 7. Platform-Specific Issues

#### Windows
- Use `setup-env.bat` instead of `setup-env.sh`
- Use Git Bash or WSL for bash scripts
- Ensure proper line endings (CRLF vs LF)

#### macOS
- Use `./setup-env.sh` directly
- Ensure execute permissions: `chmod +x setup-env.sh`

#### Linux/WSL
- Use `./setup-env.sh` directly
- Fix line endings if needed: `dos2unix setup-env.sh`

### 8. Getting Help

If you're still experiencing issues:

1. **Check the logs:** Look for specific error messages
2. **Verify your setup:** Ensure all dependencies are installed
3. **Test connectivity:** Use the basic examples first
4. **Check documentation:** Review the README.md and examples
5. **Report issues:** Include your environment details and error messages

### 9. Quick Diagnostic Commands

```bash
# Check TypeScript installation
npx tsc --version

# Check Node.js version
node --version

# Test basic connectivity
curl http://127.0.0.1:9650/ext/info

# Check if .env file exists and is readable
ls -la .env

# Test a simple example
npx ts-node ./examples/info/getNetworkID.ts
``` 