# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL (Replit built-in) + Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs), token stored in localStorage
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## RSR Network — Final Pass Complete

### Database Tables
- `users` — operator accounts (seeded: Black Rail/EIO/4451, Signal Echo/echo/echo, Operator Vanta/vanta/vanta, Cipher Nine/cipher/cipher)
- `signals` — submitted signals with thread support
- `cases` — case rooms with linked signals
- `network_messages` — Network Room message feed (has `room_id` FK to network_rooms)
- `signal_threads` — per-signal thread messages
- `network_rooms` — Network Room channel list (system rooms: General Net, Signal Review, Case Ops, Command Net, Field Reports)

### True-Final Pass Features (v3)
- **DB schema — status column**: `status text NOT NULL DEFAULT 'active'` added to `users` table. Values: `active | restricted | banned`.
- **Auth ban check**: Login and token verify both check user `status`. Banned users receive HTTP 403 "NETWORK ACCESS REVOKED" and cannot enter.
- **IDCard flip (pure CSS 3D)**: Full rewrite with CSS `preserve-3d` + `backfaceVisibility: hidden` on both absolutely-positioned faces. Framer Motion only wraps for entrance animation (no conflicting 3D). Flip button is a dedicated strip below the card.
- **NetworkRoom — inline message delete**: Hover-reveal trash icon per message (founder only). Two-click confirmation pattern (click once to arm, again to confirm). Author name is a clickable link → `/operators/:id`.
- **AppShell — unread notification dot**: Tracks `localStorage.rsr_network_seen` count. Red pulsing dot on "Network Room" nav item when unseen messages exist. Auto-clears on `/network` visit.
- **CommandPage — Personnel tab upgrades**: Inline alias editing (hover pencil → input → save). Status controls (active/restricted/banned buttons with icons). Promotion request queue: when `promotionStatus === "Under Review"`, operator card shows approve/deny buttons. Approving auto-promotes to next standing tier (never to Command automatically).
- **IdentityPage — Request Promotion**: Non-Command operators see a "Request Promotion" button in the Advancement panel. PATCHes `promotionStatus` to "Under Review". State-aware: shows current status (Denied = re-submit option, Under Review = pending message, Approved = success note).
- **Users PATCH route**: `alias` and `status` added to Command-allowed update fields. `toFrontendUser` returns `status` field in both auth.ts and users.ts.
- **CommandPage tabs**: Tab active color changed to amber to match Command aesthetic.

### Final Pass Features (v2)
- **StarfieldCanvas**: Layered 3-depth stars (foreground/mid/background), much brighter and more defined. Radial glow on foreground stars. Occasional shooting stars (9–25s interval, 0.3 max opacity). Canvas z-0 fixed behind all content.
- **IDCard flip**: Flip button (RotateCcw) on bottom-right of card. Front/back with `rotateY` spring animation, `preserve-3d`. Back shows credential class, access class, standing, role, join date, network provision.
- **SignalDetailDrawer**: Delete button moved to footer section (below thread input), separate from title. Confirmation flow: one click to arm, second to confirm.
- **AccessGate expandable info**: 4 collapsible sections — Standing Structure, Credential Classes, How Access Works, What is Command? — animate in-place.
- **ProfilePage (Founder Backroom)**: 9 environments (Shadow Panel, Command Steel, Dark Grid, Tactical Mesh, Cold Glass, Signal Field, Dark Mesh, Republic Steel, Black Flag [Command only]). Black Flag uses subtle horizontal grey stripes inspired by monochrome American flag. Command stat block for founder.
- **CommandPage Intake tab**: Observer-standing operators appear in intake queue. Founder can promote (→ Scout/Operator/Analyst) or remove. Uses PATCH/DELETE `/api/users/:id` (Command-auth-gated).
- **API users routes**: Added `PATCH /api/users/:id` and `DELETE /api/users/:id` — Command standing required, cannot delete self.
- **Brightness pass**: Key label text nudged from zinc-700 to zinc-500 across SignalsPage, CasesPage, IdentityPage, DossierPage, AppShell nav icons.

### API Routes (all under /api)
- `POST /auth/login` — returns JWT + user
- `POST /auth/register` — creates user + returns JWT
- `POST /auth/verify` — validates token, returns user
- `GET /users` — list all operators (auth required)
- `GET /signals` + `POST /signals` + `PATCH /signals/:id` — signal CRUD
- `POST /signals/:id/thread` — add thread message
- `GET /cases` + `POST /cases` + `PATCH /cases/:id` — case CRUD
- `GET /messages?roomId=X` + `POST /messages` — network room (roomId optional for filtering)
- `PATCH /messages/:id/response` — add response chip
- `DELETE /messages/:id` — delete message (Command oversight)
- `GET /rooms` + `POST /rooms` + `PATCH /rooms/:id` + `DELETE /rooms/:id` — channel rooms CRUD (system rooms cannot be renamed or deleted)

### Frontend API Layer
- `src/lib/api.ts` — all fetch helpers, session management
- `src/lib/store.tsx` — React context backed by real API calls, session persisted via localStorage JWT
- Vite dev proxy: `/api` → `http://localhost:8080`

### Seed Script
- `scripts/seed-rsr.mjs` — run `node scripts/seed-rsr.mjs` to re-seed

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── rsr-network/        # RSR Network intelligence platform (React + Vite, previewPath: /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
