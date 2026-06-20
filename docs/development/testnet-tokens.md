# Get Monad Testnet Tokens

## Your Wallet Address
```
0xE902143bf447c5F7C2342509F712Dc4492207D75
```

## Current Balance
**0 MON** - You need tokens to deploy!

## How to Get Testnet Tokens

### Option 1: Official Monad Faucet (Recommended)
1. Visit: https://faucet.monad.xyz/
2. Paste your address: `0xE902143bf447c5F7C2342509F712Dc4492207D75`
3. Complete CAPTCHA
4. Click "Get Testnet MON"
5. Wait ~30 seconds

### Option 2: Chainstack Faucet
1. Visit: https://faucet.chainstack.com/monad-testnet-faucet
2. Paste your address: `0xE902143bf447c5F7C2342509F712Dc4492207D75`
3. Get up to 0.5 MON every 24 hours

### Option 3: QuickNode Faucet
1. Visit: https://faucet.quicknode.com/monad
2. Paste your address: `0xE902143bf447c5F7C2342509F712Dc4492207D75`
3. Request tokens

### Option 4: Alchemy Faucet
1. Visit: https://www.alchemy.com/faucets/monad-testnet
2. Paste your address: `0xE902143bf447c5F7C2342509F712Dc4492207D75`
3. Get testnet MON

## Verify You Have Funds

After requesting from faucet, check your balance:

```bash
cd contracts
cast balance 0xE902143bf447c5F7C2342509F712Dc4492207D75 --rpc-url https://testnet-rpc.monad.xyz/
```

You should see a number greater than 0 (displayed in wei). 

For example:
- `500000000000000000` = 0.5 MON
- `1000000000000000000` = 1 MON

## How Much Do You Need?

For deploying 3 contracts, you'll need approximately:
- **~0.01-0.05 MON** for deployment gas fees
- Most faucets give 0.1-1 MON, which is more than enough!

## Next Steps

1. **Get tokens from any faucet above**
2. **Wait ~1 minute** for transaction to confirm
3. **Tell me when you have tokens**
4. **I'll deploy the contracts immediately**

## Troubleshooting

**Faucet says "Already claimed"?**
- Try a different faucet from the list
- Wait 24 hours and try again
- Some faucets have cooldown periods

**Transaction pending forever?**
- Wait 2-3 minutes
- Check balance again
- Monad testnet might be slow sometimes

---

**Once you have tokens, let me know and I'll deploy immediately!** 🚀
