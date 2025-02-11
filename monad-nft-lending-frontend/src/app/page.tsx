"use client"
import { ThirdwebProvider, ConnectWallet, useAddress, useNetworkMismatch, useSwitchChain, useSDK } from "@thirdweb-dev/react";
import { embeddedWallet, metamaskWallet, zerionWallet, coinbaseWallet, walletConnect, rabbyWallet, rainbowWallet } from "@thirdweb-dev/react";
// import { ThirdwebProvider } from "thirdweb/react";
// import { MONAD_DEVNET_CONFIG } from "../config/config";
// import { client } from "../components/client";
// import { client } from "../components/client";
// import { ConnectButton } from "thirdweb/react";
// import { Sepolia } from "@thirdweb-dev/chains";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useContracts } from "../thirdweb/thirdwebConfig";
import { NFT_VAULT_CONTRACT } from "../thirdweb/thirdwebConfig";
// import { sdk } from "../thirdweb/thirdwebConfig";
// import { USDT_CONTRACT, NFT_VAULT_CONTRACT, LOAN_MANAGER_CONTRACT, LIQUIDATION_MANAGER_CONTRACT } from "../thirdweb/thirdwebConfig";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WhitelistedNFTs } from '../components/WhitelistedNFTs';
import { BorrowForm } from '../components/BorrowForm';
import { LiquidityProvider } from '../components/LiquidityProvider';
import { LoanManager } from '../components/LoanManager';
import MintDMONPage from '../app/mintdmon/page'

// const activeChainId = parseInt(MONAD_DEVNET_CONFIG.chainId, 16);
const activeChain = {
  chainId: 20143, // Replace with actual monad devnet chain ID
  rpc: ['https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a'],
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
// const queryClient = new QueryClient();

// function App() {
function App() {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      supportedChains={[activeChain]}
      autoSwitch={true}

      supportedWallets={[
        embeddedWallet(),
        metamaskWallet(),
        zerionWallet(),
        coinbaseWallet(),
        walletConnect(),
        rabbyWallet(),
        rainbowWallet()
      ]}
    >
      <Main />
      <MintDMONPage />
      
    </ThirdwebProvider>


  );
}

