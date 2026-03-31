# SwiftRoute

**Move Smarter. Deliver Faster.**

SwiftRoute is a logistics & delivery operations center (MERN) with role-based dashboards, shipment tracking (timeline + live updates), and Google Maps.

## Monorepo

- `client/` (React 18 + Vite + Tailwind + Framer Motion)
- `server/` (Node.js + Express + MongoDB + Mongoose + Socket.IO)

## Getting Started (Local)

### 1) Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas) reachable from your machine
- Google Maps API key (optional but recommended for map views)

### 2) Environment variables

Copy the example env files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

Then fill in:

- `server/.env`
  - `MONGODB_URI` (your MongoDB connection string)
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
  - `CLIENT_URL` (frontend origin, e.g. `http://localhost:5173`)
  - (optional) `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- `client/.env`
  - `VITE_API_URL` (e.g. `http://localhost:5225`)
  - `VITE_SOCKET_URL` (e.g. `http://localhost:5225`)
  - `VITE_GOOGLE_MAPS_API_KEY` (Google Maps key)

### 3) Run the app

From the project root:

```bash
npm run dev
```

This starts both backend and frontend (single command).

## Seed Demo Data (Fake Detailed DB)

The project includes a dev seed script that inserts realistic demo data:

- users (admin, merchants, drivers)
- merchants, drivers, vehicles
- orders, shipments, tracking timeline events
- payments

To seed your database:

```bash
cd server
npm run seed
```

After seeding, you can log in and view the dashboards immediately.

## Demo login credentials

The seed script uses this demo password for all seeded users:

- Password: `Admin@123`

Seeded user emails (default set):

- Admin: `admin@swiftroute.com`
- Merchants: `merchant1@swiftroute.com`, `merchant2@swiftroute.com`
- Drivers: `driver1@swiftroute.com`, `driver2@swiftroute.com`

## Routes (UI)

- Public
  - Landing: `/`
  - Public tracking: `/track/:trackingId`
- Auth
  - Login: `/login`
- Admin (role: `admin`)
  - Dashboard: `/admin`
  - Manage shipments: `/admin/shipments`
  - Manage users: `/admin/users`
  - Manage merchants: `/admin/merchants`
  - Manage drivers: `/admin/drivers`
  - Manage vehicles: `/admin/vehicles`
  - Manage orders: `/admin/orders`
- Merchant (role: `merchant`)
  - Dashboard: `/merchant`
  - Create order: `/merchant/create-order`
  - My orders: `/merchant/orders`
  - My shipments: `/merchant/shipments`
- Driver (role: `driver`)
  - Dashboard: `/driver`
  - Assigned deliveries: `/driver/deliveries`
  - Delivery detail: `/driver/delivery/:id`
  - Profile: `/driver/profile`

## Backend API Base

- All API routes are under: `/api/v1`
- Response shape is standardized as:

```json
{ "success": true, "message": "Success", "data": {} }
```

## Socket.IO (Live Updates)

Live events are enabled via Socket.IO:

- Backend broadcasts/clients subscribe to:
  - `driver_location_broadcast`
  - `shipment_update`
  - `delivery_completed`

Admin and Driver dashboards listen for these events to keep shipment status/timeline in sync.

## Notes

- Never commit real secrets. Keep JWT secrets and DB credentials in `.env`.
- If Google Maps is not configured, the map components show friendly placeholders.

