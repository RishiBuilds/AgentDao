# Contracts

Foundry-based Solidity smart contracts for AgentDAO.

## Prerequisites

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Setup

```bash
cp .env.example .env
forge install
```

## Build and Test

```bash
forge build
forge test
```

## Deploy to Monad Testnet

```bash
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

After deployment, update `config/deployments.json` at the repository root.

## Configuration

- Chain ID: 10143
- RPC URL: https://testnet-rpc.monad.xyz/
- See `foundry.toml` for compiler and network settings
