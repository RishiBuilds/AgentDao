import {
  getAgents,
  createProposal,
  castVote,
  getProposalState,
  executeProposal,
  getTreasuryBalance,
  mintAgent,
  getCurrentBlock,
  ProposalState,
} from '../src/chain/contracts';
import { parseEther } from 'viem';
import { publicClient, walletClient } from '../src/chain/client';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Starting Manual Flow Test...\n');

  // Step 1: Check initial treasury balance
  console.log('📊 Step 1: Check treasury balance');
  let balance = await getTreasuryBalance();
  console.log(`Initial balance: ${balance.balance} MON`);
  console.log(`Balance (wei): ${balance.balanceWei}\n`);

  // Step 2: Fund treasury if needed
  if (balance.balanceWei === 0n) {
    console.log('💰 Treasury empty, funding with 1 MON...');
    const hash = await walletClient.sendTransaction({
      to: '0xE6458223f6ab5F7d67Cc1FCf7c311fdAEABE09d6', // Treasury address
      value: parseEther('1'),
    });
    console.log(`Funding TX: ${hash}`);
    await publicClient.waitForTransactionReceipt({ hash });
    balance = await getTreasuryBalance();
    console.log(`New balance: ${balance.balance} MON\n`);
  }

  // Step 3: Get existing agents or mint new ones
  console.log('👥 Step 2: Get/Mint Agents');
  let agents = await getAgents();
  console.log(`Found ${agents.length} active agents`);

  // We need at least 2 agents for quorum
  const agentAddresses = [
    '0xE902143bf447c5F7C2342509F712Dc4492207D75', // Deployer wallet (already has agent)
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', // Agent 2 (test address)
  ];

  while (agents.length < 2) {
    const agentNum = agents.length + 1;
    console.log(`Minting Agent ${agentNum}...`);
    try {
      const result = await mintAgent(
        agentAddresses[agents.length],
        `TestAgent${agentNum}`,
        ['Marketing', 'Finance'][agents.length]
      );
      console.log(`Agent ${agentNum} minted - Token ID: ${result.tokenId}, TX: ${result.hash}`);
    } catch (error: any) {
      console.log(`⚠️  Failed to mint Agent ${agentNum}: ${error.message}`);
      console.log(`Continuing with ${agents.length} agents...\n`);
      break;
    }
    agents = await getAgents();
  }

  console.log('\n✅ Active Agents:');
  agents.forEach(agent => {
    console.log(`  - Token ${agent.tokenId}: ${agent.name} (${agent.role}) - ${agent.owner}`);
  });

  // Step 4: Create a proposal
  console.log('\n📝 Step 3: Create Proposal');
  const recipientAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
  const proposal = await createProposal(
    'Release 0.1 MON for marketing campaign',
    recipientAddress,
    '0.1'
  );
  console.log(`Proposal created - ID: ${proposal.proposalId}`);
  console.log(`TX Hash: ${proposal.hash}\n`);

  // Wait for voting delay
  const currentBlock = await getCurrentBlock();
  console.log(`Current block: ${currentBlock}`);
  console.log('⏳ Waiting for voting delay (2 blocks)...');
  
  // Wait for blocks to be mined
  let newBlock = currentBlock;
  while (newBlock < currentBlock + 3n) {
    await delay(2000);
    newBlock = await getCurrentBlock();
    console.log(`Block: ${newBlock}`);
  }

  // Step 5: Check proposal state
  console.log('\n📋 Step 4: Check Proposal State');
  let proposalState = await getProposalState(proposal.proposalId);
  console.log(`State: ${ProposalState[proposalState.state]}`);
  console.log(`For votes: ${proposalState.forVotes}, Against: ${proposalState.againstVotes}`);
  console.log(`Voting period: Block ${proposalState.startBlock} to ${proposalState.endBlock}\n`);

  // Step 6: Cast votes
  console.log('🗳️  Step 5: Cast Votes');
  
  // Vote 1 - For
  console.log('Casting vote 1 (FOR)...');
  const vote1 = await castVote(proposal.proposalId, true);
  console.log(`Vote 1 TX: ${vote1}`);

  // Since we only have one wallet, we'll just cast one vote
  // In a real scenario, you'd use different wallets for different agents
  
  // Check votes
  proposalState = await getProposalState(proposal.proposalId);
  console.log(`After voting - For: ${proposalState.forVotes}, Against: ${proposalState.againstVotes}\n`);

  // Note: To pass, we need 2 votes (quorum). Since we only have one wallet,
  // we'll document that more votes would be needed in production

  console.log(`⚠️  Note: This test uses a single wallet controlling ${agents.length} agent(s).`);
  console.log('⚠️  In production, you would use multiple wallets to cast the required 2 votes for quorum.\n');

  // For testing purposes, let's assume we had 2 votes and continue
  console.log('📊 Step 6: Check Final State');
  proposalState = await getProposalState(proposal.proposalId);
  console.log(`State: ${ProposalState[proposalState.state]}`);
  console.log(`For votes: ${proposalState.forVotes}, Against: ${proposalState.againstVotes}`);

  // Step 7: Try to execute (will fail if not enough votes, which is expected)
  console.log('\n⚡ Step 7: Execute Proposal');
  try {
    const execTx = await executeProposal(proposal.proposalId);
    console.log(`✅ Execution successful! TX: ${execTx}`);

    // Check final balance
    const finalBalance = await getTreasuryBalance();
    console.log(`\n💰 Final Treasury Balance: ${finalBalance.balance} MON`);
    console.log(`Balance decreased by: ${parseFloat(balance.balance) - parseFloat(finalBalance.balance)} MON`);
  } catch (error: any) {
    console.log(`❌ Execution failed (expected if quorum not met): ${error.message}`);
    console.log('\n📝 Summary: Proposal created and voted on, but needs 2 votes to execute.');
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ MANUAL FLOW TEST COMPLETE');
  console.log('='.repeat(60));
  console.log(`
Summary:
- Treasury Balance: ${balance.balance} MON
- Agents Minted: ${agents.length}
- Proposal Created: ID ${proposal.proposalId}
- Votes Cast: 1
- Execution: ${proposalState.forVotes >= 2n ? 'Successful' : 'Needs more votes'}

Transaction Hashes:
- Proposal Creation: ${proposal.hash}
- Vote: ${vote1}
  `);
}

main()
  .then(() => {
    console.log('\n✨ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
