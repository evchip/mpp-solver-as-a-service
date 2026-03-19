# Demo Runbook

## Pre-demo checklist

- [ ] VPN on (Netherlands)
- [ ] Dev server running (`bun dev`)
- [ ] Solver funded on Polygon ($20+ USDC, some MATIC for gas)
- [ ] Solver funded on Tempo ($5+ USDC for gas/root posting)
- [ ] User passkey wallet funded ($10+ USDC)
- [ ] Verify CLOB auth works: `bun run scripts/test-clob.ts`

## Demo flow (live, ~3 minutes)

### 1. Search markets

```bash
tempo request -t -X GET "http://localhost:3000/api/polymarket?q=bitcoin"
```

Pick a market, note the `yesTokenId` and `yesPrice`.

### 2. Deposit into escrow on Tempo

```bash
# Set variables from step 1
TOKEN_ID="<yesTokenId from search>"
AMOUNT=1000000  # $1 in USDC (6 decimals)
SOLVER=0xa0dF29753C297cf0975e55B6bE7516EbB9A94fA9
ESCROW=0x7331A38bAa80aa37d88D893Ad135283c34c40370
USDC=0x20c000000000000000000000b9537d11c60e8b50
RECIPIENT=0x5BcfE51cb7fDA9cf2c91B1948916ff29bee72600  # your Polymarket Safe

# Generate order ID
ORDER_ID=$(cast keccak "demo-$(date +%s)")

# Convert token ID to bytes32
TOKEN_BYTES32=$(cast --to-bytes32 $TOKEN_ID 2>/dev/null || python3 -c "print('0x' + hex(int('$TOKEN_ID'))[2:].zfill(64))")

# Recipient hash
RECIPIENT_HASH=$(cast keccak $(cast abi-encode "f(address)" $RECIPIENT))

# Deadline (1 hour from now)
DEADLINE=$(($(date +%s) + 3600))

# Approve
cast send --rpc-url https://rpc.tempo.xyz \
  --tempo.access-key $USER_TEMPO_PRIVATE_KEY \
  --tempo.root-account 0xef0726ebc08c1f89dedf559163b7ec367c98c857 \
  --tempo.fee-token $USDC \
  $USDC "approve(address,uint256)" $ESCROW $AMOUNT

# Deposit
cast send --rpc-url https://rpc.tempo.xyz \
  --tempo.access-key $USER_TEMPO_PRIVATE_KEY \
  --tempo.root-account 0xef0726ebc08c1f89dedf559163b7ec367c98c857 \
  --tempo.fee-token $USDC \
  $ESCROW "deposit(bytes32,address,uint256,bytes32,bytes32,uint256)" \
  $ORDER_ID $SOLVER $AMOUNT $TOKEN_BYTES32 $RECIPIENT_HASH $DEADLINE
```

### 3. Fill via solver (MPP payment)

```bash
tempo request -X POST --json "{
  \"order_id\": \"$ORDER_ID\",
  \"recipient_polygon\": \"$RECIPIENT\"
}" http://localhost:3000/api/buy-position
```

This buys CTF on Polymarket, transfers to your Safe, verifies via Polygon RPC, builds merkle tree, posts root to Tempo.

### 4. Get proof

```bash
curl "http://localhost:3000/api/proof?orderId=$ORDER_ID"
```

### 5. Claim from escrow (solver settles)

```bash
# Use proof data from step 4
BATCH_INDEX=<batchIndex>
POSITION=<position>
POLYGON_TX=<polygonTxHash>
PROOF=<proof>

cast send --rpc-url https://rpc.tempo.xyz \
  --private-key $RELAYER_PRIVATE_KEY \
  --tempo.fee-token $USDC \
  $ESCROW "claimWithProof(bytes32,uint256,uint256,bytes32,bytes)" \
  $ORDER_ID $BATCH_INDEX $POSITION $POLYGON_TX $PROOF
```

### 6. Verify

- Show Polymarket portfolio: CTF tokens in your Safe
- Show Tempo explorer: escrow order settled
- Show Polygonscan: CTF transfer tx

## Talking points

- "Cross-chain actions, not cross-chain tokens"
- "One API call, one payment. An AI agent can do this."
- "Settlement is cryptographic, not optimistic. No 1-hour challenge period."
- "The verification uses Alchemy via MPP. MPP all the way down."
- "This is the same merkle proof architecture I built at t1 for cross-chain intent settlement."
- Stretch: "We could go further. The solver watches the position and sells when it hits a target. Make money on a foreign chain without ever touching it."
