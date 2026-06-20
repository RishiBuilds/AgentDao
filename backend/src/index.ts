import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {
  getAgents,
  createProposal,
  castVote,
  getProposalState,
  executeProposal,
  getTreasuryBalance,
  mintAgent,
  getCurrentBlock,
} from './chain/contracts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors()); // Enable CORS for frontend

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgentDAO Backend is running' });
});

// Get all active agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await getAgents();
    res.json({
      success: true,
      data: agents.map(a => ({
        tokenId: a.tokenId.toString(),
        owner: a.owner,
        name: a.name,
        role: a.role,
        isActive: a.isActive,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new proposal
app.post('/api/proposals', async (req, res) => {
  try {
    const { description, target, amount } = req.body;
    
    if (!description || !target || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: description, target, amount',
      });
    }

    const result = await createProposal(description, target, amount);
    
    res.json({
      success: true,
      data: {
        proposalId: result.proposalId.toString(),
        txHash: result.hash,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get proposal details
app.get('/api/proposals/:id', async (req, res) => {
  try {
    const proposalId = BigInt(req.params.id);
    const proposal = await getProposalState(proposalId);
    
    const stateNames = ['Pending', 'Active', 'Defeated', 'Succeeded', 'Executed'];
    
    res.json({
      success: true,
      data: {
        id: proposal.id.toString(),
        proposer: proposal.proposer,
        description: proposal.description,
        target: proposal.target,
        value: proposal.value.toString(),
        startBlock: proposal.startBlock.toString(),
        endBlock: proposal.endBlock.toString(),
        forVotes: proposal.forVotes.toString(),
        againstVotes: proposal.againstVotes.toString(),
        executed: proposal.executed,
        state: stateNames[proposal.state],
        stateId: proposal.state,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cast a vote
app.post('/api/proposals/:id/vote', async (req, res) => {
  try {
    const proposalId = BigInt(req.params.id);
    const { support } = req.body;
    
    if (typeof support !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: support (boolean)',
      });
    }

    const hash = await castVote(proposalId, support);
    
    res.json({
      success: true,
      data: {
        txHash: hash,
        support,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute a proposal
app.post('/api/proposals/:id/execute', async (req, res) => {
  try {
    const proposalId = BigInt(req.params.id);
    const hash = await executeProposal(proposalId);
    
    res.json({
      success: true,
      data: {
        txHash: hash,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get treasury balance
app.get('/api/treasury/balance', async (req, res) => {
  try {
    const balance = await getTreasuryBalance();
    
    res.json({
      success: true,
      data: {
        balance: balance.balance,
        balanceWei: balance.balanceWei.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mint a new agent (admin only)
app.post('/api/agents/mint', async (req, res) => {
  try {
    const { to, name, role } = req.body;
    
    if (!to || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, name, role',
      });
    }

    const result = await mintAgent(to, name, role);
    
    res.json({
      success: true,
      data: {
        tokenId: result.tokenId.toString(),
        txHash: result.hash,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current block number
app.get('/api/block', async (req, res) => {
  try {
    const block = await getCurrentBlock();
    
    res.json({
      success: true,
      data: {
        blockNumber: block.toString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AgentDAO Backend running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
