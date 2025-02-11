import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract, useAddress } from '@thirdweb-dev/react';
import {  LOAN_MANAGER_CONTRACT } from '../thirdweb/thirdwebConfig';
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
            const amount = ethers.utils.parseEther(maxLoanAmount);
            console.log("Initiating borrow with:", {
                collateralId,
                maxLoanAmount,
                parsedAmount: amount.toString(),
                userAddress: address
            });

            console.log("Loan Manager Contract:", {
                address: await loanManager.getAddress()
            });

            const tx = await loanManager.call(
                "issueLoan",
                [
                    collateralId,
                    amount
                ]
            );

            console.log("Borrow transaction:", tx);
            await onBorrow(collateralId, maxLoanAmount);
        } catch (error: any) {
            console.error("Borrow failed:", error);
            // if(error.message.includes)
            setError(error.message || "Failed to borrow");
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