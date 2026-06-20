# AgentDAO Backend API Examples

Base URL: `http://localhost:3001`

## PowerShell Examples (Windows)

### 1. Health Check
```powershell
curl -UseBasicParsing http://localhost:3001/health
```

### 2. Get Current Block Number
```powershell
curl -UseBasicParsing http://localhost:3001/api/block
```

### 3. Get Treasury Balance
```powershell
curl -UseBasicParsing http://localhost:3001/api/treasury/balance
```

### 4. List All Agents
```powershell
curl -UseBasicParsing http://localhost:3001/api/agents
```

### 5. Mint New Agent
```powershell
$body = @{
    to = "0xE902143bf447c5F7C2342509F712Dc4492207D75"
    name = "NewAgent"
    role = "Operations"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3001/api/agents/mint" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 6. Create Proposal
```powershell
$body = @{
    description = "Release funds for project X"
    target = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"
    amount = "0.5"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3001/api/proposals" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 7. Get Proposal Details
```powershell
curl -UseBasicParsing http://localhost:3001/api/proposals/0
```

### 8. Cast Vote
```powershell
$body = @{
    support = $true
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3001/api/proposals/0/vote" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 9. Execute Proposal
```powershell
Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3001/api/proposals/0/execute" `
  -Method POST
```

---

## Bash/curl Examples (Linux/Mac)

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Get Current Block Number
```bash
curl http://localhost:3001/api/block
```

### 3. Get Treasury Balance
```bash
curl http://localhost:3001/api/treasury/balance
```

### 4. List All Agents
```bash
curl http://localhost:3001/api/agents
```

### 5. Mint New Agent
```bash
curl -X POST http://localhost:3001/api/agents/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0xE902143bf447c5F7C2342509F712Dc4492207D75",
    "name": "NewAgent",
    "role": "Operations"
  }'
```

### 6. Create Proposal
```bash
curl -X POST http://localhost:3001/api/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Release funds for project X",
    "target": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "amount": "0.5"
  }'
```

### 7. Get Proposal Details
```bash
curl http://localhost:3001/api/proposals/0
```

### 8. Cast Vote
```bash
curl -X POST http://localhost:3001/api/proposals/0/vote \
  -H "Content-Type: application/json" \
  -d '{
    "support": true
  }'
```

### 9. Execute Proposal
```bash
curl -X POST http://localhost:3001/api/proposals/0/execute
```

---

## Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "tokenId": "0",
    "txHash": "0x1e01d75cb84f76899f0b185d6d044290dadc9c6c24a5143666763d1120eef2ea"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Missing required fields: description, target, amount"
}
```

### Proposal State Response
```json
{
  "success": true,
  "data": {
    "id": "0",
    "proposer": "0xE902143bf447c5F7C2342509F712Dc4492207D75",
    "description": "Release 0.1 MON for marketing campaign",
    "target": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "value": "100000000000000000",
    "startBlock": "39421062",
    "endBlock": "39421162",
    "forVotes": "1",
    "againstVotes": "0",
    "executed": false,
    "state": "Active",
    "stateId": 1
  }
}
```

## Proposal States
- `0` - Pending: Waiting for voting delay to pass
- `1` - Active: Currently accepting votes
- `2` - Defeated: Did not reach quorum or majority
- `3` - Succeeded: Passed and ready to execute
- `4` - Executed: Successfully executed

## Notes
- All amounts are in MON (Monad's native token)
- Addresses must be valid Ethereum checksummed addresses
- The wallet making requests must own an active agent identity to create proposals and vote
- Quorum is set to 2 votes in the deployed contracts
