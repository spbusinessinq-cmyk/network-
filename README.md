# RSR Network

Internal intelligence platform. Dark tactical interface for signal intake, case management, operator coordination, and Command oversight.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Express 5 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Monorepo**: pnpm workspaces

## Credentials (development seed)

| Alias | Username | Password | Standing |
|---|---|---|---|
| Black Rail | `EIO` | `4451` | Command (Founder) |
| Signal Echo | `echo` | `echo` | Operator |
| Operator Vanta | `vanta` | `vanta` | Operator |
| Cipher Nine | `cipher` | `cipher` | Analyst |

## Setup

```bash
# Install dependencies
pnpm install

# Set environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-here

# Push database schema
pnpm --filter @workspace/db run db:push

# Seed database
pnpm --filter @workspace/db run db:seed

# Start all services
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/rsr-network run dev
```

## Structure

```
artifacts/
  api-server/     Express API + auth + routes
  rsr-network/    React frontend
lib/
  db/             Drizzle schema + seed
```

## Key Features

- Animated starfield with depth layers and shooting stars
- Operator ID cards with 3D flip (front/back credential view)
- Signal intake + threaded review drawer with Command delete control
- Case rooms linked to signals
- Network Room multi-channel chat with full channel management (create, rename, reorder, delete)
- Command Panel: operator intake queue with promote/remove
- Founder backroom with 9 environment themes (Black Flag for Command only)
- Amber/gold treatment strictly gated to Command standing
