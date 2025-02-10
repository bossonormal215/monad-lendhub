const { ethers } = require('hardhat');
const { getContract, verifyOwner } = require('./contract-helper');

async function main() {
  const contract = await getContract();
  // await verifyOwner(contract);

  // Add addresses to whitelist
  const addressesToWhitelist = [
    // '0x123...', // Replace with actual addresses
    '0xED42844Cd35d734fec3B65dF486158C443896b41',
    '0x65b372e0793B3B0fAF9F9F83E0FE84A18fc92419',
  ];

  console.log('Adding addresses to whitelist...');
  const tx = await contract.addToWhitelist(addressesToWhitelist);
  await tx.wait();
  console.log('Addresses added to whitelist');

  // Verify whitelist status
  for (const address of addressesToWhitelist) {
    const isWhitelisted = await contract.whitelist(address);
    console.log(`Address ${address} is whitelisted:`, isWhitelisted);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