function Main() {
  const address = useAddress();
  const isWrongNetwork = useNetworkMismatch();
  const switchNetwork = useSwitchChain();
  const sdk = useSDK();
  const { usdt, nftVault, loanManager, liquidationManager } = useContracts();
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollateralId, setSelectedCollateralId] = useState<number | null>(null);
  const [maxLoanAmount, setMaxLoanAmount] = useState<string>('');
  const [userCollaterals, setUserCollaterals] = useState<any[]>([]);

  useEffect(() => {
    if (isWrongNetwork) {
      alert("Please switch your wallet to Monad Devnet.");
      switchNetwork(activeChain.chainId);
    }
  }, [isWrongNetwork, switchNetwork]);

  useEffect(() => {
    if (address && nftVault) {
      fetchUserCollaterals();
    }
  }, [address, nftVault]);

  const fetchUserCollaterals = async () => {
    if (!nftVault || !address) return;

    try {
      console.log("Fetching collaterals for address:", address);

      const collateralsData = await nftVault.call(
        "getUserCollaterals",
        [address]
      );
      console.log("Raw collaterals data:", collateralsData);

      if (collateralsData) {
        const [
          collateralIds,
          nftAddresses,
          tokenIds,
          maxLoanAmounts,
          currentLoanAmounts,
          activeStates
        ] = collateralsData;

        const formattedCollaterals = collateralIds.map((id: any, index: number) => ({
          id: Number(id),
          nftAddress: nftAddresses[index],
          tokenId: Number(tokenIds[index]),
          maxLoanAmount: maxLoanAmounts[index],
          currentLoanAmount: currentLoanAmounts[index],
          isActive: activeStates[index]
        }));

        console.log("Formatted collaterals:", formattedCollaterals);
        setUserCollaterals(formattedCollaterals);

        if (formattedCollaterals.length > 0) {
          const activeCollateral = formattedCollaterals[0];
          setSelectedCollateralId(activeCollateral.id);
          setMaxLoanAmount(ethers.utils.formatEther(activeCollateral.maxLoanAmount));
        }
      }
    } catch (error) {
      console.error("Error fetching user collaterals:", error);
    }
  };

  const handleNFTDeposit = async (nftAddress: string, tokenId: string, maxAmount: number) => {
    if (!sdk || !nftVault || !address) {
      setStatus("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setStatus("Processing...");

    try {
      const nftContract = await sdk.getContract(nftAddress);

      // Check approval
      const isApproved = await nftContract.call(
        "isApprovedForAll",
        [address, NFT_VAULT_CONTRACT]
      );

      if (!isApproved) {
        setStatus("Approving NFT transfer...");
        const approveTx = await nftContract.call(
          "setApprovalForAll",
          [NFT_VAULT_CONTRACT, true]
        );
        setStatus("NFT transfer approved!");
      }

      // Deposit NFT
      setStatus("Depositing NFT...");
      try {
        const tx = await nftVault.call(
          "depositNFT",
          [
            nftAddress,
            Number(tokenId),
            ethers.utils.parseEther(maxAmount.toString())
          ]
        );

        console.log("Full transaction response:", tx);

        if (typeof tx === 'object' && tx.receipt) {
          const events = tx.receipt.events;
          console.log("Transaction events:", events);

          // Try different ways to get collateralId
          let collateralId;

          // Method 1: Try to get from NFTDeposited event
          const depositEvent = events?.find((e: any) => e.event === "NFTDeposited" || e.eventName === "NFTDeposited");
          if (depositEvent) {
            console.log("Found NFTDeposited event:", depositEvent);
            collateralId = depositEvent.args?.collateralId || depositEvent.args?.[0];
          }

          // Method 2: If no event found, try to get from first event's args
          if (!collateralId && events && events.length > 0) {
            console.log("Checking first event:", events[0]);
            collateralId = events[0].args?.collateralId || events[0].args?.[0];
          }

          // Method 3: Fallback to getting latest collateral ID
          if (!collateralId) {
            console.log("Getting latest collateral ID");
            collateralId = await nftVault.call("getLatestCollateralId");
          }

          // Convert BigNumber to number if needed
          if (typeof collateralId === 'object' && collateralId._hex) {
            collateralId = Number(collateralId._hex);
          }

          console.log("Final Collateral ID:", collateralId);

          if (collateralId) {
            setSelectedCollateralId(Number(collateralId));
            setMaxLoanAmount(maxAmount.toString());
            setStatus("NFT successfully deposited! 🎉");
          } else {
            throw new Error("Failed to get collateral ID");
          }
        }

        // Refresh user's collaterals after successful deposit
        await fetchUserCollaterals();
      } catch (depositError: any) {
        console.error("Deposit failed:", depositError);
        setStatus(`Deposit failed: ${depositError.message || "Unknown error"}`);
        throw depositError;
      }

    } catch (error: any) {
      console.error("Error:", error);
      setStatus(`Error: ${error.message || "Transaction failed"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async (collateralId: number, amount: string) => {
    if (!loanManager || !address) {
      setStatus("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setStatus("Processing borrow request...");

    try {
      const tx = await loanManager.call(
        "issueLoan",
        [
          collateralId,
          ethers.utils.parseEther(amount)
        ]
      );

      if (typeof tx === 'object' && tx.receipt) {
        console.log("Borrow transaction hash:", tx.receipt.transactionHash);
      }

      setStatus("Loan successfully issued! 🎉");
    } catch (error: any) {
      console.error("Borrow failed:", error);
      setStatus(`Borrow failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepayLoan = async (loanId: number) => {
    if (!loanManager || !address) {
      setStatus("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setStatus("Processing loan repayment...");

    try {
      const tx = await loanManager.call(
        "repayLoan",
        [loanId]
      );

      if (typeof tx === 'object' && tx.receipt) {
        console.log("Repay transaction hash:", tx.receipt.transactionHash);
      }

      setStatus("Loan successfully repaid! 🎉");
    } catch (error: any) {
      console.error("Repay failed:", error);
      setStatus(`Repay failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLiquidate = async (collateralId: number) => {
    if (!liquidationManager || !address) {
      setStatus("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setStatus("Processing liquidation...");

    try {
      const tx = await liquidationManager.call(
        "liquidate",
        [collateralId]
      );

      if (typeof tx === 'object' && tx.receipt) {
        console.log("Liquidation transaction hash:", tx.receipt.transactionHash);
      }

      setStatus("Collateral successfully liquidated! 🎉");
    } catch (error: any) {
      console.error("Liquidation failed:", error);
      setStatus(`Liquidation failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNFTWithdrawn = async (collateralId: number) => {
    // Refresh user's collaterals
    await fetchUserCollaterals();
    // Reset selected collateral
    setSelectedCollateralId(null);
    setMaxLoanAmount('0');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Monad NFT Lending</h1>
      <ConnectWallet modalTitle="Connect Your Wallet" modalSize="wide" />

      {address && (
        <div className="w-full max-w-4xl space-y-6">
          {/* Debug Info */}
          <div className="p-4 bg-gray-800 rounded-lg mt-4">
            <h3 className="text-lg font-medium mb-3">Debug Info</h3>
            <div className="space-y-2 text-sm">
              <p>Connected Address: {address || 'Not connected'}</p>
              <p>Selected Collateral ID: {selectedCollateralId || 'None'}</p>
              <p>Max Loan Amount: {maxLoanAmount || '0'} USDT</p>
              <p>User Collaterals: {userCollaterals.length}</p>
              <p>Contracts Loaded: {
                `NFTVault: ${!!nftVault}, ` +
                `LoanManager: ${!!loanManager}, ` +
                `LiquidationManager: ${!!liquidationManager}`
              }</p>
            </div>
          </div>

          {/* Debug Controls */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Debug Controls</h3>
            <button
              onClick={() => {
                // Simulate having a collateral
                const testCollateral = {
                  id: 1,
                  maxLoanAmount: ethers.utils.parseEther("1000")
                };
                setUserCollaterals([testCollateral]);
                setSelectedCollateralId(testCollateral.id);
                setMaxLoanAmount("1000");
              }}
              className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
            >
              Simulate Collateral
            </button>
          </div>

          {/* Collateral Selection (if user has multiple collaterals) */}
          {userCollaterals.length > 0 && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Your Collaterals</h3>
              <div className="space-y-2">
                {userCollaterals.map((collateral: any) => (
                  <div
                    key={collateral.id}
                    className={`p-3 rounded-lg cursor-pointer ${selectedCollateralId === Number(collateral.id)
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    onClick={() => {
                      setSelectedCollateralId(Number(collateral.id));
                      setMaxLoanAmount(ethers.utils.formatEther(collateral.maxLoanAmount));
                    }}
                  >
                    <p className="text-sm">Collateral ID: {collateral.id}</p>
                    <p className="text-sm">Max Loan: {ethers.utils.formatEther(collateral.maxLoanAmount)} USDT</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liquidity Management Section */}
          <section>
            <LiquidityProvider />
          </section>

          {/* NFT Collateral Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">NFT Collateral</h2>
            <WhitelistedNFTs
              onNFTDeposit={handleNFTDeposit}
              isLoading={isLoading}
            />
          </section>

          {/* Loan Operations Section */}
          {userCollaterals.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <BorrowForm
                    collateralId={selectedCollateralId}
                    maxLoanAmount={maxLoanAmount}
                    onBorrow={handleBorrow}
                    isLoading={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <LoanManager
                    collateralId={selectedCollateralId}
                    maxLoanAmount={maxLoanAmount}
                    onNFTWithdrawn={handleNFTWithdrawn}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Status Messages */}
          {status && (
            <p className="mt-4 text-sm text-gray-300 text-center">{status}</p>
          )}
        </div>
      )}

      

    </div>
  );
}

export default App;
