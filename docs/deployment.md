# Deployment Guide

## Contract Deployment

1. Install Foundry and dependencies:

```bash
cd contracts
forge install
cp .env.example .env
```

2. Set `MONAD_RPC_URL` and `PRIVATE_KEY` in `contracts/.env`.

3. Build and test:

```bash
forge build
forge test
```

4. Deploy to Monad testnet:

```bash
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

5. Update [config/deployments.json](../config/deployments.json) with the new addresses and transaction hashes.

6. Copy ABIs to the backend if contracts changed:

```bash
cp out/AgentIdentity.sol/AgentIdentity.json ../backend/src/chain/abis/
cp out/AgentTreasury.sol/AgentTreasury.json ../backend/src/chain/abis/
cp out/AgentGovernor.sol/AgentGovernor.json ../backend/src/chain/abis/
```

Deployment broadcast records are stored in `contracts/broadcast/`.

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run build
npm start
```

## Agents

```bash
cd agents
python -m venv venv
pip install -r requirements.txt
cp .env.example .env
python scripts/run_autonomous_loop.py
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run build
npm start
```

Set `NEXT_PUBLIC_BACKEND_URL` to your backend URL in production.

## Current Testnet Deployment

See [config/deployments.json](../config/deployments.json) for contract addresses on Monad testnet (chain 10143).
