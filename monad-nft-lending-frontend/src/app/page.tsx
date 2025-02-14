"use client"
import { ThirdwebProvider, ConnectWallet, useAddress, useNetworkMismatch, useSwitchChain, useSDK, useContract } from "@thirdweb-dev/react";
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
import { DMON_NFT_CONTRACT } from '../contracts/interfaces/dmonNftAbi';
import { CollateralList } from '@/components/CollateralList';

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


    </ThirdwebProvider>


  );
}

function MintDMONPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [mintQuantity, setMintQuantity] = useState<number>(1);
  const [mintPrice, setMintPrice] = useState<string>('0');
  const [maxSupply, setMaxSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [isPresaleActive, setIsPrivateSale] = useState<boolean>(false);

  const address = useAddress();
  const { contract: dmonContract } = useContract(
    DMON_NFT_CONTRACT.address,
    DMON_NFT_CONTRACT.abi
  );

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!dmonContract) return;

      try {
        // Fetch contract information
        const [
          privateSalePrice,
          maxSupplyValue,
          currentSupply,
          privateSaleState
        ] = await Promise.all([
          dmonContract.call("WhitelistMintPrice"),
          dmonContract.call("MAX_SUPPLY"),
          dmonContract.call("totalSupply"),
          dmonContract.call("isPresaleActive")
        ]);

        setMintPrice(ethers.utils.formatEther(privateSalePrice));
        setMaxSupply(Number(maxSupplyValue));
        setTotalSupply(Number(currentSupply));
        setIsPrivateSale(privateSaleState);

      } catch (error) {
        console.error("Error fetching contract info:", error);
        setError("Failed to load NFT information");
      }
    };

    fetchContractInfo();
  }, [dmonContract]);

  const handleMint = async () => {
    if (!dmonContract || !address) {
      setError("Please connect your wallet");
      return;
    }

    if (!isPresaleActive) {
      setError("Private sale is not active");
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('Processing mint...');

    try {
      const price = ethers.utils.parseEther(mintPrice);
      const totalPrice = price.mul(mintQuantity);

      const tx = await dmonContract.call(
        "whitelistMint",
        [mintQuantity],
        { value: totalPrice }
      );

      console.log("Mint transaction:", tx);
      setStatus(`Successfully minted ${mintQuantity} DMON NFT${mintQuantity > 1 ? 's' : ''}! 🎉`);

      // Refresh total supply
      const newSupply = await dmonContract.call("totalSupply");
      setTotalSupply(Number(newSupply));

    } catch (error: any) {
      console.error("Mint failed:", error);
      // setError(error.message || "Failed to mint NFT");
      if (error.message.includes('whitelist')) {
        setError('You are not whitelisted for the presale mint.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  return (

    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">DMON NFT Mint</h1>
            <p className="text-gray-400">
              {totalSupply} / {maxSupply} Minted
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-300">Price per NFT:</p>
              <p className="text-white font-medium">{mintPrice} ETH</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-300">Quantity:</p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                  className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 text-white"
                >
                  -
                </button>
                <span className="text-white font-medium">{mintQuantity}</span>
                <button
                  onClick={() => setMintQuantity(Math.min(5, mintQuantity + 1))}
                  className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-300">Total Price:</p>
              <p className="text-white font-medium">
                {(Number(mintPrice) * mintQuantity).toFixed(3)} ETH
              </p>
            </div>

            <button
              onClick={handleMint}
              disabled={isLoading || !isPresaleActive}
              className={`w-full py-3 px-6 rounded-lg text-lg font-medium ${isLoading || !isPresaleActive
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
            >
              {isLoading ? 'Processing...' :
                !isPresaleActive ? 'Sale Not Active' :
                  'Mint DMON NFT'}
            </button>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {status && !error && (
              <p className="text-green-500 text-sm text-center">{status}</p>
            )}
          </div>
        </div>
      </div>
    </div>
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
        if (depositError.message.includes(' invalid token ID')) {
          console.log("Depsoit error( invalid token ID) :", depositError);
          setStatus('Invalid TokenID Entered')
        }
        else if (depositError.message.includes('transfer from incorrect owner')) {
          console.log('Deposit Error( transfer from incorrect owner): ', depositError.message)
          setStatus('You Are Not The Owner of the tokenId')
        }
        else {
          console.error("Deposit failed:", depositError.message);
          // setStatus(`Deposit failed: ${depositError.message || "Unknown error"}`);
          setStatus('Deposit Failed')
          // throw depositError;
        }
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
    // setStatus("Processing borrow request...");

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
      // setStatus(`Borrow failed: ${error.message || "Unknown error"}`);
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

  // Add auto-dismiss effect
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus('');
      }, 5000); // 20 seconds

      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Monad NFT Lending</h1>
          <ConnectWallet modalTitle="Connect Your Wallet" modalSize="wide" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">


        {address && (
          <>
            {/* Mint Section */}
            <section className="max-w-3xl mx-auto">
              <MintDMONPage />
            </section>
            {/* Debug Sections - Collapsible on Mobile */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <details className="bg-gray-800 rounded-lg p-4">
                <summary className="text-lg font-medium cursor-pointer">Debug Info</summary>
                <div className="mt-4 space-y-2 text-sm">
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
              </details>

              <details className="bg-gray-800 rounded-lg p-4">
                <summary className="text-lg font-medium cursor-pointer">Debug Controls</summary>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const testCollateral = {
                        id: 1,
                        maxLoanAmount: ethers.utils.parseEther("1000")
                      };
                      setUserCollaterals([testCollateral]);
                      setSelectedCollateralId(testCollateral.id);
                      setMaxLoanAmount("1000");
                    }}
                    className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600 w-full sm:w-auto"
                  >
                    Simulate Collateral
                  </button>
                </div>
              </details>
            </div> */}

            {/* Collaterals Grid */}
            {userCollaterals.length > 0 && (
              <section className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Your Collaterals</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCollaterals.map((collateral: any) => (
                    <div
                      key={collateral.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedCollateralId === Number(collateral.id)
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      onClick={() => {
                        setSelectedCollateralId(Number(collateral.id));
                        setMaxLoanAmount(ethers.utils.formatEther(collateral.maxLoanAmount));
                      }}
                    >
                      <p>Collateral ID: {collateral.id}</p>
                      <p>Max Loan: {ethers.utils.formatEther(collateral.maxLoanAmount)} USDT</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Liquidity Section */}
              <section className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Liquidity Pool</h2>
                <LiquidityProvider />
              </section>

              {/* NFT Collateral Section */}
              <section className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">NFT Collateral</h2>
                <WhitelistedNFTs
                  onNFTDeposit={handleNFTDeposit}
                  isLoading={isLoading}
                />
              </section>
            </div>

            {/* Loan Operations */}
            {userCollaterals.length > 0 && (
              <section className="bg-gray-800 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Borrow</h3>
                    <BorrowForm
                      collateralId={selectedCollateralId}
                      maxLoanAmount={maxLoanAmount}
                      onBorrow={handleBorrow}
                      isLoading={isLoading}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Loan Management</h3>
                    <LoanManager
                      collateralId={selectedCollateralId}
                      maxLoanAmount={maxLoanAmount}
                      onNFTWithdrawn={handleNFTWithdrawn}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Status Messages with Animation */}
            {status && (
              <div
                className="fixed bottom-4 right-4 max-w-md bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 animate-fade-in-out"
                style={{
                  animation: 'fadeInOut 20s ease-in-out'
                }}
              >
                <p className="text-sm">{status}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
