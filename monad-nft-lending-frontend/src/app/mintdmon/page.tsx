'use client';


import { ThirdwebProvider, ConnectWallet, useNetworkMismatch, useSwitchChain, useSDK } from "@thirdweb-dev/react";
import { embeddedWallet, metamaskWallet, zerionWallet, coinbaseWallet, walletConnect, rabbyWallet, rainbowWallet } from "@thirdweb-dev/react";

import { useState, useEffect } from 'react';
import { useContract, useAddress} from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { DMON_NFT_CONTRACT } from '../../contracts/interfaces/dmonNftAbi';



export default function MintDMONPage() {
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
