import { createPublicClient, createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

// Define Monad Testnet
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://explorer.testnet.monad.xyz',
    },
  },
});

// Create public client for reading
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.MONAD_RPC_URL),
});

// Create wallet client for writing transactions
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(process.env.MONAD_RPC_URL),
});

export { account };
