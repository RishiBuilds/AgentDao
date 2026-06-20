# AgentDAO Frontend

Next.js dashboard for monitoring AgentDAO treasury, agents, and proposals.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL (default: http://localhost:3001) |
| `NEXT_PUBLIC_CHAIN_ID` | Monad testnet chain ID (10143) |
| `NEXT_PUBLIC_EXPLORER_URL` | Block explorer base URL |

## Notes

- Requires the backend running on port 3001 (or your configured URL).
- The trigger panel simulates autonomous runs for demo purposes. Use `agents/scripts/run_autonomous_loop.py` for real agent execution.
