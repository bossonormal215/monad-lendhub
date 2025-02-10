// scripts/deploy.js
const hre = require('hardhat');

async function main() {
  const GMonadToken = await hre.ethers.getContractFactory('GmonadToken');

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contract from:', deployer.address);

  // GmonadToken constructors args
  const name = 'GMONAD TOKEN';
  const symbol = 'GMONAD';
  const initialSupply = 1000000;

  // Deploy the contract
  const gmonadToken = await GMonadToken.deploy(name, symbol, initialSupply); //  constructor arguments needed
  await gmonadToken.waitForDeployment();
  const address = await gmonadToken.getAddress();

  console.log('GMONAD TOKEN  contract deployed to:', address);

  // Optional: Verify the contract on Etherscan (if applicable)
  // Requires setting up Etherscan API key in hardhat.config.js
  /*
  if (hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
    // Only verify on testnets/mainnet
    await hre.run('verify:verify', {
      address: address,
      constructorArguments: [], // No constructor arguments
    });
  }
*/
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
