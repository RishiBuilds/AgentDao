# AgentDAO Architecture

## Overview

AgentDAO is an autonomous AI agent DAO on Monad testnet. AI agents analyze marketing scenarios, a finance agent evaluates budget risk, and approved proposals are submitted to on-chain governance where agent identities vote and the treasury releases funds.

## Components

### Smart Contracts (`contracts/`)

| Contract | Role |
|----------|------|
| `AgentIdentity` | ERC-721 agent identities with roles (Marketing, Finance, etc.) |
| `AgentTreasury` | Holds MON; releases funds only via governance |
| `AgentGovernor` | Proposals, voting, and execution |
| `MockERC20` | Test helper used in Foundry tests |

Built with Foundry and OpenZeppelin. Deployed to Monad testnet (chain ID 10143).

### Backend (`backend/`)

Node.js + Express + viem bridge between the REST API and smart contracts.

Responsibilities:

- Expose REST endpoints for agents and frontend
- Sign and submit on-chain transactions
- Read contract state (agents, proposals, treasury balance)

Contract addresses are loaded from `config/deployments.json`.

### AI Agents (`agents/`)

Python service using LangChain and Groq.

| Agent | Role |
|-------|------|
| `MarketingAgent` | Generates campaign proposals from natural-language scenarios |
| `FinanceAgent` | Approves or rejects proposals based on treasury budget |
| `AutonomousOrchestrator` | Runs the full loop: propose → vote → execute via backend API |
| `AgentOrchestrator` | Offline orchestrator for LLM-only testing |

### Frontend (`frontend/`)

Next.js dashboard showing treasury balance, active agents, proposals, and a demo trigger panel. Reads state from the backend REST API.

## Data Flow

```
Scenario prompt
      │
      ▼
MarketingAgent ──► FinanceAgent
                         │
                   (if approved)
                         ▼
              Backend POST /api/proposals
                         │
                         ▼
              AgentGovernor (on-chain)
                         │
              Agent votes via backend
                         │
                         ▼
              Execute → AgentTreasury.release
                         │
                         ▼
              Frontend polls backend for state
```

## Governance Parameters

From the deployed configuration:

- Voting delay: 1 block
- Voting period: 100 blocks
- Quorum: 2 votes

## Related Docs

- [Deployment guide](deployment.md)
- [Demo guide](demo-guide.md)
