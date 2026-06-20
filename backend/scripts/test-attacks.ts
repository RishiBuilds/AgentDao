import { agentIdentityContract, agentTreasuryContract, agentGovernorContract } from '../src/chain/contracts';
import { publicClient, account } from '../src/chain/client';

async function run() {
  console.log("Starting LIVE on-chain attack/edge case audits...");
  console.log("Deployer Address:", account.address);

  console.log("\n--- TEST 1: Direct withdrawal attempt from AgentTreasury ---");
  try {
    const hash = await agentTreasuryContract.write.release([
      account.address,
      100000000000000n
    ]);
    console.log("ERROR: Direct release call succeeded? Tx Hash:", hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Tx Receipt Status:", receipt.status);
  } catch (error: any) {
    console.log("SUCCESS: Direct release failed as expected.");
    console.log("Error message:", error.message || error);
  }

  console.log("\n--- TEST 2: Deactivated agent voting attempt ---");
  try {
    console.log("Deactivating agent identity token 0...");
    const deactivateHash = await agentIdentityContract.write.deactivate([0n]);
    await publicClient.waitForTransactionReceipt({ hash: deactivateHash });
    console.log("Agent token 0 deactivated on-chain. Checking isActive status...");
    const isActive = await agentIdentityContract.read.isActive([0n]);
    console.log("Is active:", isActive);

    console.log("Attempting to cast vote on proposal 4 with deactivated agent...");
    try {
      const voteHash = await agentGovernorContract.write.castVote([4n, true]);
      console.log("ERROR: Vote from deactivated agent succeeded? Tx Hash:", voteHash);
      await publicClient.waitForTransactionReceipt({ hash: voteHash });
    } catch (voteError: any) {
      console.log("SUCCESS: Vote from deactivated agent failed as expected.");
      console.log("Error message:", voteError.message || voteError);
    }

    console.log("Re-activating agent identity token 0 to restore state...");
    const activateHash = await agentIdentityContract.write.activate([0n]);
    await publicClient.waitForTransactionReceipt({ hash: activateHash });
    console.log("Agent token 0 re-activated on-chain.");
  } catch (error: any) {
    console.log("ERROR during deactivation/vote/activation test:", error);
    try {
      const activateHash = await agentIdentityContract.write.activate([0n]);
      await publicClient.waitForTransactionReceipt({ hash: activateHash });
      console.log("Emergency cleanup: Agent token 0 re-activated.");
    } catch {
      // ignore cleanup failure
    }
  }
}

run().catch(console.error);
