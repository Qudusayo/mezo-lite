## Mezo Lite Mobile

Self-custodial, mobile-first MUSD wallet on Bitcoin-secured Mezo. Send, receive, and spend in USD (MUSD) with fast, low-fee settlement; one-tap swap UX and cash-link flows.

### Features
- USD unit-of-account with MUSD on Mezo Testnet
- P2P payments, QR scan, payment links (cash links)
- Donations with permit-style flows (gas-efficient approvals)
- Transaction history via Mezo explorer API
- Secure key handling with Dynamic Labs + device secure storage

### Tech Stack
- React Native + Expo (SDK 54), Expo Router, TypeScript
- nativewind (Tailwind for RN), Reanimated, @gorhom/bottom-sheet, Skia
- viem + ethers v6, Dynamic Labs (RN + viem extensions)
- Expo SecureStore, Camera, Linking, WebBrowser

---

## Getting Started

### Prerequisites
- Node 18+
- Expo CLI / EAS CLI
- iOS Simulator or Android Emulator (or a device with Expo Go/dev client)

### 1) Environment
Create a `.env` in the repo root with your Dynamic Labs environment id:

```
EXPO_PUBLIC_ENVIRONMENT_ID=your_dynamic_environment_id
```

That variable is required at runtime (see `utils/config.ts`).

### 2) Install deps

```bash
pnpm i # or npm i / yarn
```

### 3) Run

```bash
pnpm start            # starts Expo
pnpm android          # build/run Android dev client
pnpm ios              # build/run iOS dev client
```

### 4) Build (EAS)

```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

---

## Contracts & On-chain Interaction

### Network
- Chain: Mezo Testnet (`chainId: 31611`)
- RPC: `https://rpc.test.mezo.org`
- Explorer: `https://explorer.test.mezo.org/`

Configured in `utils/config.ts` via Dynamic Labs viem extension.

### Addresses
- MUSD (ERC20): `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`
- CashLink Escrow: `0xD60e914Ff6f3E86B3ACf060AF98152E38702fCcC`
- Donation recipient (example): `0x6e80164ea60673D64d5d6228beb684a1274Bb017`

Defined in `utils/constants.tsx`.

### ABIs
- `utils/abi.ts` exports:
  - `ERC20_ABI` (transfer, approve, allowance, balanceOf, nonces, DOMAIN_SEPARATOR)
  - `CASHLINK_ESCROW_ABI` (createCashlink, claim, revoke, events)
  - `DONATION_ABI` (donate, donateWithPermit)

### Read/Write Helpers
- `utils/contract-call.ts` provides:
  - `readContract(publicClient, params)` — viem `readContract`
  - `writeContract(publicClient, walletClient, request)` — prepare, sign, and `sendRawTransaction`, then wait for receipt

### Example Flows
- Cash Link create/claim: see `app/confirm-cash-link.tsx` and `app/claim-cash-link.tsx`
  - Reads allowance on MUSD, approves if needed, then calls escrow methods (`createCashlink`, `claim`) using viem `encodeFunctionData`.
- Donations: see `components/bottom-sheets/donations-bottom-sheet.tsx`
  - Reads MUSD `nonces`, computes permit data, and submits donate or donateWithPermit.

### Off-chain Indexing
- `utils/api.ts` calls Mezo Explorer API to fetch and normalize token transfer history for the wallet.

---

## Security Notes
- Keys remain client-side (Dynamic Labs RN + SecureStore). Never commit secrets.
- Always verify addresses before mainnet usage. Current config targets Mezo Testnet.


