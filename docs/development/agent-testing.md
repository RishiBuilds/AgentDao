# Phase 4: AI Agent Testing Instructions

## Prerequisites

1. **Get a free Groq API key**:
   - Visit: https://console.groq.com/keys
   - Sign up (free)
   - Create an API key
   - Copy the key

2. **Configure environment**:
   ```bash
   cd agents
   ```
   
   Edit `.env` file and add your Groq API key:
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   TREASURY_BUDGET=1.0
   ```

3. **Install dependencies**:
   ```bash
   # Activate virtual environment (if not already active)
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   
   # Install packages
   pip install -r requirements.txt
   ```

## Running Tests

### Quick Test
```bash
python test_agents.py
```

This will:
1. Run 3 test scenarios (reasonable, overspending, ambiguous)
2. Show detailed console output
3. Generate `test_results.json` with structured outputs
4. Verify all requirements

### Expected Output

The script will show:
- 📢 Marketing Agent proposals
- 💼 Finance Agent reviews
- 🟢 APPROVED or 🔴 REJECTED decisions
- 📊 Summary statistics
- ✅ Verification checklist

## Test Scenarios

### Scenario 1: Reasonable Campaign (Expected: APPROVE)
- Small social media campaign
- Budget: ~0.15 MON (15% of treasury)
- Should be approved by Finance Agent

### Scenario 2: Overspending Campaign (Expected: REJECT)
- Massive multi-platform campaign
- Budget: ~0.8 MON (80% of treasury)
- Should be rejected by Finance Agent

### Scenario 3: Ambiguous/Edge Case
- Experimental campaign with uncertain ROI
- Budget: ~0.35 MON (35% of treasury)
- Finance Agent must provide clear reasoning

## Output Files

- `test_results.json` - Complete structured output with all proposals and decisions

## Verification Checklist

After running, verify:
- [ ] Both agents run without errors
- [ ] All JSON outputs are valid and parseable
- [ ] Scenario 1 is APPROVED
- [ ] Scenario 2 is REJECTED
- [ ] Scenario 3 has clear reasoning
- [ ] No blockchain code is called

## Troubleshooting

### "Please set GROQ_API_KEY"
- Make sure you've added your API key to `agents/.env`
- The key should start with `gsk_`

### Import errors
- Ensure you're in the agents directory
- Activate the virtual environment
- Run `pip install -r requirements.txt`

### JSON parsing errors
- The agents should return valid JSON
- If you see parsing errors, the LLM may have added extra text
- The code handles common markdown formatting

## Notes

- **NO blockchain code in this phase** - Pure AI reasoning
- Uses Groq's free tier with Llama 3.3 70B model
- Treasury budget is hardcoded at 1.0 MON for testing
- Each run takes ~30-60 seconds depending on API speed
