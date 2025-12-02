# Nexus Water XRPL - Real World Asset Environmental DEX

<div align="center">

**🌊 Tokenizing Environmental Impact on the XRP Ledger 🌍**

[![XRPL Devnet](https://img.shields.io/badge/XRPL-Devnet-25D695?style=flat-square&logo=ripple)](https://xrpl.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[**🚀 Open App**](http://localhost:5000) · [**📖 Documentation**](#overview) · [**� GitHub**](https://github.com/nexuswater/NEXUS-DEMO)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [Frontend Components](#frontend-components)
- [XRPL Integration](#xrpl-integration)
- [Oracle System](#oracle-system)
- [Device Management](#device-management)
- [Environment Configuration](#environment-configuration)
- [Development Workflow](#development-workflow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Nexus Water XRPL** is a comprehensive Web3 platform that bridges real-world environmental assets with blockchain technology. Built on the XRP Ledger (XRPL), it enables the tokenization, trading, and retirement of verified environmental credits—specifically water conservation (WTR) and energy efficiency (ENG) tokens.

The platform transforms IoT device data and utility records into tradable Real World Assets (RWA) using XRPL's Multi-Purpose Token (MPT) standard, creating a transparent, liquid market for environmental impact.

> **⚠️ DEVNET DEMO**: This is a demonstration application running on XRPL Devnet. Secure wallet integration (WalletConnect, Crossmark, Gem Wallet, etc.) is planned for production. Current authentication uses seed phrases for testing purposes only.

### 🎯 Mission

Transform environmental conservation into **liquid digital capital** while maintaining verifiable on-chain provenance and enabling global trading of sustainability credits.

---

## ✨ Key Features

### 🔐 Blockchain Integration (Devnet)
- **XRPL Devnet Integration** - Full XRP Ledger connectivity with Multi-Purpose Tokens (MPT)
- **Demo Wallet Authentication** - Seed phrase-based testing (secure wallet integration planned)
- **Real-time Balance Monitoring** - XRP, WTR, and ENG token balances with reserve calculations
- **Trustline Management** - Automated MPT authorization and holder opt-in

### 💧 Environmental Asset Tokenization
- **Water Credits (WTR)** - Tokenized water savings verified through IoT devices
- **Energy Credits (ENG)** - Energy efficiency tokens (work in progress)
- **Device Registration** - Link physical IoT devices to blockchain accounts
- **Oracle Data Integration** - Automated data fetching and verification from trusted oracles

### 🏪 Marketplace & Trading
- **Asset Marketplace** - Browse and explore environmental tokens
- **Asset Explorer** - Comprehensive view of all minted batches and devices
- **Token Transfers** - Direct peer-to-peer transfers
- **Advanced Trading** - Escrow and batch transactions (in development)

### 📊 Analytics & Transparency
- **Device Dashboard** - Real-time monitoring of registered devices
- **Oracle Verification** - On-chain data validation with TOV (Token of Value) calculations
- **Asset Classification** - Tiered asset classes (A/B/C/D) based on verification quality
- **Historical Tracking** - Complete audit trail of all transactions and claims

### 🎨 Modern User Experience
- **Responsive Design** - Mobile-first UI with Tailwind CSS and shadcn/ui
- **Real-time Updates** - React Query for optimistic updates and caching
- **Toast Notifications** - User-friendly transaction feedback
- **Skeleton Loading** - Polished loading states throughout the app

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Mint Page  │  │  Marketplace │  │   Explorer   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                │
│                            │                                    │
│                   ┌────────▼────────┐                          │
│                   │  Layout/Wallet  │                          │
│                   │   Context       │                          │
│                   └────────┬────────┘                          │
└────────────────────────────┼───────────────────────────────────┘
                             │ HTTPS/WS
┌────────────────────────────▼───────────────────────────────────┐
│                    Backend (Express.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Device Routes│  │ Oracle Routes│  │   MPT Routes │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         ├──────────────────┴──────────────────┤                │
│         │                                     │                 │
│  ┌──────▼────────┐                   ┌───────▼────────┐       │
│  │  SQLite DBs   │                   │  MPT Manager   │       │
│  │  (devices,    │                   │  (XRPL Client) │       │
│  │  oracleData)  │                   └───────┬────────┘       │
│  └───────────────┘                           │                 │
└──────────────────────────────────────────────┼─────────────────┘
                                               │
┌──────────────────────────────────────────────▼─────────────────┐
│                    XRPL Devnet Network                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ MPT Issuance │  │   Payments   │  │   Escrows    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Device Registration** → User registers IoT device → Stored in SQLite
2. **Oracle Data Fetch** → Backend queries oracle → Validates & stores in device-specific DB
3. **Token Minting** → TOV calculated → MPT payment issued → Device stats updated
4. **Marketplace Trading** → Escrow created → Batch transaction assembled → Atomic execution

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.x |
| **Vite** | Build Tool & Dev Server | 5.x |
| **Wouter** | Client-side Routing | Latest |
| **TanStack Query** | Server State Management | 5.x |
| **Tailwind CSS** | Utility-first Styling | 3.x |
| **shadcn/ui** | Component Library | Latest |
| **Radix UI** | Headless Components | Latest |
| **Framer Motion** | Animations | Latest |
| **xrpl.js** | XRPL SDK | Latest |
| **Lucide React** | Icons | Latest |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Express** | Web Framework | Latest |
| **TypeScript** | Type Safety | 5.x |
| **xrpl.js** | XRPL Integration | Latest |
| **better-sqlite3** | Local Database | 12.x |
| **Drizzle ORM** | Database ORM (optional) | Latest |
| **dotenv** | Environment Config | Latest |

### Database
- **SQLite** - Device registry and oracle data storage
- **PostgreSQL** - (Optional) Extended with Drizzle ORM for users

### Blockchain
- **XRPL Devnet** - Development blockchain network
- **Multi-Purpose Tokens (MPT)** - XRPL's native token standard
- **XLS-85d** - Token Escrow specification
- **XLS-56** - Batch Transaction specification

---

## 🚀 Getting Started

> **⚠️ Important**: This is a development demo on XRPL Devnet. Use only test accounts and never share real private keys.

### Prerequisites

```bash
# Required
node >= 18.0.0
npm >= 9.0.0
```

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/nexuswater/NEXUS-DEMO.git
cd NexusWaterXRPL
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:

```env
# XRPL Configuration (Devnet Only)
WTR_ISSUER_ADDRESS=rYourDevnetAddress
WTR_ISSUER_SEED=sYourDevnetSeed
WTR_MPT_ID=YourMPTIssuanceID

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Development Mode

**Option 1: Full Stack (Recommended)**
```bash
npm run dev
```
This starts both the Express backend and Vite frontend concurrently.

**Option 2: Frontend Only**
```bash
npm run dev:client
```

**Option 3: Backend Only**
```bash
npm run dev
```

### Access the Application

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Quick Start Guide

1. **Get Test XRP** - Visit [XRPL Devnet Faucet](https://faucet.devnet.rippletest.net/) to create a test account
2. **Connect Wallet** - Enter your devnet seed in the login modal
3. **Opt-in to WTR Token** - Authorize to receive water credits
4. **Register a Device** - Add an IoT device to start minting tokens

---

## 📁 Project Structure

```
NexusWaterXRPL/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── layout/              # Layout components (Header, Nav)
│   │   │   ├── modals/              # Modal dialogs (Oracle, Transactions)
│   │   │   ├── ui/                  # shadcn/ui components (40+ components)
│   │   │   ├── AddDeviceModal.tsx   # Device registration modal
│   │   │   └── RemoveDeviceModal.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── login.tsx            # Wallet authentication
│   │   │   ├── useAccountBalances.ts # Balance fetching
│   │   │   ├── useDevices.ts        # Device management
│   │   │   ├── manageMptMint.tsx    # MPT minting logic
│   │   │   ├── manageOracleData.tsx # Oracle data operations
│   │   │   └── tokenEscrow.tsx      # Escrow management
│   │   ├── lib/                     # Utility functions
│   │   │   ├── utils.ts             # Helper functions (cn, etc.)
│   │   │   ├── queryClient.ts       # TanStack Query config
│   │   │   └── mockData.ts          # Mock batch data
│   │   ├── pages/                   # Application pages
│   │   │   ├── home.tsx             # Landing page with stats
│   │   │   ├── mint.tsx             # Token minting interface
│   │   │   ├── marketplace.tsx      # Asset marketplace
│   │   │   ├── explorer.tsx         # Batch/device explorer
│   │   │   ├── retire.tsx           # Asset retirement
│   │   │   └── not-found.tsx        # 404 page
│   │   ├── App.tsx                  # Root component with routing
│   │   ├── main.tsx                 # Application entry point
│   │   └── index.css                # Global styles (Tailwind)
│   └── index.html                   # HTML template
│
├── server/                          # Backend Express application
│   ├── index.ts                     # Server entry point & config
│   ├── routes.ts                    # Main route registration
│   ├── vite.ts                      # Vite integration for dev
│   ├── deviceRoutes.ts              # Device CRUD endpoints
│   ├── devicesDb.ts                 # Device database operations
│   ├── oracleRoutes.ts              # Oracle data endpoints
│   ├── fetchOracleData.ts           # Oracle data fetching logic
│   ├── multiPurposeTokens.ts        # MPT manager (mint/authorize)
│   ├── tokenEscrow.js               # XLS-85d escrow implementation
│   ├── tokenEscrowOffer.ts          # Escrow offer management
│   ├── batchExchange.ts             # XLS-56 batch transaction builder
│   ├── batchTransactionManager.js   # Batch transaction utilities
│   ├── userRoutes.ts                # User management routes
│   ├── usersDb.ts                   # User database operations
│   └── storage.ts                   # Storage interface (extensible)
│
├── shared/                          # Shared types & schemas
│   └── schema.ts                    # Drizzle ORM schema definitions
│
├── coreDB/                          # SQLite databases
│   ├── devices.db                   # Device registry (auto-created)
│   └── oracleData/                  # Per-device oracle data DBs
│       └── {oracleIndex}.db         # Individual device data
│
├── attached_assets/                 # Static assets & images
│   └── generated_images/            # UI graphics
│
├── BatchSignerTool/                 # Companion project (separate workspace)
│   ├── batchSignerTool.js           # Multi-party batch signing CLI
│   ├── accountSetup.js              # Test account generator
│   └── Examples/                    # Example batch transactions
│
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── postcss.config.js                # PostCSS configuration
├── drizzle.config.ts                # Drizzle ORM configuration
├── components.json                  # shadcn/ui configuration
└── README.md                        # This file
```

---

## 🧠 Core Concepts

### Multi-Purpose Tokens (MPT)

MPTs are XRPL's native token standard that enables:
- **Issuer Control** - Centralized or decentralized token management
- **Holder Authorization** - Opt-in trustline model
- **AssetScale** - Fractional token support (e.g., 2 decimals for cents)
- **Payment Integration** - Seamless transfers via XRPL Payment transactions

**WTR Token Flow:**
```
1. Issuer creates MPT with AssetScale=2
2. Holder opts-in via MPTokenAuthorize
3. Issuer authorizes holder
4. Payments transfer MPT units (100 = 1.00 WTR)
```

### Oracle System

The oracle system validates real-world environmental data:

1. **Data Source** - IoT devices or utility APIs submit data via XRPL transactions
2. **Memo Fields** - JSON-encoded data stored in transaction memos
3. **Verification** - Backend parses and validates data structure
4. **Storage** - Device-specific SQLite database with full audit trail
5. **TOV Calculation** - Token of Value computed based on verified data

**Oracle Data Structure:**
```json
{
  "uuid": "device-unique-id",
  "provider": "IoT Device or Utility",
  "assetClass": "ClassA|ClassB|ClassC|ClassD",
  "timestamp": 1234567890,
  "dataPoints": {
    "volume": 1000,
    "unit": "liters",
    "verified": true
  }
}
```

### Asset Classification

Environmental assets are tiered by verification quality:

| Class | Multiplier | Verification | Example |
|-------|-----------|--------------|---------|
| **Class A** | 100x | Direct IoT + Utility | Smart meter + bill verification |
| **Class B** | 75x | IoT-only | Smart meter data |
| **Class C** | 50x | Utility-only | Monthly bill submission |
| **Class D** | 25x | Self-reported | User attestation |

**TOV Formula:** `TOV × Class Multiplier = Minted Tokens`

### Token Escrow (XLS-85d)

Secure, time-locked token holding:
- **Create Escrow** - Lock tokens with CancelAfter timestamp
- **Finish Escrow** - Release tokens to destination
- **Cancel Escrow** - Return tokens after expiration

### Batch Transactions (XLS-56)

Atomic multi-transaction operations:
- **All-or-Nothing** - Entire batch succeeds or fails
- **Multi-Party Signing** - Independent BatchSigner signatures
- **Use Cases** - Complex marketplace exchanges, atomic swaps

---

## 🎨 Frontend Components

### Core Pages

#### **Home** (`pages/home.tsx`)
- Hero section with platform stats
- Feature highlights (Water Credits, Energy Efficiency, Blockchain Security)
- Call-to-action buttons to Mint and Explorer

#### **Mint** (`pages/mint.tsx`)
- Device selection and registration
- Oracle data fetching interface
- TOV calculation and display
- MPT minting with transaction feedback
- Reward reduction calculator
- Multi-step workflow with progress indicators

#### **Marketplace** (`pages/marketplace.tsx`)
- Asset browsing with search and filters
- Token offer creation (buy/sell)
- Batch transfer interface
- Real-time pricing and availability

#### **Explorer** (`pages/explorer.tsx`)
- Searchable table of all devices and batches
- Oracle detail drill-down
- Asset verification status
- Vintage and classification display

#### **Retire** (`pages/retire.tsx`)
- Asset retirement interface
- Carbon offset tracking

### Layout Components

#### **Layout** (`components/layout/Layout.tsx`)
- Responsive navigation (desktop sidebar, mobile sheet)
- Wallet connection manager
- Balance display (XRP, WTR, ENG)
- Network status indicator
- React Context for global wallet state

### Modal Components

| Modal | Purpose | Location |
|-------|---------|----------|
| `oracleData.tsx` | Oracle data fetch interface | `components/modals/` |
| `oracleDataStatusModal.tsx` | Fetch progress indicator | `components/modals/` |
| `oracleDataSuccess.tsx` | Success confirmation | `components/modals/` |
| `txnResult.tsx` | Transaction result display | `components/modals/` |
| `tokenOfferModal.tsx` | Create token offers | `components/modals/` |
| `AddDeviceModal.tsx` | Device registration form | `components/` |
| `RemoveDeviceModal.tsx` | Device removal confirmation | `components/` |

### Custom Hooks

| Hook | Purpose | File |
|------|---------|------|
| `useAccountBalances` | Fetch and track XRPL balances | `hooks/useAccountBalances.ts` |
| `useDevices` | Device CRUD operations | `hooks/useDevices.ts` |
| `useExplorerDevices` | Fetch global device list | `hooks/useExplorerDevices.ts` |
| `useManageOracleData` | Oracle data operations | `hooks/manageOracleData.tsx` |
| `useManageMptMint` | MPT minting workflow | `hooks/manageMptMint.tsx` |
| `useTokenEscrow` | Escrow management | `hooks/tokenEscrow.tsx` |

---

## 🔗 XRPL Integration

### Connection Management

The app uses **xrpl.js** for all blockchain interactions:

```typescript
import * as xrpl from "xrpl";

const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");
await client.connect();
```

### Wallet Authentication

Users authenticate with their XRPL seed phrase:

1. User enters seed in login modal
2. Wallet object created: `xrpl.Wallet.fromSeed(seed)`
3. Account info fetched via `account_info` request
4. Trustlines queried via `account_lines` request
5. Balances parsed and displayed in UI

### Transaction Flow

**Example: MPT Payment**

```typescript
const transaction = {
  TransactionType: "Payment",
  Account: issuerAddress,
  Destination: holderAddress,
  Amount: {
    mpt_issuance_id: MPT_ID,
    value: "10000" // 100.00 WTR (AssetScale=2)
  }
};

const wallet = xrpl.Wallet.fromSeed(issuerSeed);
const response = await client.submitAndWait(transaction, { wallet });
```

### Key XRPL Features Used

| Feature | XRPL Transaction Type | Purpose |
|---------|----------------------|---------|
| MPT Authorization | `MPTokenAuthorize` | Holder opt-in and issuer approval |
| Token Payments | `Payment` with MPT Amount | Transfer WTR/ENG tokens |
| Escrow Creation | `EscrowCreate` | Lock tokens with time conditions |
| Escrow Release | `EscrowFinish` | Complete escrow after conditions met |
| Batch Transactions | `Batch` (XLS-56) | Atomic multi-transaction operations |
| Account Info | `account_info` | Balance and reserve queries |
| Account Lines | `account_lines` | Trustline status |
| Account Transactions | `account_tx` | Transaction history for oracle parsing |

---

## 🔮 Oracle System

### Architecture

The oracle system is a **hybrid on-chain/off-chain** design:

1. **On-Chain Data** - Environmental data posted as XRPL transactions with memos
2. **Off-Chain Parsing** - Backend fetches and validates transaction history
3. **Local Storage** - Verified data stored in device-specific SQLite DBs
4. **TOV Calculation** - Backend computes Token of Value from aggregated data

### Data Fetching Process

```typescript
// 1. Fetch all transactions for oracle account
const txResp = await client.request({
  command: 'account_tx',
  account: oracleAccount,
  ledger_index_min: -1,
  ledger_index_max: -1,
  limit: 400
});

// 2. Filter for memo-bearing transactions
const memoTxns = txResp.result.transactions.filter(tx => 
  tx.tx?.Memos && tx.tx.Memos.length > 0
);

// 3. Parse memo data (hex to JSON)
const memoData = JSON.parse(hexToAscii(tx.Memos[0].Memo.MemoData));

// 4. Validate and store in SQLite
db.prepare(`INSERT INTO oracle_data (...) VALUES (...)`).run(...);
```

### Database Schema

**Device Registry** (`coreDB/devices.db`):
```sql
CREATE TABLE devices (
  name TEXT PRIMARY KEY,
  description TEXT,
  region TEXT,
  tech TEXT,
  oracleIndex TEXT UNIQUE,
  account TEXT,
  createdAt TEXT,
  lastFetchTime TEXT,
  dataRecorded INTEGER,
  wtrClaims INTEGER,
  wtrReceived INTEGER,
  lastWtrClaim TEXT
);
```

**Oracle Data** (`coreDB/oracleData/{oracleIndex}.db`):
```sql
CREATE TABLE oracle_data (
  uuid TEXT PRIMARY KEY,
  provider TEXT,
  assetClass TEXT,
  timestamp INTEGER,
  hash TEXT,
  ledger_index INTEGER,
  TransactionResult TEXT,
  -- Dynamic columns based on data structure
  volume REAL,
  unit TEXT,
  verified INTEGER
);
```

### TOV Calculation

Token of Value is computed based on oracle data volume and classification:

```typescript
// Example: Water volume calculation
const volume = oracleData.reduce((sum, record) => sum + record.volume, 0);
const assetClass = oracleData[0].assetClass; // e.g., "ClassA"

let multiplier = 0;
if (assetClass === 'ClassA') multiplier = 100;
else if (assetClass === 'ClassB') multiplier = 75;
else if (assetClass === 'ClassC') multiplier = 50;
else if (assetClass === 'ClassD') multiplier = 25;

const TOV = volume; // Base token value
const mintAmount = TOV * multiplier; // Final tokens to mint
```

---

## 📱 Device Management

### Device Lifecycle

1. **Registration** - User adds device via `AddDeviceModal`
2. **Oracle Linking** - Device associated with oracle index
3. **Data Fetching** - Periodic oracle data queries
4. **Token Claiming** - User mints tokens based on verified data
5. **Deactivation** - User removes device (retains historical data)

### Device Types

| Type | Description | Technology |
|------|-------------|------------|
| **WTR** | Water meters and sensors | IoT Smart Meters, Utility API |
| **ENG** | Energy monitoring devices | Smart plugs, Utility API (WIP) |

### Multi-Device Support

- Users can register multiple devices per account
- Each device has unique oracle index
- Device-specific databases maintain separate audit trails
- Aggregated claims/rewards tracked at account level



---

## ⚙️ Environment Configuration

> **🔒 Security Notice**: This demo uses seed phrase authentication for testing on Devnet only. Never expose production seeds or private keys in environment variables or source code.

### Required Environment Variables

Create a `.env` file in the project root:

```env
# XRPL Issuer Configuration (Devnet)
WTR_ISSUER_ADDRESS=rYourDevnetIssuerAddress
WTR_ISSUER_SEED=sYourDevnetIssuerSeed
WTR_MPT_ID=YourMPTIssuanceID

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Quick Setup for Testing

1. **Get Devnet XRP**: Visit [XRPL Devnet Faucet](https://faucet.devnet.rippletest.net/)
2. **Configure Issuer**: Add your devnet issuer credentials to `.env`
3. **Start Application**: Run `npm run dev`
4. **Connect Wallet**: Use your devnet account seed in the login modal

---

## 🔧 Development Workflow

### Hot Reload

Both frontend and backend support hot reload:
- **Vite** - Instant HMR for React components
- **tsx** - Auto-restart on server file changes

### Type Safety

TypeScript is enforced across the entire stack:

```bash
# Type check without emitting files
npm run check
```

### Database Migrations

For PostgreSQL with Drizzle ORM:

```bash
# Push schema changes to database
npm run db:push
```

### Debugging

**Frontend:**
- React DevTools extension
- TanStack Query DevTools (built-in)

**Backend:**
- Console logs with request timing
- XRPL transaction responses logged to terminal

### Code Organization

**Naming Conventions:**
- Components: `PascalCase` (e.g., `AddDeviceModal.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAccountBalances.ts`)
- API Routes: `kebab-case` (e.g., `/api/oracle-data/fetch`)
- Database fields: `camelCase` (e.g., `lastFetchTime`)

**File Structure:**
- Collocate related code (e.g., device routes + device DB operations)
- Shared types in `/shared`
- Reusable UI in `/components/ui`

---

## �️ Roadmap

### Current Status (Devnet Demo)
- ✅ Core MPT minting and authorization
- ✅ Device registration and management
- ✅ Oracle data integration
- ✅ Basic marketplace UI
- ✅ Explorer and analytics

### Upcoming Features

#### Phase 1: Security & Authentication
- 🔜 **Wallet Integration** - WalletConnect, Crossmark, Gem Wallet support
- 🔜 **Secure Signing** - Remove seed phrase authentication
- 🔜 **Session Management** - JWT-based authentication for API calls
- 🔜 **Rate Limiting** - API protection and abuse prevention

#### Phase 2: Advanced Trading
- 🔜 **Token Escrow** - XLS-85d implementation for secure exchanges
- 🔜 **Batch Transactions** - XLS-56 atomic marketplace operations
- 🔜 **Order Book** - Buy/sell order matching
- 🔜 **Price Discovery** - Market-based pricing mechanisms

#### Phase 3: Enterprise Features
- 🔜 **Energy Credits ($ENG)** - Complete ENG token implementation
- 🔜 **Enhanced Oracles** - Multi-source verification
- 🔜 **Compliance Tools** - KYC/AML integration options
- 🔜 **API Gateway** - Public API for third-party integrations

#### Phase 4: Mainnet Preparation
- 🔜 **Security Audit** - Professional smart contract and code review
- 🔜 **Performance Optimization** - Scalability improvements
- 🔜 **Production Database** - Migration to PostgreSQL
- 🔜 **Monitoring & Analytics** - Real-time system health tracking

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with clear commit messages
4. Ensure `npm run check` passes (no TypeScript errors)
5. Test thoroughly in development mode
6. Submit a pull request with detailed description

### Code Style

- Follow existing patterns and conventions
- Use TypeScript for all new code
- Comment complex logic
- Keep functions small and focused
- Prefer composition over inheritance

### Commit Messages

Use conventional commits:
```
feat: Add device removal confirmation modal
fix: Correct TOV calculation for ClassB assets
docs: Update API endpoint documentation
refactor: Simplify oracle data fetching logic
```

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Nexus Water

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **XRPL Foundation** - For the robust blockchain infrastructure
- **Ripple** - For xrpl.js and excellent developer documentation
- **shadcn** - For the beautiful UI component library
- **Vercel** - For Vite and modern frontend tooling
- **Community Contributors** - For feedback and testing

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/nexuswater/NEXUS-DEMO/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nexuswater/NEXUS-DEMO/discussions)
- **Email**: support@nexuswater.example (update with real contact)

---

<div align="center">

**Built with 💧 by the Nexus Water Team**

[🌐 Website](http://localhost:5000) · [📖 Docs](#documentation) · [🐙 GitHub](https://github.com/nexuswater/NEXUS-DEMO)

</div>
