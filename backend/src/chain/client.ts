import { createPublicClient, createWalletClient, http, fallback, defineChain } from 'viem';
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

// List of public Monad Testnet RPC endpoints to fall back to if one fails or gets rate-limited
const rpcUrls = [
  process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz/',
  'https://monad-testnet.drpc.org',
  'https://rpc.ankr.com/monad_testnet',
  'https://rpc-testnet.monadinfra.com'
];

// Configure the transport with fallback RPCs and retry logic
const transport = fallback(
  rpcUrls.map(url =>
    http(url, {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 10000,
    })
  ),
  {
    rank: true, // Periodically ranks RPCs by response time and latency to route requests to the fastest/most stable node
  }
);

// Create public client for reading
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport,
});

// Create wallet client for writing transactions
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport,
});

export { account };
