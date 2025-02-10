export const MONAD_DEVNET_CONFIG = {
  chainId: '20143', // Replace with the actual Monad Devnet chain ID
  chainName: 'Monad Devnet',
  rpcUrls: ['https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a'], // Replace with actual Monad Devnet RPC URL
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.monad-devnet.devnet101.com', 'https://explorer.monad.dev'], // Replace with Monad Devnet explorer
};

const activeChain = {
  chainId: 20143, // Replace with actual monad devnet chain ID
  rpc: ['https://explorer.monad-devnet.devnet101.com', "explorer.monad-devnet.devnet101.com"],
  nativeCurrency: {
    decimals: 18,
    name: "Monad Devnet",
    symbol: "MON",
  },
  shortName: "monad",
  slug: "monad",
  testnet: true,
  chain: "monad",
  name: "Monad Devnet",
};