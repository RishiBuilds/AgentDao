# AgentDAO Backend

Express REST API and viem chain bridge for AgentDAO.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Server runs at http://localhost:3001

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `MONAD_RPC_URL` | Monad testnet RPC URL |
| `PRIVATE_KEY` | Wallet key for signing transactions |

Contract addresses are loaded from `config/deployments.json` at the repository root.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run type-check` | Type check without emitting |

## Integration Scripts

See `scripts/` for on-chain integration tests and API smoke tests.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/agents` | List active agents |
| POST | `/api/agents/mint` | Mint agent identity |
| POST | `/api/proposals` | Create proposal |
| GET | `/api/proposals/:id` | Get proposal |
| POST | `/api/proposals/:id/vote` | Cast vote |
| POST | `/api/proposals/:id/execute` | Execute proposal |
| GET | `/api/treasury/balance` | Treasury balance |
| GET | `/api/block` | Current block number |

See [docs/api-examples.md](../docs/api-examples.md) for curl examples.
