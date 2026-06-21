# AgentDAO 🤖⛓️

> **Autonomous AI agent governance on Monad testnet** - AI agents propose marketing campaigns, a finance agent evaluates and approves them, and approved proposals flow through on-chain governance to release treasury funds all without human intervention.

[![Monad Testnet](https://img.shields.io/badge/Network-Monad%20Testnet-blueviolet)](https://testnet.monad.xyz/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange)](https://book.getfoundry.sh/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Agent System](#agent-system)
- [Monad Testnet](#monad-testnet)
- [Project Structure](#project-structure)
- [Development Scripts](#development-scripts)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AgentDAO demonstrates a fully autonomous, AI-driven governance loop on-chain:

1. **Marketing Agent** generates campaign proposals with estimated ROI, budget, and rationale using an LLM (Groq).
2. **Finance Agent** evaluates each proposal against treasury constraints and DAO rules, then approves or rejects it on-chain.
3. **Governance Contracts** hold approved proposals in a timelock queue; once the voting period passes, treasury funds are released automatically.
4. **Frontend Dashboard** gives human observers real-time visibility into every agent action and on-chain state - no intervention required.

This is a reference implementation for **agent-native DAOs**: organizations where AI agents are first-class governance participants with verifiable on-chain identities.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                   │
│            Dashboard · Proposal Feed · Agent Logs           │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST
┌───────────────────────────▼─────────────────────────────────┐
│                      Backend (Express)                      │
│         REST API · Event Indexer · viem Chain Bridge        │
└──────────┬──────────────────────────────────────┬───────────┘
           │ REST                                 │ viem
┌──────────▼──────────┐              ┌────────────▼───────────┐
│    Agents (Python)  │              │   Smart Contracts      │
│  Marketing · Finance│              │  Identity · Treasury   │
│  LangChain + Groq   │              │  Governance (Foundry)  │
└─────────────────────┘              └────────────────────────┘
```

### Component Summary

| Component    | Stack                        | Role                                                  |
| ------------ | ---------------------------- | ----------------------------------------------------- |
| `contracts/` | Solidity, Foundry            | On-chain identity, treasury, and governance logic     |
| `backend/`   | Node.js, Express, viem       | REST API, event indexing, and chain interaction layer |
| `agents/`    | Python, LangChain, Groq      | Autonomous marketing and finance AI agents            |
| `frontend/`  | Next.js, React, Tailwind CSS | Real-time monitoring dashboard                        |
| `config/`    | JSON                         | Deployed contract address manifest                    |

> See [docs/architecture.md](docs/architecture.md) for a deep-dive on data flows, agent decision trees, and contract interactions.

---

## Smart Contracts

| Contract        | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| `AgentRegistry` | Registers AI agents as on-chain identities with roles and permissions |
| `AgentTreasury` | Holds DAO funds; releases them only on governance approval            |
| `GovernorDAO`   | Proposal lifecycle: submission → voting → timelock → execution        |

All contracts are deployed on **Monad testnet** - addresses in [`config/deployments.json`](config/deployments.json).

---

## Prerequisites

| Tool                 | Version | Notes                                                                                               |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| Node.js              | 18+     | Backend and frontend                                                                                |
| Python               | 3.10+   | Agent runtime                                                                                       |
| Foundry              | latest  | Smart contract toolchain - [install guide](https://book.getfoundry.sh/getting-started/installation) |
| Groq API key         | -       | Free tier at [console.groq.com](https://console.groq.com/keys)                                      |
| Monad testnet wallet | -       | Funded with testnet MON                                                                             |

---

## Quick Start

> Run each service in a separate terminal. The recommended startup order is: **Contracts → Backend → Agents → Frontend**.

### 1. Smart Contracts

```bash
cd contracts
cp .env.example .env        # fill in MONAD_RPC_URL and PRIVATE_KEY
forge install
forge build
forge test                   # all tests should pass before deploying
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast
```

After deployment, copy the printed addresses into `config/deployments.json`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in MONAD_RPC_URL, PRIVATE_KEY, and contract addresses
npm run dev                  # starts on http://localhost:3001
```

Verify it's running:

```bash
curl http://localhost:3001/health
```

### 3. Agents

```bash
cd agents
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # fill in GROQ_API_KEY and BACKEND_URL
python src/main.py           # health check server on :8000
```

Run the full autonomous loop (requires backend to be running):

```bash
python scripts/run_autonomous_loop.py
```

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                  # starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## Environment Variables

### `contracts/.env`

```env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
PRIVATE_KEY=0x...            # deployer wallet private key
```

### `backend/.env`

```env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
PRIVATE_KEY=0x...            # transaction-signing wallet
PORT=3001

# From config/deployments.json after contract deployment
AGENT_REGISTRY_ADDRESS=0x...
AGENT_TREASURY_ADDRESS=0x...
GOVERNOR_DAO_ADDRESS=0x...
```

### `agents/.env`

```env
GROQ_API_KEY=gsk_...
BACKEND_URL=http://localhost:3001
LOOP_INTERVAL_SECONDS=60     # how often the autonomous loop runs
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> ⚠️ **Never commit `.env` files or expose private keys in version control.**

---

## API Reference

Full examples in [docs/api-examples.md](docs/api-examples.md). Key endpoints:

### Proposals

| Method | Endpoint                     | Description               |
| ------ | ---------------------------- | ------------------------- |
| `GET`  | `/api/proposals`             | List all proposals        |
| `GET`  | `/api/proposals/:id`         | Get a single proposal     |
| `POST` | `/api/proposals`             | Submit a new proposal     |
| `POST` | `/api/proposals/:id/vote`    | Cast a vote               |
| `POST` | `/api/proposals/:id/execute` | Execute a passed proposal |

### Agents

| Method | Endpoint           | Description                            |
| ------ | ------------------ | -------------------------------------- |
| `POST` | `/api/agents/mint` | Register a new agent identity on-chain |
| `GET`  | `/api/agents`      | List all registered agents             |

### System

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| `GET`  | `/health`               | Backend health check     |
| `GET`  | `/api/treasury/balance` | Current treasury balance |

---

## Agent System

### Marketing Agent

- Generates campaign proposals using an LLM prompt chain (LangChain + Groq)
- Each proposal includes: campaign name, objective, target audience, estimated ROI, and requested budget
- Submits proposals to the backend REST API, which writes them on-chain

### Finance Agent

- Polls for pending proposals via the backend
- Evaluates each proposal against configurable rules: budget cap, ROI threshold, treasury reserve ratio
- Approves or rejects on-chain by calling the `GovernorDAO` contract through the backend
- Logs all decisions with reasoning for auditability

### Autonomous Loop (`run_autonomous_loop.py`)

```
[Marketing Agent] Generate proposal
        ↓
[Backend] Submit to GovernorDAO on-chain
        ↓
[Finance Agent] Evaluate & vote
        ↓
[GovernorDAO] Timelock period
        ↓
[Backend] Execute → Treasury releases funds
```

The loop runs on a configurable interval (`LOOP_INTERVAL_SECONDS`). For demos, the trigger panel on the frontend dashboard can kick off a single loop iteration manually.

---

## Monad Testnet

| Setting        | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| Chain ID       | `10143`                                                           |
| RPC URL        | `https://testnet-rpc.monad.xyz/`                                  |
| Block Explorer | [explorer.testnet.monad.xyz](https://explorer.testnet.monad.xyz/) |
| Faucet         | [faucet.monad.xyz](https://faucet.monad.xyz/)                     |
| Currency       | MON (testnet)                                                     |

Deployed contract addresses live in [`config/deployments.json`](config/deployments.json).

---

## Project Structure

```
AgentDAO/
├── config/
│   └── deployments.json          # Contract addresses per network
├── contracts/
│   ├── src/
│   │   ├── AgentRegistry.sol
│   │   ├── AgentTreasury.sol
│   │   └── GovernorDAO.sol
│   ├── test/
│   ├── script/
│   │   └── Deploy.s.sol
│   └── foundry.toml
├── backend/
│   ├── src/
│   │   ├── routes/               # Express route handlers
│   │   ├── services/             # viem chain interactions
│   │   └── index.ts
│   ├── scripts/
│   │   ├── manual-flow-test.ts   # On-chain integration test
│   │   └── test-endpoints.ps1    # REST API smoke test
│   └── package.json
├── agents/
│   ├── src/
│   │   ├── main.py               # Health check server
│   │   ├── marketing_agent.py
│   │   └── finance_agent.py
│   ├── scripts/
│   │   ├── run_autonomous_loop.py
│   │   └── test_agents.py        # Offline LLM tests
│   └── requirements.txt
├── frontend/
│   ├── app/                      # Next.js app router
│   ├── components/
│   └── package.json
└── docs/
    ├── architecture.md
    ├── deployment.md
    ├── demo-guide.md
    ├── api-examples.md
    └── development/
        └── agent-testing.md
```

---

## Development Scripts

| Script                   | Location           | Purpose                                                   |
| ------------------------ | ------------------ | --------------------------------------------------------- |
| `run_autonomous_loop.py` | `agents/scripts/`  | Full end-to-end AI + on-chain autonomous loop             |
| `test_agents.py`         | `agents/scripts/`  | Offline LLM agent unit tests (no chain needed)            |
| `manual-flow-test.ts`    | `backend/scripts/` | On-chain integration test for the full proposal lifecycle |
| `test-endpoints.ps1`     | `backend/scripts/` | PowerShell REST API smoke test                            |

---

## Troubleshooting

**Backend can't connect to Monad testnet**

- Verify `MONAD_RPC_URL` is set correctly and the testnet is reachable: `curl https://testnet-rpc.monad.xyz/`
- Check your wallet has testnet MON for gas - use the [faucet](https://faucet.monad.xyz/)

**Agents fail with Groq API errors**

- Confirm `GROQ_API_KEY` is valid at [console.groq.com](https://console.groq.com/keys)
- Groq free tier has rate limits; add a delay between loop iterations via `LOOP_INTERVAL_SECONDS`

**Proposal execution reverts**

- The timelock period must have fully elapsed before execution
- Ensure the treasury holds sufficient MON to cover the requested budget

**Frontend shows no data**

- Verify `NEXT_PUBLIC_API_URL` points to a running backend instance
- Check browser console for CORS errors - backend defaults to `localhost:3001`

---

## Security

> ⚠️ This project targets **Monad testnet only**. Do not use with mainnet funds or real assets.

- Never commit `.env` files or private keys to version control - add them to `.gitignore`
- Backend write endpoints (`POST /api/proposals`, `/api/agents/mint`, vote, execute) are **unauthenticated** - this is intentional for local development; add auth middleware before any public deployment
- Rotate any private key that may have been accidentally exposed
- The frontend trigger panel is for demo convenience; use `agents/scripts/run_autonomous_loop.py` for real autonomous execution
- Smart contracts are unaudited - treat all on-chain state as disposable testnet data

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo and create a feature branch (`git checkout -b feat/your-feature`)
2. Follow existing code style - Prettier for JS/TS, Black for Python, `forge fmt` for Solidity
3. Add or update tests for any changed logic
4. Open a pull request with a clear description of the change and why

For larger changes, open an issue first to discuss the approach.

---

## Documentation

| Doc                                                | Description                                          |
| -------------------------------------------------- | ---------------------------------------------------- |
| [Architecture](docs/architecture.md)               | System design, data flows, and contract interactions |
| [Deployment](docs/deployment.md)                   | Step-by-step deployment to Monad testnet             |
| [Demo Guide](docs/demo-guide.md)                   | Walkthrough for showcasing AgentDAO end-to-end       |
| [API Examples](docs/api-examples.md)               | cURL and JS examples for every endpoint              |
| [Agent Testing](docs/development/agent-testing.md) | How to test agents offline without a live chain      |

---

## License

MIT - see [LICENSE](LICENSE).

---

<p align="center">Built with ☕ on <a href="https://monad.xyz">Monad</a></p>
