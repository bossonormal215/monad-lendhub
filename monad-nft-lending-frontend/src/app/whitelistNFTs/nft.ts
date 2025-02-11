export interface WhitelistedNFT {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  maxLoanAmount: number; // Maximum loan amount in USDT
  ltvRatio: number; // Loan-to-Value ratio (e.g., 70 means 70%)
}

export const WHITELISTED_NFTS: WhitelistedNFT[] = [
  {
    address: '0xFd6E4CF0FC697236b359ac67701B8D1dFe82D301',
    name: 'DMONNFT',
    symbol: 'DMON',
    description: 'Exclusive Monad Ape Collection',
    image: '/images/monad-ape.png', // Add your NFT collection image
    maxLoanAmount: 1000, // 1000 USDT
    ltvRatio: 70,
  },
  // Add more whitelisted NFTs here
];

export function isNFTWhitelisted(address: string): boolean {
  return WHITELISTED_NFTS.some(
    (nft) => nft.address.toLowerCase() === address.toLowerCase()
  );
}

export function getNFTByAddress(address: string): WhitelistedNFT | undefined {
  return WHITELISTED_NFTS.find(
    (nft) => nft.address.toLowerCase() === address.toLowerCase()
  );
}
