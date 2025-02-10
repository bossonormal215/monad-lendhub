# 🏗️ Monad DApp

A cross-chain ETH bridge built using **Hardhat, Solidity, Pyth Oracle, and a Relayer Service**. This project enables users to transfer ETH between **Ethereum Sepolia, Arbitrum Sepolia, and Base Sepolia** testnets with the help of an automated relayer.

## 🚀 Features

- **Deposit & Withdraw ETH Across Chains**
- **Uses Pyth Oracle** for price verification
- **Automated Relayer Service** for processing transactions
- **Secure & Scalable Architecture**
- **Next.js Frontend for User Interaction**

## 📂 Project Structure

```markdown
monad-bridge
├── contracts # Solidity smart contracts
├── scripts # Hardhat deployment scripts
├── relayer # Node.js relayer service
├── frontend # Next.js frontend
├── hardhat.config.js # Hardhat configuration
├── relayer.js # Relayer event listener
└── README.md # Project documentation
```

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/bossonormal215/monad-dapp-test
cd monad-bridge
```

### 2️⃣ Install Dependencies

```shellscript
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```plaintext
PRIVATE_KEY=your_wallet_private_key
ETH_SEPOLIA_RPC=https://sepolia.infura.io/v3/your_project_id
ARB_SEPOLIA_RPC=https://arb-sepolia.alchemy.com/v2/your_project_id
BASE_SEPOLIA_RPC=https://base-sepolia.infura.io/v3/your_project_id
MONAD_RPC=https://monad-rpc-url
PYTH_ORACLE_ETHEREUM_SEPOLIA=0xYourEthereumSepoliaOracleAddress
PYTH_ORACLE_ARBITRUM_SEPOLIA=0xYourArbitrumSepoliaOracleAddress
PYTH_ORACLE_BASE_SEPOLIA=0xYourBaseSepoliaOracleAddress
PYTH_ORACLE_MONAD_TESTNET=0xYourMonadTestnetOracleAddress
```

### 4️⃣ Deploy Smart Contract

```shellscript
npx hardhat run scripts/deploy.js --network sepolia
```

Repeat for Arbitrum Sepolia and Base Sepolia networks.

### 5️⃣ Start Relayer Service

```shellscript
node relayer.js
```

### 6️⃣ Run Next.js Frontend

```shellscript
cd frontend
npm run dev
```

## 🎮 Usage

### Deposit ETH

1. **Connect Wallet** in the frontend.
2. **Enter the amount** and select a destination chain.
3. **Click "Bridge ETH"** to send the deposit transaction.
4. The **relayer detects the deposit event** and processes withdrawal on the destination chain.

### Withdraw ETH

- The relayer **automatically processes withdrawals** after confirming the deposit.

## 🔍 Architecture

### 1️⃣ Smart Contract (Solidity)

- Handles **deposits and withdrawals**
- Uses **Pyth Oracle** to fetch ETH price
- Emits **Deposit events** for the relayer

### 2️⃣ Relayer (Node.js + Ethers.js)

- Listens for **deposit events**
- Transfers ETH from **liquidity pool** on the destination chain
- Calls **withdraw function** on the smart contract

### 3️⃣ Frontend (Next.js + Ethers.js)

- Provides a **simple UI** for users to bridge ETH
- Interacts with the **smart contract**
- Shows **transaction status**

## 🛡️ Security Considerations

- **Liquidity Management:** Ensure the relayer always has enough ETH.
- **Oracle Verification:** Verify **Pyth Oracle prices** to prevent manipulation.
- **Relayer Safety:** Secure the private key of the relayer.

## 🚀 Future Improvements

- Add **more chains** (e.g., Optimism, ZkSync)
- Implement **slippage protection** for bridging fees
- Introduce **bridging fees** for sustainability
- Enhance **UI/UX with transaction history**

## 🤝 Contributing

Want to improve this bridge? Feel free to **fork, improve, and create a PR**!

```shellscript
git checkout -b feature-branch
git commit -m "Added new feature"
git push origin feature-branch
```

## 📜 License

This project is **MIT Licensed**. Feel free to use and modify it.

## 🛠️ Built With

- **Solidity** - Smart contract development
- **Hardhat** - Ethereum development framework
- **Next.js** - Frontend framework
- **Ethers.js** - Ethereum interaction library
- **Pyth Oracle** - Price feeds

---

### ✨ Made with ❤️ by bossonormal
