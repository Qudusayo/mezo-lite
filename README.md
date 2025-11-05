Unfortunatelty, Apple rejected my submission and couldn't be available for testflight because it crashed on iPad Air (5th Gen). If you would like to test the application on your personal device, you can [reach out to me here](https://www.qudusayo.pro/contact-me) so I can add you to my internal testing group prior to when I get the apple issue sorted.

## Mezo Lite

Mezo Lite is a lightweight, mobile-first experience for creating and claiming cash links on the Mezo testnet. The repository is a monorepo containing:

- **apps/mobile**: Now moved to [mobile branch](https://github.com/Qudusayo/mezo-lite/tree/mobile).
- **apps/web**: Next.js API + web app with NextAuth and Prisma (PostgreSQL)
- **contracts**: Hardhat project with `CashlinkEscrow.sol` and deployment utilities

### Monorepo Overview

- Package manager: `pnpm`
- Workspaces: `apps/*`, `contracts`
- Root scripts:
  - `pnpm dev`: run workspace `dev` scripts (web)
  - `pnpm ios`: run iOS app (Expo prebuild target)
  - `pnpm android`: run Android app (Expo prebuild target)
  - `pnpm build`: run workspace `build` scripts

### Prerequisites

- Node.js 18+ and `pnpm` (`npm i -g pnpm`)
- iOS: Xcode + CocoaPods
- Android: Android Studio + SDKs
- PostgreSQL database (for `apps/web`)

### Install

```bash
pnpm install
```

---

## Environment Configuration

### apps/web (.env)

Create `apps/web/.env` with:

```bash
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

# Auth
NEXTAUTH_SECRET="your-nextauth-secret"
AUTH_SECRET="jwt-signing-secret-for-mobile-session-tokens"

# Mobile <-> Web shared API key
X_AUTH_KEY="shared-api-key"
```

Notes:
- `X_AUTH_KEY` must match the mobile `EXPO_PUBLIC_X_AUTH_KEY`.
- `AUTH_SECRET` is used to sign the mobile session tokens.

## Database (Prisma)

From `apps/web`:

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

This sets up the schema defined in `apps/web/prisma/schema.prisma` with models: `User`, `Account`, `Session`, `VerificationToken`, `Cashlink`.

---

## Running the Apps

### Web (Next.js)

From repo root:

```bash
pnpm --filter web dev
# or
cd apps/web && pnpm dev
```

The app will start at `http://localhost:3000`.

### Mobile (Expo)

You can run directly via root scripts:

```bash
pnpm ios
# or
pnpm android
```

Or from `apps/mobile`:

```bash
pnpm start        # Expo dev server
pnpm ios          # Run iOS (requires prebuild/Xcode)
pnpm android      # Run Android (requires prebuild/Android Studio)
pnpm prebuild     # Generate native projects
pnpm prebuild-clean
```

Ensure the web API is running and reachable at the `API_URL` configured in `apps/mobile/services/auth.ts`.

### Contracts (Hardhat)

From `contracts`:

```bash
pnpm exec hardhat compile
pnpm exec hardhat test
pnpm exec hardhat node

# Example ignition deploy (edit module as needed)
# pnpm exec hardhat ignition deploy ./ignition/modules/CashlinkEscrow.ts --network <your-network>
```

`contracts/contracts/CashlinkEscrow.sol` contains the escrow logic used by the mobile app for cash links.

---

## API Endpoints

All endpoints are under Next.js App Router:

- `POST /api/mobile-auth`
  - Headers: `x-auth-key: ${X_AUTH_KEY}`
  - Body: `{ phoneNumber, username, walletAddress }`
  - Returns: `{ success, user, sessionToken }` (JWT signed with `AUTH_SECRET`)

- `POST /api/validate-session`
  - Headers: `Authorization: Bearer <sessionToken>`
  - Returns: `{ valid, user?, message }`

- `GET /api/cash-link`
  - Headers: `Authorization: Bearer <sessionToken>`
  - Returns: `{ [transactionHash]: code }` for the authenticated user

- `POST /api/cash-link`
  - Headers: `Authorization: Bearer <sessionToken>`
  - Body: `{ code, transactionHash }`
  - Creates a cash link for the authenticated user

- `POST /api/resolve-user`
  - Headers: `Authorization: Bearer <sessionToken>`
  - Body: `{ payload: usernameOrPhoneNumber }`
  - Returns: `{ success, user }` or 404


## License

MIT (unless noted otherwise in subpackages). Update if a different license applies.


