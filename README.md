# Campus Bazaar

A campus-only marketplace with an Express API, PostgreSQL/Prisma persistence, password hashing, JWT-protected routes, and a responsive client.

## Features

- Sign up/login with bcrypt password hashing and seven-day JWTs
- Public listing search and category filtering
- Protected listing creation and owner-only listing status updates
- Prisma models and indexes for users and listings
- Local listing assistant endpoint for price and description suggestions (no external API key required)
- No `.env` file is included or required for demo mode. For PostgreSQL persistence, configure `DATABASE_URL` and `JWT_SECRET` in the deployment environment.

## Run locally

1. Install dependencies and start the demo immediately:

   ```bash
   npm install
   npm run dev
   ```

2. Open `http://localhost:3000`. Demo data is stored only in memory and resets at server restart.

### Enable PostgreSQL persistence

Set `DATABASE_URL` and `JWT_SECRET` directly in your terminal or deployment environment—no `.env` file is used—then run:

```bash
npm run db:generate
npm run db:migrate -- --name init
```

## API overview

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account |
| POST | `/api/auth/login` | Public | Receive JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/listings` | Public | Search/filter listings |
| POST | `/api/listings` | JWT | Create listing |
| PATCH | `/api/listings/:id/status` | JWT owner | Mark listing sold/archive |
| POST | `/api/ai/suggestion` | JWT | Price and description suggestion |
