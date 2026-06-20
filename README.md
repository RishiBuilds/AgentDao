# AgentDAO

Autonomous AI agent DAO on Monad testnet. AI agents propose marketing campaigns, a finance agent approves or rejects them, and approved proposals flow through on-chain governance to release treasury funds.

## Architecture

```
┌─────────────┐     REST      ┌─────────────┐     viem      ┌──────────────────┐
│   Frontend  │ ────────────► │   Backend   │ ───────────► │ Smart Contracts  │
│  (Next.js)  │               │  (Express)  │              │     (Foundry)    │
└─────────────┘               └──────┬──────┘              └──────────────────┘
                                     ▲
                                     │ REST
                              ┌──────┴──────┐
                              │   Agents    │
                              │  (Python)   │
                              └─────────────┘
```

| Component | Stack | Purpose |
|-----------|-------|---------|
| `contracts/` | Solidity, Foundry | On-chain identity, treasury, and governance |
| `backend/` | Node.js, Express, viem | REST API and chain bridge |
| `agents/` | Python, LangChain, Groq | Marketing and finance AI agents |
| `frontend/` | Next.js, React, Tailwind | Monitoring dashboard |
| `config/` | JSON | Deployed contract addresses |

See [docs/architecture.md](docs/architecture.md) for details.

## Prerequisites

- Node.js 18+
- Python 3.10+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Groq API key ([console.groq.com](https://console.groq.com/keys)) for AI agents

## Quick Start

### 1. Smart contracts

```bash
cd contracts
cp .env.example .env   # add MONAD_RPC_URL and PRIVATE_KEY
forge install
forge build
forge test
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # add MONAD_RPC_URL and PRIVATE_KEY
npm run dev            # http://localhost:3001
```

### 3. Agents (optional)

```bash
cd agents
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add GROQ_API_KEY
python src/main.py       # health check on :8000
```

Run the full autonomous loop (requires backend running):

```bash
python scripts/run_autonomous_loop.py
```

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

## Monad Testnet

| Setting | Value |
|---------|-------|
| Chain ID | 10143 |
| RPC | https://testnet-rpc.monad.xyz/ |
| Explorer | https://explorer.testnet.monad.xyz/ |

Deployed contract addresses are in [config/deployments.json](config/deployments.json).

## Project Structure

```
AgentDao/
├── config/           # Deployment manifest
├── contracts/        # Foundry smart contracts
├── backend/          # Express API + viem chain bridge
├── agents/           # Python AI agents
├── frontend/         # Next.js dashboard
└── docs/             # Architecture and guides
```

## Development Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `run_autonomous_loop.py` | `agents/scripts/` | End-to-end AI + on-chain flow |
| `test_agents.py` | `agents/scripts/` | Offline LLM agent tests |
| `manual-flow-test.ts` | `backend/scripts/` | On-chain integration test |
| `test-endpoints.ps1` | `backend/scripts/` | REST API smoke test |

## Security

This project targets **Monad testnet only**. Do not use with mainnet funds.

- Never commit `.env` files or private keys
- Backend write endpoints (`/api/proposals`, `/api/agents/mint`, vote, execute) are **unauthenticated** — suitable for local development only
- Rotate any private key that may have been exposed
- The dashboard trigger panel simulates autonomous runs for demo purposes; use `agents/scripts/run_autonomous_loop.py` for real agent execution

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Demo guide](docs/demo-guide.md)
- [API examples](docs/api-examples.md)
- [Agent testing](docs/development/agent-testing.md)

## License

MIT — see [LICENSE](LICENSE).
