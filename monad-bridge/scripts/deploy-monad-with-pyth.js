const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying G MONAD to Monad Devnet...');

  const GmonadNFT = await ethers.getContractFactory('GMonad');

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contract from:', deployer.address);
  console.log('---- Gmonad Contract Factory Gotten-----');

  const pythAddress = '0x2880aB155794e7179c9eE2e38200202908C17B43'; // pythaddress on monad devnet
  const EthUsdPriceFeedId =
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';

  const gmonadNFT = await GmonadNFT.deploy(pythAddress, EthUsdPriceFeedId); // pythAddress, EthUsdPriceFeedId, {gasLimit: 10000000,}
  await gmonadNFT.waitForDeployment();
  const address = await gmonadNFT.getAddress();

  console.log('G MONAD deployed to:', address);

  // Wait for 5 block confirmations
  console.log('Waiting for block confirmations...');
  await gmonadNFT.deploymentTransaction()?.wait(5);

  // Verify contract
  /*if (process.env.ARBISCAN_API_KEY) {
    console.log('Verifying contract on Arbiscan...');
    try {
      const hardhat = require('hardhat');
      await hardhat.run('verify:verify', {
        address: address,
        constructorArguments: [],
      });
      console.log('Contract verified successfully');
    } catch (error) {
      console.error('Error verifying contract:', error);
    }
  }

  // Set initial values
  console.log('Setting initial values...');
  const notRevealedURI = 'https://api.gmonad.xyz/hidden.json';
  await gmonadNFT.setNotRevealedURI(notRevealedURI);
  console.log('Not revealed URI set to:', notRevealedURI);
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
