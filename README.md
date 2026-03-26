# SwiftRoute

**Move Smarter. Deliver Faster.**

Monorepo:
- `client/`: React + Vite + Tailwind (dark ops-center UI)
- `server/`: Express + MongoDB + Socket.IO (API skeleton)

## Quick start

### 1) Environment files

- Copy `server/.env.example` → `server/.env`
- Copy `client/.env.example` → `client/.env`

### 2) Run backend

```bash
cd server
npm run dev
```

### 3) Run frontend

```bash
cd client
npm run dev
```

## Demo navigation

- Public landing: `/`
- Public tracking: `/track/SWR-DEMO123`
- Demo login: `/login` (pick a role to jump into `/admin`, `/merchant`, or `/driver`)

