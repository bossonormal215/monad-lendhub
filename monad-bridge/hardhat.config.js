require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  networks: {
    ethereumSepolia: {
      url: process.env.ETH_SEPOLIA_RPC, // Alchemy or Infura
      accounts: [process.env.PRIVATE_KEY],
    },

    arbitrumSepolia: {
      url: process.env.ARB_SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },

    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },

    monadDevNet: {
      url: process.env.MONAD_DEVNET_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 20143,
    },
  },

  etherscan: {
    apiKey: {
      monad: 'empty',
    },
    customChains: [
      {
        network: 'monad',
        chainId: 1,
        urls: {
          apiURL: 'https://explorer.monad-devnet.devnet101.com/api',
          browserURL: 'https://explorer.monad-devnet.devnet101.com',
        },
      },
    ],
  },
};

// npx hardhat verify --network monad  0x6c5006D7aC2e255f60C154DFEE9150BCE94C4C38 --constructor-args ./constructor-args.js
