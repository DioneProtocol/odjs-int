# Changelog

## [Unreleased] - Environment Variable Cleanup

### Added
- `env.example` file with comprehensive environment variable templates
- `setup-env.sh` script for easy environment setup
- Environment setup documentation in README.md
- Added `.env` files to `.gitignore` for security

### Changed
- **examples/delta/buildExportTx-ochain.ts**: 
  - Replaced hardcoded private key with `PRIVATE_KEY` environment variable
  - Replaced hardcoded wallet address with `WALLET_ADDRESS` environment variable
  - Updated environment variable names to use standard format
- **examples/omegavm/buildImportTx-DChain.ts**:
  - Replaced hardcoded private key with `PRIVATE_KEY` environment variable
  - Updated environment variable names to use standard format
- **examples/omegavm/buildAddValidatorTx.ts**:
  - Replaced hardcoded private key with `PRIVATE_KEY` environment variable
  - Replaced hardcoded reward address with `REWARD_ADDRESS` environment variable
  - Replaced hardcoded node ID with `NODE_ID` environment variable
  - Added `DELEGATION_FEE` environment variable
  - Updated environment variable names to use standard format
- **examples/alpha/buildImportTx-dchain.ts**:
  - Updated environment variable names to use standard format

### Environment Variables
The following environment variables are now supported:

#### Core Configuration
- `IP`: Odyssey node IP address
- `PORT`: Odyssey node port (default: 9650)
- `PROTOCOL`: Connection protocol (http/https)
- `NETWORK_ID`: Network identifier (1=mainnet, 5=testnet)

#### Transaction-specific
- `PRIVATE_KEY`: Private key without 0x prefix
- `WALLET_ADDRESS`: Ethereum-style wallet address
- `REWARD_ADDRESS`: O-Chain reward address
- `NODE_ID`: Validator node ID
- `DELEGATION_FEE`: Validator commission percentage

#### Legacy Support
- `TEST_IP`, `ODYSSEY_PORT`, `TEST_NETWORK_ID`: Backward compatibility

### Security
- All hardcoded private keys and addresses have been removed
- Environment variables are properly documented
- `.env` files are excluded from version control
- Clear security warnings added to documentation

### Migration Guide
1. Copy `env.example` to `.env`
2. Fill in your specific values
3. Update any scripts that were using hardcoded values
4. Test with simple examples before running complex transactions 