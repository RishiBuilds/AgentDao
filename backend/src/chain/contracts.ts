import { readFileSync } from 'fs';
import { join } from 'path';
import { getContract, parseEther, formatEther, encodeFunctionData } from 'viem';
import { publicClient, walletClient } from './client';
import agentIdentityAbi from './abis/AgentIdentity.json';
import agentTreasuryAbi from './abis/AgentTreasury.json';
import agentGovernorAbi from './abis/AgentGovernor.json';

const deployments = JSON.parse(
  readFileSync(join(__dirname, '../../../config/deployments.json'), 'utf-8')
);

// Contract addresses
const addresses = {
  agentIdentity: deployments.contracts.AgentIdentity.address as `0x${string}`,
  agentTreasury: deployments.contracts.AgentTreasury.address as `0x${string}`,
  agentGovernor: deployments.contracts.AgentGovernor.address as `0x${string}`,
};

// Contract instances
export const agentIdentityContract = getContract({
  address: addresses.agentIdentity,
  abi: agentIdentityAbi,
  client: { public: publicClient, wallet: walletClient },
});

export const agentTreasuryContract = getContract({
  address: addresses.agentTreasury,
  abi: agentTreasuryAbi,
  client: { public: publicClient, wallet: walletClient },
});

export const agentGovernorContract = getContract({
  address: addresses.agentGovernor,
  abi: agentGovernorAbi,
  client: { public: publicClient, wallet: walletClient },
});

// Helper types
export enum ProposalState {
  Pending = 0,
  Active = 1,
  Defeated = 2,
  Succeeded = 3,
  Executed = 4,
}

export interface Agent {
  tokenId: bigint;
  owner: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface Proposal {
  id: bigint;
  proposer: string;
  description: string;
  target: string;
  value: bigint;
  startBlock: bigint;
  endBlock: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  executed: boolean;
  state: ProposalState;
}

/**
 * Get all active agent identities
 */
export async function getAgents(): Promise<Agent[]> {
  const totalSupply = await agentIdentityContract.read.totalSupply() as bigint;
  const agents: Agent[] = [];

  for (let i = 0n; i < totalSupply; i++) {
    try {
      const owner = await agentIdentityContract.read.ownerOf([i]) as string;
      const info = await agentIdentityContract.read.getAgentInfo([i]) as [string, string, boolean];
      
      agents.push({
        tokenId: i,
        owner,
        name: info[0],
        role: info[1],
        isActive: info[2],
      });
    } catch (error) {
      // Token doesn't exist, skip
      continue;
    }
  }

  return agents.filter(agent => agent.isActive);
}

/**
 * Create a new proposal
 */
export async function createProposal(
  description: string,
  target: string,
  amount: string
): Promise<{ hash: string; proposalId: bigint }> {
  const value = parseEther(amount);
  
  // Encode the release function call
  const data = encodeFunctionData({
    abi: agentTreasuryAbi,
    functionName: 'release',
    args: [target, value],
  });

  const hash = await agentGovernorContract.write.propose([
    description,
    addresses.agentTreasury,
    0n, // ETH value to send with the call
    data,
  ]);

  // Wait for transaction and get proposal ID from events
  await publicClient.waitForTransactionReceipt({ hash });

  // Get proposal count to determine the ID
  const proposalCount = await agentGovernorContract.read.proposalCount() as bigint;
  const proposalId = proposalCount - 1n;

  return { hash, proposalId };
}

/**
 * Cast a vote on a proposal
 */
export async function castVote(
  proposalId: bigint,
  support: boolean
): Promise<string> {
  const hash = await agentGovernorContract.write.castVote([proposalId, support]);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Get proposal state and details
 */
export async function getProposalState(proposalId: bigint): Promise<Proposal> {
  const proposal = await agentGovernorContract.read.getProposal([proposalId]) as [
    string, // proposer
    string, // description
    string, // target
    bigint, // value
    bigint, // startBlock
    bigint, // endBlock
    bigint, // forVotes
    bigint, // againstVotes
    boolean // executed
  ];

  const state = await agentGovernorContract.read.state([proposalId]) as number;

  return {
    id: proposalId,
    proposer: proposal[0],
    description: proposal[1],
    target: proposal[2],
    value: proposal[3],
    startBlock: proposal[4],
    endBlock: proposal[5],
    forVotes: proposal[6],
    againstVotes: proposal[7],
    executed: proposal[8],
    state: state as ProposalState,
  };
}

/**
 * Execute a passed proposal
 */
export async function executeProposal(proposalId: bigint): Promise<string> {
  const hash = await agentGovernorContract.write.execute([proposalId]);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Get treasury balance
 */
export async function getTreasuryBalance(): Promise<{ balance: string; balanceWei: bigint }> {
  const balance = await publicClient.getBalance({
    address: addresses.agentTreasury,
  });

  return {
    balance: formatEther(balance),
    balanceWei: balance,
  };
}

/**
 * Mint a new agent identity (admin only)
 */
export async function mintAgent(
  to: string,
  name: string,
  role: string
): Promise<{ hash: string; tokenId: bigint }> {
  const hash = await agentIdentityContract.write.mint([to as `0x${string}`, name, role]);
  await publicClient.waitForTransactionReceipt({ hash });
  
  // Get the token ID (totalSupply - 1)
  const totalSupply = await agentIdentityContract.read.totalSupply() as bigint;
  const tokenId = totalSupply - 1n;

  return { hash, tokenId };
}

/**
 * Get current block number
 */
export async function getCurrentBlock(): Promise<bigint> {
  return await publicClient.getBlockNumber();
}
