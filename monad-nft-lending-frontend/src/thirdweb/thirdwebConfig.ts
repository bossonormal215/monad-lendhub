// import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { useContract } from '@thirdweb-dev/react';
import { NFTCollateralVaultABI } from '../contracts/interfaces/NFTCollateralVault';
import { LoanManagerABI } from '../contracts/interfaces/LoanManager';
import { LiquidationManagerABI } from '../contracts/interfaces/LiquidationManager';
import { USDTLiquidityPoolABI } from '../contracts/interfaces/USDTLiquidityPool';
import { MockUsdtABI } from '../contracts/interfaces/mocUsdt';

export const MONAD_RPC =
  'https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a'; // Replace with actual Monad Devnet RPC
// export const USDT_CONTRACT = '0x3B969Ebe8739CEd48C1234d565C0f58e7746479c'; // 1
// export const USDT_CONTRACT = '0x4a4Fa63D7E00462E38a396DdA61Ba4C674179d28'; // 2
export const USDT_CONTRACT = '0x4C8f1E9eb705c33a693A5A2d18220637EbE74F61'; // 3
// export const NFT_VAULT_CONTRACT = '0x8d53c0d21551904ed6d167d922cAcE61D00eBd14'; // 1
// export const NFT_VAULT_CONTRACT = '0x287087C0A4C6a9eAAc92A0ffd9e96F78439Dd4C8'; // 2
export const NFT_VAULT_CONTRACT = '0x0D6aD3Ab724a5Cf961282D1b5f66D6194759b124'; // 3
// export const LOAN_MANAGER_CONTRACT ='0xaA527f6593c9017765BBda51ed2fbaA1447bC2be'; // 1
// export const LOAN_MANAGER_CONTRACT ='0x65CaF5eAC8238530Be190D37EcFDD406972d8CB5'; // 2
export const LOAN_MANAGER_CONTRACT =
  '0x5354EdCd4C1E747435fB2d2ca55057e2739aB126'; // 3
// export const LIQUIDATION_MANAGER_CONTRACT ='0x1cf2d437be68bCC64c2AD7f232B293210EE139d1'; // 1
// export const LIQUIDATION_MANAGER_CONTRACT = '0x8D3F45B494C6b3ed8796A072C6F401b9Bfcb8F3C'; // 2
export const LIQUIDATION_MANAGER_CONTRACT =
  '0xb49d0a57983A737C53c20071BCAD63F01a97FACb'; // 3
// export const LIQUIDITY_POOL_CONTRACT = '0x3F1425279513195Be8a3494b1d11298B75fda818'; // 1
// export const LIQUIDITY_POOL_CONTRACT ='0xF37455E895e4832D4Bb6c7D5e0ce36A6D4739950'; // 2
export const LIQUIDITY_POOL_CONTRACT =
  '0x112254e7b9b32AEb6258159C8097Dd430c18A7d2'; // 3

// Remove the static SDK initialization
// export const sdk = new ThirdwebSDK(MONAD_RPC);

export function useContracts() {
  const { contract: usdt } = useContract(USDT_CONTRACT, MockUsdtABI.abi);
  const { contract: nftVault } = useContract(
    NFT_VAULT_CONTRACT,
    NFTCollateralVaultABI.abi
  );
  const { contract: loanManager } = useContract(
    LOAN_MANAGER_CONTRACT,
    LoanManagerABI.abi
  );
  const { contract: liquidationManager } = useContract(
    LIQUIDATION_MANAGER_CONTRACT,
    LiquidationManagerABI.abi
  );
  const { contract: liquidityPool } = useContract(
    LIQUIDITY_POOL_CONTRACT,
    USDTLiquidityPoolABI.abi
  );

  return { usdt, nftVault, loanManager, liquidationManager, liquidityPool };
}

//
/* loanmanger.tsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract, useAddress } from '@thirdweb-dev/react';
import { USDT_CONTRACT, LOAN_MANAGER_CONTRACT, LIQUIDITY_POOL_CONTRACT } from '../thirdweb/thirdwebConfig';

interface BorrowFormProps {
    collateralId: number | null;
    maxLoanAmount: string;
    onBorrow: (collateralId: number, amount: string) => Promise<void>;
    isLoading: boolean;
}

export function BorrowForm({ collateralId, maxLoanAmount, onBorrow, isLoading }: BorrowFormProps) {
    const [error, setError] = useState<string>('');
    const address = useAddress();
    const { contract: loanManager } = useContract(LOAN_MANAGER_CONTRACT);

    const handleSubmit = async () => {
        if (!loanManager || !collateralId || !maxLoanAmount) {
            setError("Invalid parameters");
            return;
        }

        try {
            console.log("Initiating borrow with:", {
                collateralId,
                maxLoanAmount
            });

            const tx = await loanManager.call(
                "issueLoan",
                [
                    collateralId,
                    ethers.utils.parseEther(maxLoanAmount)
                ]
            );

            console.log("Borrow transaction:", tx);
            onBorrow(collateralId, maxLoanAmount);
        } catch (error: any) {
            console.error("Borrow failed:", error);
            setError(error.message || "Failed to borrow");
        }
    };

    return (
        <div>
            {!collateralId ? (
                <p className="text-sm text-gray-400">Deposit an NFT to enable borrowing</p>
            ) : (
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !!error}
                    className={`w-full py-3 px-6 rounded-lg text-lg font-medium ${isLoading || !!error
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                        } text-white transition-colors`}
                >
                    Borrow USDT
                </button>
            )}
            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
} 
    */
