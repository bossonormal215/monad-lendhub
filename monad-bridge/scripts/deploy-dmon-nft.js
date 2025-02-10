// scripts/deploy.js
const hre = require('hardhat');

async function main() {
  const DmonNft = await hre.ethers.getContractFactory('DmonNFT');

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contract from:', deployer.address);

  // Deploy the contract
  const dmonNFT = await DmonNft.deploy(); // No constructor arguments needed
  await dmonNFT.waitForDeployment();
  const address = await dmonNFT.getAddress();

  console.log('DMON NFT contract deployed to:', address);

  // Optional: Verify the contract on Etherscan (if applicable)
  // Requires setting up Etherscan API key in hardhat.config.js
  if (hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
    // Only verify on testnets/mainnet
    await hre.run('verify:verify', {
      address: address,
      constructorArguments: [], // No constructor arguments
    });
  }

  // Example interaction after deployment (optional):
  // You can set the base URI, etc. here if needed.
  // const tx = await dmonNFT.setBaseURI("ipfs://your-ipfs-cid/");
  // await tx.wait();
  // console.log("Base URI set:", tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
