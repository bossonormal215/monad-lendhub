# Monad NFT Lending Platform

A decentralized NFT-collateralized lending protocol built on Monad.

## Team Members
- Chukwunonso Ikeji (@Codypharm)
- Stephen Nwankwo (@Melchizedek30)
- Ibukun Olatunde (@adonormal)

## Features
- NFT Collateral Deposits
- USDT Borrowing
- Liquidity Provision
- Loan Management
- Liquidation System
- Admin Controls

## Getting Started

### Prerequisites
- Node.js
- Yarn
- Monad Devnet Access

### Installation
```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_MONAD_RPC=https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a
```

## Project Structure
```
src/
├── app/                    # Next.js app directory
├── components/             # React components
├── contracts/             # Contract interfaces
├── thirdweb/             # ThirdWeb configuration
└── app/whitelistNFTs/    # NFT whitelist configuration
```

## Smart Contracts
- NFT Vault: [contract address]
- Loan Manager: [contract address]
- Liquidation Manager: [contract address]
- USDT: [contract address]

## Development Workflow
1. Create feature branch
2. Implement changes
3. Test locally
4. Create pull request
5. Code review
6. Merge to main

## Testing
```bash
# Run tests
yarn test
```

## Deployment
```bash
# Build for production
yarn build

# Deploy
yarn deploy
```

## Overview

MonadLendHub is a DeFi platform that bridges the liquidity gap between NFTs and stablecoins. Users can deposit their NFTs as collateral to borrow USDT, while liquidity providers earn interest by supplying USDT to the lending pool.

## Key Features

### 1. NFT Collateralization
- Seamless NFT deposit and withdrawal
- Automated collateral value assessment
- Support for multiple NFT collections
- Real-time collateral status tracking

### 2. USDT Lending
- Borrow up to 70% of NFT's assessed value
- Flexible loan terms
- Dynamic interest rates based on pool utilization
- Automated loan processing

### 3. Liquidity Provision
- Supply USDT to earn interest
- Automated liquidity management
- Real-time APY tracking
- Instant deposits and withdrawals

### 4. Risk Management
- Automated liquidation system
- Real-time loan health monitoring
- Transparent collateral value tracking
- Smart contract-based risk parameters

## Technical Architecture

### Smart Contracts
- `NFTCollateralVault.sol`: Manages NFT deposits and withdrawals
- `LoanManager.sol`: Handles loan issuance and repayments
- `LiquidityPool.sol`: Manages USDT liquidity
- `LiquidationManager.sol`: Handles loan liquidations

### Frontend
- Built with Next.js and TypeScript
- Thirdweb SDK integration
- Real-time updates using React Query
- Responsive design with Tailwind CSS

## Usage

1. **Connect Wallet**
   - Connect your Web3 wallet
   - Switch to Monad Network

2. **Deposit NFT**
   - Select NFT from supported collections
   - Approve NFT transfer
   - Deposit as collateral

3. **Borrow USDT**
   - Choose loan amount (up to 70% LTV)
   - Review terms and interest rate
   - Confirm transaction

4. **Manage Loans**
   - Monitor loan health
   - Repay loans
   - Withdraw NFTs after repayment

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Security

- Smart contracts audited by [Audit Firm]
- Bug bounty program active
- Regular security assessments

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Discord: [Your Discord Server]
- Twitter: [@MonadLendHub]
- Email: contact@monadlendhub.com

## Acknowledgments

- Built on [Monad Network](https://monad.xyz)
- Powered by [Thirdweb](https://thirdweb.com)
