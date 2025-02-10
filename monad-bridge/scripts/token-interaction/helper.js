const { ethers } = require('hardhat');
const axios = require('axios');
// const { DmonNFT } = require('../../typechain-types');

// const DEPLOYED_CONTRACT_ADDRESS = '0xFd6E4CF0FC697236b359ac67701B8D1dFe82D301'; // monad devnet
const DEPLOYED_CONTRACT_ADDRESS = '0x6324d48193ffED95d7e8Ec0016f9eBF70a9E6544'; // monad devnet with pyth

async function getContract() {
  // No type annotations in JavaScript
  const contract = await ethers.getContractAt(
    'GmonadToken', // Correct contract name the one with pyth
    DEPLOYED_CONTRACT_ADDRESS
  );
  return contract;
}

async function verifyOwner() {
  const [signer] = await ethers.getSigners();
  const owner = await contract.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error('Signer is not the contract owner');
  }
}

module.exports = {
  getContract,
  verifyOwner,
  DEPLOYED_CONTRACT_ADDRESS,
}; // Export for use in other files
