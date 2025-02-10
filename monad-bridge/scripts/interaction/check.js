const { ethers } = require('hardhat');
const { getContract } = require('./contract-helper');

async function main() {
  const contract = await getContract();

  // Get contract state
  const totalSupply = await contract.totalSupply();
  const maxSupply = await contract.MAX_SUPPLY();
  const WhitelistmintPrice = await contract.WhitelistMintPrice();
  const PublicMintPrice = await contract.PublicMintPrice();
  const isPublicSaleActive = await contract.isPublicSaleActive();
  const isPresaleActive = await contract.isPresaleActive();
  const isRevealed = await contract.isRevealed();

  console.log('Contract Status:');
  console.log('---------------');
  console.log(`Total Supply: ${totalSupply}`);
  console.log(`Max Supply: ${maxSupply}`);
  console.log(
    `Whitelist Mint Price: ${ethers.formatEther(WhitelistmintPrice)} ETH`
  );
  console.log(`Public Mint Price: ${ethers.formatEther(PublicMintPrice)} ETH`);
  console.log(`Public Sale Active: ${isPublicSaleActive}`);
  console.log(`Presale Active: ${isPresaleActive}`);
  console.log(`Revealed: ${isRevealed}`);

  // Get contract balance
  const balance = await ethers.provider.getBalance(contract.getAddress());
  console.log(`Contract Balance: ${ethers.formatEther(balance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
