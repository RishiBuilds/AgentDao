# AgentDAO AI Agents

Python AI agents for marketing proposals and finance evaluation.

## Setup

```bash
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key (required) |
| `BACKEND_URL` | Backend REST API URL |
| `TREASURY_BUDGET` | Budget for offline tests (MON) |
| `LOG_LEVEL` | Logging level |

## Scripts

Run from the `agents/` directory:

```bash
# Offline LLM tests (no blockchain)
python scripts/test_agents.py

# Full autonomous loop (requires backend running)
python scripts/run_autonomous_loop.py

# Health check API
python src/main.py
```

## Agents

| Module | Purpose |
|--------|---------|
| `marketing_agent.py` | Generates campaign proposals |
| `finance_agent.py` | Approves or rejects proposals |
| `orchestrator.py` | Offline multi-scenario runner |
| `autonomous_orchestrator.py` | Full loop with backend + chain |

See [docs/development/agent-testing.md](../docs/development/agent-testing.md) for testing details.
