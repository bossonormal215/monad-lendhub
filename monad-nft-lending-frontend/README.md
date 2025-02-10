# 🏦 Monad NFT Lending Protocol

**A decentralized NFT-backed lending and borrowing platform on Monad.**  
Users can collateralize whitelisted NFTs to borrow USDT, while liquidity providers can deposit USDT to earn rewards.

---

## 🌟 Features

- 🏦 **USDT Liquidity Pool** – Users can deposit USDT to provide liquidity and earn points.
- 🎭 **NFT Collateralized Loans** – Borrow USDT by depositing whitelisted NFTs as collateral.
- 💸 **Automated Liquidation** – Collateralized NFTs are liquidated when below the required threshold.
- 🔗 **Smart Contract-Based** – Built on **Monad Devnet** using Solidity and Hardhat.
- 🌍 **User-Friendly Interface** – Next.js frontend with **Thirdweb Wallet Connect**.

---

## 🚀 Getting Started

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/monad-nft-lending.git
cd monad-nft-lending
```

2️⃣ Install Dependencies

```sh
npm install
```

## 📦 Smart Contracts (Hardhat)

### 1️⃣ Install Hardhat Dependencies

```sh
cd contracts
npm install
```

### 2️⃣ Compile Contracts

```sh
npx hardhat compile
```

### 3️⃣ Deploy Contracts to Monad Devnet

```sh
npx hardhat run scripts/deploy.js --network monad
```

# 🎨 Frontend (Next.js + Tailwind CSS + Thirdweb)

### 1️⃣ Navigate to Frontend Directory

```sh
cd frontend
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Set Up Environment Variables

Create a .env.local file in the frontend directory:

```sh
NEXT_PUBLIC_MONAD_RPC="https://your-monad-devnet-rpc-url.com"
NEXT_PUBLIC_USDT_CONTRACT="0xYourMockUSDTAddress"
NEXT_PUBLIC_NFT_VAULT_CONTRACT="0xYourNFTVaultAddress"
NEXT_PUBLIC_LOAN_MANAGER_CONTRACT="0xYourLoanManagerAddress"
NEXT_PUBLIC_LIQUIDATION_MANAGER_CONTRACT="0xYourLiquidationManagerAddress"
NEXT_PUBLIC_LIQUIDITY_POOL_CONTRACT="0xYourLiquidityPoolAddress"
```

### 4️⃣ Run Next.js App

```sh
npm run dev
```

Open http://localhost:3000 in your browser.

## 🏗️ Project Structure

```markdown
monad-nft-lending
│── contracts/ # Solidity smart contracts (Hardhat)
│── frontend/ # Next.js frontend with Tailwind CSS
│── scripts/ # Deployment and automation scripts
│── test/ # Test cases for smart contracts
│── README.md # Project documentation
│── hardhat.config.js # Hardhat configuration
│── package.json # Dependencies and scripts
```

## 🔮 Future Improvements

- ✅ Pyth Oracle Integration for NFT price tracking.
- 🔥 Improved Liquidation Monitoring with real-time price updates.
- 📊 Advanced Dashboard to track borrowed amounts and interest.
- 🎭 Better NFT Selection UI for collateral management.

## 🤝 Contributing

Contributions are welcome! Fork the repo, make changes, and submit a pull request.

## 📜 License

MIT License

## 🌐 Connect With Us

- **Twitter**: @
- **Discord**: Discord Community

## 🚀 Let's revolutionize NFT-backed lending on Monad!

```yaml
---
### **🔹 What This README Covers:**
✅ **Project Overview**
✅ **How to Set Up and Run Smart Contracts (Hardhat)**
✅ **How to Run the Next.js Frontend**
✅ **Environment Variables**
✅ **Project Roadmap & Future Features**
✅ **Contribution Guidelines**

Let me know if you want any modifications! 🚀
```
