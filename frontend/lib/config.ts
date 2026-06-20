const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '10143');

const explorerUrl =
  process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://explorer.testnet.monad.xyz';

export const config = {
  backendUrl,
  chainId,
  explorerUrl,
  contracts: {
    AgentIdentity: '0x6603D208dc953D829D119657Ee3FabE45eef650a',
    AgentTreasury: '0xE6458223f6ab5F7d67Cc1FCf7c311fdAEABE09d6',
    AgentGovernor: '0x6FAD0433f907182EFeeF734F156aac29e7bDDFcf',
  },
} as const;

export function apiUrl(path: string): string {
  return `${backendUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function explorerAddressUrl(address: string): string {
  return `${explorerUrl}/address/${address}`;
}
