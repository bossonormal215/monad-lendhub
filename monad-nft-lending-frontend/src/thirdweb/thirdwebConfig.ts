import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { useContract } from '@thirdweb-dev/react';

export const MONAD_RPC =
  'https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a'; // Replace with actual Monad Devnet RPC
export const USDT_CONTRACT = '0x3B969Ebe8739CEd48C1234d565C0f58e7746479c';
export const NFT_VAULT_CONTRACT = '0x8d53c0d21551904ed6d167d922cAcE61D00eBd14';
export const LOAN_MANAGER_CONTRACT =
  '0xaA527f6593c9017765BBda51ed2fbaA1447bC2be';
export const LIQUIDATION_MANAGER_CONTRACT =
  '0x1cf2d437be68bCC64c2AD7f232B293210EE139d1';

export const sdk = new ThirdwebSDK(MONAD_RPC);

export function useContracts() {
  const { contract: usdt } = useContract(USDT_CONTRACT);
  const { contract: nftVault } = useContract(NFT_VAULT_CONTRACT);
  const { contract: loanManager } = useContract(LOAN_MANAGER_CONTRACT);
  const { contract: liquidationManager } = useContract(
    LIQUIDATION_MANAGER_CONTRACT
  );

  return { usdt, nftVault, loanManager, liquidationManager };
}
