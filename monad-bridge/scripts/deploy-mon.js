const hre = require('hardhat');

async function main() {
  const MNS = await hre.ethers.getContractFactory('MonadNameService');
  const mns = await MNS.deploy();

  await mns.waitForDeployment();
  const address = await mns.getAddress();
  console.log(`MNS deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
