# API Endpoint Testing Script for AgentDAO Backend
Write-Host "`n=== AGENTDAO BACKEND API TEST ===" -ForegroundColor Cyan
Write-Host "Testing all REST API endpoints`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"

# Test 1: Health Check
Write-Host "`n[TEST 1] GET /health" -ForegroundColor Yellow
$response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/health" -Method GET
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Response: $($response.Content)`n"

# Test 2: Get Current Block
Write-Host "`n[TEST 2] GET /api/block" -ForegroundColor Yellow
$response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/block" -Method GET
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Response: $($response.Content)`n"

# Test 3: Get Treasury Balance
Write-Host "`n[TEST 3] GET /api/treasury/balance" -ForegroundColor Yellow
$response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/treasury/balance" -Method GET
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Response: $($response.Content)`n"

# Test 4: Get Agents
Write-Host "`n[TEST 4] GET /api/agents" -ForegroundColor Yellow
$response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/agents" -Method GET
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Response: $($response.Content)`n"

# Test 5: Mint Agent
Write-Host "`n[TEST 5] POST /api/agents/mint" -ForegroundColor Yellow
$body = @{
    to = "0xE902143bf447c5F7C2342509F712Dc4492207D75"
    name = "TestAgent"
    role = "Marketing"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/agents/mint" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)`n"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Error: $($reader.ReadToEnd())`n" -ForegroundColor Red
}

# Test 6: Create Proposal
Write-Host "`n[TEST 6] POST /api/proposals" -ForegroundColor Yellow
$body = @{
    description = "Test proposal - Release funds for marketing"
    target = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
    amount = "0.01"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/proposals" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)`n"
    
    # Parse proposal ID for next tests
    $proposalData = $response.Content | ConvertFrom-Json
    $proposalId = $proposalData.data.proposalId
    Write-Host "Proposal ID created: $proposalId" -ForegroundColor Magenta
    
    # Test 7: Get Proposal Details
    Write-Host "`n[TEST 7] GET /api/proposals/$proposalId" -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/proposals/$proposalId" -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)`n"
    
    # Test 8: Cast Vote
    Write-Host "`n[TEST 8] POST /api/proposals/$proposalId/vote" -ForegroundColor Yellow
    Write-Host "Waiting for voting delay (a few blocks)..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
    
    $voteBody = @{
        support = $true
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/proposals/$proposalId/vote" -Method POST -Body $voteBody -ContentType "application/json"
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)`n"
        
        # Check proposal state after voting
        Write-Host "`n[TEST 9] GET /api/proposals/$proposalId (after vote)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/proposals/$proposalId" -Method GET
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)`n"
        
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Error: $($reader.ReadToEnd())`n" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Error: $($reader.ReadToEnd())`n" -ForegroundColor Red
}

Write-Host "`n=== ALL ENDPOINT TESTS COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nNote: Execute endpoint test will be done in manual-flow-test.ts" -ForegroundColor Gray
