# MonadLendHub

A decentralized NFT-collateralized lending protocol built on Monad Network, enabling users to borrow USDT against their NFT collateral.

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

## Getting Started

### Prerequisites
- Node.js 16+
- Yarn or npm
- MetaMask or compatible Web3 wallet

### Installation

### Clone the repository
```bash
git clone https://github.com/bossonormal215/monad-nft-lending
```

### Install dependencies
```bash
cd monad-nft-lending
yarn install
```

### Run the development server
```bash
yarn dev
```


### Configuration
-  Create a `.env.local` file
-  Add required environment variables:
### env
- NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
- NEXT_PUBLIC_THIRDWEB_SECRET_KEY=your_secret_key


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
