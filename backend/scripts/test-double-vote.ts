import { createProposal, castVote } from '../src/chain/contracts';

async function run() {
  console.log("Creating double-vote test proposal...");
  const { proposalId } = await createProposal(
    "Double vote test proposal",
    "0xE902143bf447c5F7C2342509F712Dc4492207D75",
    "0.01"
  );
  console.log("Created proposal ID:", proposalId.toString());

  console.log("Waiting 0.5s for voting delay (1 block) to pass...");
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log("Casting first vote...");
  try {
    const tx1 = await castVote(proposalId, true);
    console.log("First vote cast. Tx:", tx1);
  } catch (err: any) {
    console.error("First vote failed:", err.message || err);
    return;
  }

  console.log("Casting second vote (double-vote attempt)...");
  try {
    const tx2 = await castVote(proposalId, true);
    console.log("ERROR: Second vote succeeded! Tx:", tx2);
  } catch (err: any) {
    console.log("SUCCESS: Second vote failed as expected.");
    console.log("Error message:", err.message || err);
  }
}

run().catch(console.error);
