# [Open the app in your browser](http://localhost:5000)
#
# Nexus Water XRPL RWA Enviro Assets DEX

This project is a full-stack web application for trading, minting, retiring, and exploring environmental asset tokens (RWA) on the XRPL blockchain. It features a modern React frontend (Vite, Tailwind, shadcn/ui), an Express/TypeScript backend, and a mock in-memory storage system. 

## Features
- Marketplace for environmental asset tokens
- Minting and retiring of assets
- Batch explorer and trading interface
- Modern UI with shadcn/ui, TailwindCSS, and Wouter routing
- Mock backend with Express and in-memory storage (can be extended to use PostgreSQL)

## Prerequisites
- Node.js v18+
- npm or yarn
- (Optional) PostgreSQL database if you want to use Drizzle ORM with a real DB

## Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Development

#### Start the backend and frontend (concurrently):

```
# In the project root
npm run dev
```

- The backend API will run on the default Express port (check `server/index.ts`).
- The frontend (Vite) will run on port 5000 by default.

#### Or, run frontend only:

```
npm run dev:client
```

### 3. Build for production

```
npm run build
```

### 4. Start in production mode

```
npm start
```

## Project Structure

- `client/` — React frontend (Vite, Tailwind, shadcn/ui)
- `server/` — Express backend (TypeScript, Drizzle ORM-ready)
- `shared/` — Shared types and schema
- `attached_assets/` — Images and static assets

## Environment Variables

- `DATABASE_URL` — Required if using Drizzle ORM with PostgreSQL (see `drizzle.config.ts`)

## Notes
- The backend uses in-memory storage by default. To use PostgreSQL, implement the storage interface in `server/storage.ts` and set up your DB.
- All routes are prefixed with `/api`.
- UI is fully responsive and modern.

## License
MIT
