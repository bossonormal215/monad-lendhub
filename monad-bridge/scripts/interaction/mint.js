const { ethers } = require('hardhat');
const { getContract } = require('./contract-helper'); // Path to your contract helper file

async function main() {
  const contract = await getContract();

  const [signer] = await ethers.getSigners(); // Get the signer (your account)

  const quantity = 5; // Number of NFTs to mint
  const whitelistMintPrice = await contract.WhitelistMintPrice(); // Get the price
  // const totalMintPrice = whitelistMintPrice * BigInt(quantity);
  const totalMintPrice = whitelistMintPrice * BigInt(quantity);

  // Check if user is whitelisted (optional but good practice)
  const isWhitelisted = await contract.whitelist(signer.address);
  // check if it is whitelist/presale active
  const isWhitelistMintActive = await contract.isPresaleActive();

  if (!isWhitelistMintActive) {
    console.log('Whitelist Mint Active: ', isWhitelistMintActive);
    console.log('Preasle/whitelist mint NOT ACTIVE yet!');
    return;
  }

  if (!isWhitelisted) {
    console.log('Whitelist: ', isWhitelisted);
    console.log(`${signer.address} is not whitelisted.`);
    return; // Or throw an error if you want to stop execution
  }

  // Mint the NFTs
  try {
    console.log('Total Mint Price: ', totalMintPrice);
    const tx = await contract.whitelistMint(quantity, {
      value: totalMintPrice,
    });
    await tx.wait(); // Wait for the transaction to be mined
    console.log(
      `Successfully minted ${quantity} NFTs! Transaction hash: ${tx.hash}`
    );
  } catch (error) {
    console.error('Error minting NFTs:', error);
  }

  // (Optional) Check the updated total supply and balance after minting
  const totalSupply = await contract.totalSupply();
  const balance = await ethers.provider.getBalance(contract.getAddress());
  console.log('---------------');
  console.log(`Updated Total Supply: ${totalSupply}`);
  console.log(`Updated Contract Balance: ${ethers.formatEther(balance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
