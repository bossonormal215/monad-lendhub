const { ethers, hardhatArguments } = require('hardhat');
const { getContract } = require('./contract-helper');
const fs = require('fs');
const fetchPriceUpdate = require('./updatePriceFeed');

async function main(hre) {
  console.log('Starting the minting script...');
  const contract = await getContract();

  // Read the price update data from the file
  let priceUpdateDataHex = fs.readFileSync('price_update.txt', 'utf8').trim();
  if (!priceUpdateDataHex.startsWith('0x')) {
    priceUpdateDataHex = '0x' + priceUpdateDataHex;
  }
  const pythPriceUpdate = [priceUpdateDataHex];

  try {
    const priceUpdateTx = await contract.updatePrice(pythPriceUpdate, {
      value: BigInt(20),
    });
    await priceUpdateTx.wait(1);
    console.log('Price updated!');
  } catch (error) {
    console.error('Error updating price:', error);
    return;
  }

  try {
    const ethUsdPrice = await contract.getEthUsdPrice();
    const whitelistMintPrice = await contract.WhitelistMintPrice();

    console.log('Current ETH/USD Price:', ethUsdPrice.toString()); // Assuming 8 decimals for ETH/USD price
    console.log('Whitelist Mint Price (USD):', whitelistMintPrice.toString()); // Assuming 2 decimals for USD

    // Calculate mint price in ETH
    const ethUsdPriceNum = parseFloat(ethers.formatUnits(ethUsdPrice, 2));
    const WhitelistMintPriceNum = parseFloat(
      ethers.formatUnits(whitelistMintPrice, 2)
    );
    const mintPriceInEth = WhitelistMintPriceNum / ethUsdPriceNum;

    console.log('Mint Price in ETH:', mintPriceInEth.toFixed(8)); // Display to 8 decimals

    const quantity = 4; // Number of NFTs to mint
    const totalPriceInEth = mintPriceInEth * quantity;

    console.log(
      `Minting ${quantity} NFT(s) for ${totalPriceInEth.toFixed(4)} ETH`
    );

    const totalPriceInWei = ethers.parseEther(totalPriceInEth.toFixed(18));
    const tx = await contract.whitelistMint(quantity, {
      value: totalPriceInWei,
    });
    const receipt = await tx.wait();

    console.log('Mint transaction:', tx.hash);
    console.log('NFT(s) minted successfully!');

    // Get token IDs from events
    const mintEvents = receipt?.logs.filter(
      (log) => log.topics[0] === ethers.id('NFTMinted(address,uint256)')
    );

    if (mintEvents) {
      for (const event of mintEvents) {
        const parsedEvent = contract.interface.parseLog({
          topics: event.topics,
          data: event.data,
        });
        console.log(`Token ID minted: ${parsedEvent?.args.tokenId}`);
      }
    }
  } catch (error) {
    console.error('Error during minting:', error);
  }
}

main(hre)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//yarn verify-abstract-testnet 0xD3e744D973383f28fbd17Ff0893B8599dD636633  --constructor-args ./constructor-args.ts
