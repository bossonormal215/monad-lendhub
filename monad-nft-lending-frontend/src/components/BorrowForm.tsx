import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract, useAddress } from '@thirdweb-dev/react';
import { USDT_CONTRACT, LOAN_MANAGER_CONTRACT, LIQUIDITY_POOL_CONTRACT } from '../thirdweb/thirdwebConfig';
import { LoanManagerABI } from '../contracts/interfaces/LoanManager';

interface BorrowFormProps {
    collateralId: number | null;
    maxLoanAmount: string;
    onBorrow: (collateralId: number, amount: string) => Promise<void>;
    isLoading: boolean;
}

export function BorrowForm({ collateralId, maxLoanAmount, onBorrow, isLoading }: BorrowFormProps) {
    const [error, setError] = useState<string>('');
    const address = useAddress();
    const { contract: loanManager } = useContract(LOAN_MANAGER_CONTRACT, LoanManagerABI.abi);

    useEffect(() => {
        console.log("BorrowForm Props:", {
            collateralId,
            maxLoanAmount,
            isLoading
        });
    }, [collateralId, maxLoanAmount, isLoading]);

    const handleSubmit = async () => {
        console.log("Validating parameters:", {
            loanManager: !!loanManager,
            collateralId,
            maxLoanAmount,
            address
        });

        if (!loanManager) {
            setError("Loan manager contract not initialized");
            return;
        }

        if (!collateralId) {
            setError("No collateral ID selected");
            return;
        }

        if (!maxLoanAmount || maxLoanAmount === '0') {
            setError("Invalid loan amount");
            return;
        }

        if (!address) {
            setError("Please connect your wallet");
            return;
        }

        try {
            // Check if loan exists first
            console.log("Checking existing loan for collateral:", collateralId);

            try {
                const loan = await loanManager.call(
                    "loans",
                    [collateralId]
                );

                console.log("Existing loan data:", loan);

                // Check loan status
                if (loan && loan.isActive) {
                    setError("A loan already exists for this collateral");
                    return;
                }
            } catch (error) {
                console.log("Error checking loan status:", error);
            }

            const amount = ethers.utils.parseEther(maxLoanAmount);
            console.log("Parameters validated, proceeding with borrow:", {
                collateralId,
                maxLoanAmount,
                parsedAmount: amount.toString(),
                userAddress: address,
                loanManagerAddress: await loanManager.getAddress()
            });

            const tx = await loanManager.call(
                "issueLoan",
                [
                    collateralId,
                    amount
                ]
            );

            console.log("Borrow transaction initiated:", tx);
            await onBorrow(collateralId, maxLoanAmount);
        } catch (error: any) {
            console.error("Borrow failed with error:", {
                message: error.message,
                error
            });

            // Add specific error handling
            if (error.message.includes("Loan already exists")) {
                setError("This NFT already has an active loan. Please repay the existing loan first.");
            } else if (error.message.includes("execution reverted")) {
                setError("Transaction failed - please check your collateral and loan amount");
            } else {
                setError(error.message || "Failed to borrow");
            }
        }
    };

    useEffect(() => {
        const verifyContract = async () => {
            if (loanManager) {
                try {
                    const address = await loanManager.getAddress();
                    console.log("Loan Manager initialized at:", address);
                } catch (error) {
                    console.error("Contract verification failed:", error);
                    setError("Contract initialization failed");
                }
            }
        };
        verifyContract();
    }, [loanManager]);

    // Add a useEffect to check loan status when collateralId changes
    useEffect(() => {
        const checkLoanStatus = async () => {
            if (!loanManager || !collateralId) return;

            try {
                const loan = await loanManager.call(
                    "loans",
                    [collateralId]
                );

                console.log("Current loan status for collateral", collateralId, ":", loan);

                if (loan && loan.isActive) {
                    setError("This NFT already has an active loan");
                } else {
                    setError("");
                }
            } catch (error) {
                console.error("Error checking loan status:", error);
            }
        };

        checkLoanStatus();
    }, [loanManager, collateralId]);

    return (
        <div>
            {!collateralId ? (
                <p className="text-sm text-gray-400">Deposit an NFT to enable borrowing</p>
            ) : (
                <>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !!error || !maxLoanAmount || maxLoanAmount === '0'}
                        className={`w-full py-3 px-6 rounded-lg text-lg font-medium ${isLoading || !!error || !maxLoanAmount || maxLoanAmount === '0'
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                            } text-white transition-colors`}
                    >
                        {isLoading ? 'Processing...' :
                            !maxLoanAmount ? 'Enter Loan Amount' :
                                maxLoanAmount === '0' ? 'Invalid Amount' :
                                    'Borrow USDT'}
                    </button>
                    {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                </>
            )}
        </div>
    );
} 