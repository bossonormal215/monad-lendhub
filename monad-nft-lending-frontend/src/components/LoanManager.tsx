import { useState, useEffect, useCallback } from 'react';
import { useContract, useAddress } from '@thirdweb-dev/react';
// import { ethers } from 'ethers';
import { LOAN_MANAGER_CONTRACT, NFT_VAULT_CONTRACT } from '../thirdweb/thirdwebConfig';
import { LoanManagerABI } from '@/contracts/interfaces/LoanManager';
import { NFTCollateralVaultABI } from '@/contracts/interfaces/NFTCollateralVault';

interface LoanManagerProps {
    collateralId: number | null;
    maxLoanAmount?: string;
    onNFTWithdrawn?: (collateralId: number) => Promise<void>;
}

export function LoanManager({
    collateralId,
    maxLoanAmount,
    onNFTWithdrawn
}: LoanManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const address = useAddress();
    const { contract: loanManager } = useContract(
        LOAN_MANAGER_CONTRACT,
        LoanManagerABI.abi
    );
    const { contract: nftVault } = useContract(
        NFT_VAULT_CONTRACT,
        NFTCollateralVaultABI.abi
    );

    const fetchLoanDetails = useCallback(async () => {
        if (!loanManager || !collateralId || !address) return;

        try {
            // console.log('Loan Manager contract: ', loanManager);
            console.log("Fetching loan details for collateral:", collateralId);

            // Get user's loans using the correct function
            const userLoansData = await loanManager.call(
                "getUserLoans",
                [address]
            );

            console.log("User loans data:", userLoansData);

            if (userLoansData) {
                const [collateralIds, amounts, timestamps, activeStates, interestAmounts] = userLoansData;

                // Find the loan for this collateral
                const index = collateralIds.findIndex((id: any) =>
                    Number(id) === collateralId
                );

                if (index !== -1 && activeStates[index]) {
                    setActiveLoan({
                        amount: amounts[index],
                        timestamp: timestamps[index],
                        interest: interestAmounts[index]
                    });
                } else {
                    setActiveLoan(null);
                }
            }
        } catch (error: any) {
            console.error("Error fetching loan details:", error);
            setError("Failed to fetch loan details");
        }
    }, [loanManager, collateralId, address]);

    useEffect(() => {
        fetchLoanDetails();
    }, [fetchLoanDetails]);

    const handleRepay = async () => {
        if (!loanManager || !collateralId || !activeLoan) return;

        setIsLoading(true);
        setError('');

        try {
            const tx = await loanManager.call(
                "repayLoan",  // Changed to repayLoan as per contract
                [collateralId]
            );
            console.log("Repay transaction:", tx);
            await fetchLoanDetails();
        } catch (error: any) {
            console.error("Repay failed:", error);
            setError(error.message || "Failed to repay loan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLiquidate = async () => {
        if (!loanManager || !collateralId || !activeLoan) return;

        setIsLoading(true);
        setError('');

        try {
            const tx = await loanManager.call(
                "liquidate",
                [collateralId]
            );
            console.log("Liquidate transaction:", tx);
            await fetchLoanDetails();
        } catch (error: any) {
            console.error("Liquidation failed:", error);
            setError(error.message || "Failed to liquidate");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdrawNFT = async () => {
        if (!nftVault || !collateralId) return;

        setIsLoading(true);
        setError('');

        try {
            console.log("Withdrawing NFT for collateral ID:", collateralId);

            // Check if there's no active loan first
            const loan = await loanManager?.call(
                "loans",
                [collateralId]
            );

            if (loan && loan.isActive) {
                setError("Cannot withdraw NFT while loan is active");
                return;
            }

            // Withdraw NFT
            const tx = await nftVault.call(
                "withdrawNFT",
                [collateralId]
            );

            console.log("Withdraw NFT transaction:", tx);
            setStatus("NFT successfully withdrawn! 🎉");

            // Refresh user's collaterals
            if (onNFTWithdrawn) {
                await onNFTWithdrawn(collateralId);
            }
        } catch (error: any) {
            console.error("Withdraw NFT failed:", error);
            setError(error.message || "Failed to withdraw NFT");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <button
                    onClick={handleRepay}
                    disabled={isLoading || !collateralId || !activeLoan}
                    className={`flex-1 py-3 px-6 rounded-lg text-lg font-medium ${isLoading || !collateralId || !activeLoan
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                        } text-white transition-colors`}
                >
                    Repay Loan
                </button>

                <button
                    onClick={handleLiquidate}
                    disabled={isLoading || !collateralId || !activeLoan}
                    className={`flex-1 py-3 px-6 rounded-lg text-lg font-medium ${isLoading || !collateralId || !activeLoan
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                        } text-white transition-colors`}
                >
                    Liquidate Collateral
                </button>
            </div>

            {/* Add Withdraw NFT button */}
            <button
                onClick={handleWithdrawNFT}
                disabled={isLoading || !collateralId || activeLoan}
                className={`w-full py-3 px-6 rounded-lg text-lg font-medium ${isLoading || !collateralId || activeLoan
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                    } text-white transition-colors`}
            >
                Withdraw NFT
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
            {status && !error && (
                <p className="mt-2 text-sm text-green-500">{status}</p>
            )}
        </div>
    );
} 