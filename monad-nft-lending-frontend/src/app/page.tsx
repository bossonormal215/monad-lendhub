"use client"
import {  ThirdwebProvider, ConnectWallet, useAddress, useNetworkMismatch, useSwitchChain } from "@thirdweb-dev/react";
import { embeddedWallet, metamaskWallet, zerionWallet, coinbaseWallet, walletConnect, rabbyWallet, rainbowWallet } from "@thirdweb-dev/react";
// import { ThirdwebProvider } from "thirdweb/react";
import { MONAD_DEVNET_CONFIG } from "../config/config";
// import { client } from "../components/client";
import { client } from "../components/client";
import { ConnectButton } from "thirdweb/react";
import { Sepolia } from "@thirdweb-dev/chains";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useContracts } from "../thirdweb/thirdwebConfig";
import { USDT_CONTRACT, NFT_VAULT_CONTRACT, LOAN_MANAGER_CONTRACT, LIQUIDATION_MANAGER_CONTRACT } from "../thirdweb/thirdwebConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// const activeChainId = parseInt(MONAD_DEVNET_CONFIG.chainId, 16);
const activeChain = {
  chainId: 20143, // Replace with actual monad devnet chain ID
  rpc: ['https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a', "rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a"],
  nativeCurrency: {
    decimals: 18,
    name: "Monad Devnet",
    symbol: "MON",
  },
  shortName: "monad",
  slug: "monad",
  testnet: true,
  chain: "monad",
  name: "Monad Devnet",
};

// Creating a QueryClient instance
const queryClient = new QueryClient();

// function App() {
function App() {
  return (
       <ThirdwebProvider 
       activeChain={activeChain}
       supportedChains={[activeChain]}
       autoSwitch={true}
       
      supportedWallets={[
        // embeddedWallet(),
        metamaskWallet(),
        zerionWallet(),
        coinbaseWallet(),
        walletConnect(),
        rabbyWallet(),
        // rainbowWallet()
      ]}
       > 
       <Main />
      </ThirdwebProvider>
    
    
  );
}

function Main() {
  const address = useAddress();
  const isWrongNetwork = useNetworkMismatch();
  const switchNetwork = useSwitchChain();
  const { usdt, nftVault, loanManager, liquidationManager } = useContracts();
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (isWrongNetwork) {
      alert("Please switch your wallet to Monad Devnet.");
      switchNetwork(activeChain.chainId);
    }
  }, [isWrongNetwork, switchNetwork]);

  async function handleDepositNFT() {
    if (!nftVault) return;
    try {
      const txn = await nftVault.call("depositNFT", [NFT_VAULT_CONTRACT, 1, ethers.utils.parseEther("100")]);
      setStatus("NFT Deposited: " + txn.hash);
    } catch (error) {
      console.error(error);
      setStatus("Error: " + error);
    }
  }

  async function handleBorrow() {
    if (!loanManager) return;
    try {
      const txn = await loanManager.call("issueLoan", [1, ethers.utils.parseEther("50")]);
      setStatus("Loan Issued: " + txn.hash);
    } catch (error) {
      console.error(error);
      setStatus("Error: " + error);
    }
  }

  async function handleRepayLoan() {
    if (!loanManager) return;
    try {
      const txn = await loanManager.call("repayLoan", [1]);
      setStatus("Loan Repaid: " + txn.hash);
    } catch (error) {
      console.error(error);
      setStatus("Error: " + error);
    }
  }

  async function handleLiquidate() {
    if (!liquidationManager) return;
    try {
      const txn = await liquidationManager.call("liquidate", [1]);
      setStatus("NFT Liquidated: " + txn.hash);
    } catch (error) {
      console.error(error);
      setStatus("Error: " + error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Monad NFT Lending</h1>
      {/* <ConnectButton client={client} /> */}
      <ConnectWallet modalTitle="Connect Your Wallet" modalSize="wide">
       
      </ConnectWallet>

      {address && (
        <div className="mt-6 space-y-4">
          <button onClick={handleDepositNFT} className="bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-700">
            Deposit NFT
          </button>
          <button onClick={handleBorrow} className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-700">
            Borrow USDT
          </button>
          <button onClick={handleRepayLoan} className="bg-yellow-500 px-6 py-2 rounded-lg hover:bg-yellow-700">
            Repay Loan
          </button>
          <button onClick={handleLiquidate} className="bg-red-500 px-6 py-2 rounded-lg hover:bg-red-700">
            Liquidate Collateral
          </button>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-300">{status}</p>
    </div>
  );
}

export default App;
