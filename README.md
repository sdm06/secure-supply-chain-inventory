# Secure Supply Chain Inventory

A secure, audit-ready inventory management system built with **Next.js 16 (App Router)**, **Prisma + SQLite**, **NextAuth v5 (Credentials)**, **Zod**, and **shadcn/ui**. Role-based access control, a full audit trail, and a DevSecOps toolchain (Docker, Trivy, Gitleaks, GitHub Actions).

## Features

- **Authentication** — NextAuth v5 credentials auth with **bcrypt** password hashing and JWT strategy.
- **Authorization (RBAC)** — three roles:
  | Role        | Permissions                                        |
  | ----------- | -------------------------------------------------- |
  | `ADMIN`     | Create / edit / delete items, view audit log       |
  | `MANAGER`*  | Edit items (configurable)                          |
  | `USER`      | Read-only dashboard                                |
- **Audit trail** — every create/update/delete logs the actor, timestamp, and a diff of changed fields. Admins see the recent audit log on the dashboard.
- **Inventory dashboard** — stat cards (total items/units, low stock, out of stock), searchable table, status badges, and add/edit dialogs (admin-gated).
- **Server actions** — typed via Zod; all mutations revalidate the dashboard and write an `AuditLog` row.
- **Input validation** — Zod schemas shared between client forms and server actions.

## Tech stack

| Layer      | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 16 (Turbopack), React 19         |
| Database   | SQLite (Prisma ORM)                       |
| Auth       | NextAuth v5 (JWT) + bcryptjs             |
| Validation | Zod v4                                   |
| UI         | Tailwind CSS v4 + shadcn/ui               |
| Tooling    | TypeScript strict, ESLint 9, pnpm         |

## Getting started

> Requires **Node.js 22+** and **pnpm 10** (workspace already pinned via `packageManager`).
> Database is SQLite — no external DB server needed.

```bash
pnpm install
# 1) configure env
cp .env.example .env
# 2) set a secret for AUTH_SECRET (e.g. `openssl rand -base64 32`)
# 3) generate the Prisma client
pnpm exec prisma generate
# 4) apply migrations to ./dev.db
pnpm exec prisma migrate dev
# 5) seed demo users + items
pnpm db:seed
# 6) run the dev server
pnpm dev
```

Open http://localhost:3000 and sign in with a seeded account:

| Email              | Password    | Role   |
| ------------------ | ----------- | ------ |
| admin@example.com  | Admin123!   | ADMIN  |
| user@example.com   | User123!    | USER   |

## Working with the database

```bash
pnpm db:migrate     # create & apply a new migration after editing prisma/schema.prisma
pnpm db:deploy      # apply pending migrations (prod) without prompting
pnpm db:seed        # upsert seed users/items
pnpm db:validate    # validate the Prisma schema
```

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # run the production build (after `pnpm build`)
pnpm lint         # ESLint
pnpm typecheck    # TypeScript (no emit)
pnpm checks       # lint + typecheck + build, all in one
```

## Docker

A multi-stage, non-root `Dockerfile` builds a slim production image (runtime user `nextjs`, uid 1001). The entrypoint applies migrations (`prisma migrate deploy`) before starting Next.js.

```bash
# build the image
docker build -t secure-inventory .

# run with the included compose file (builds image, mounts a named volume for the DB)
docker compose up --build
```

`DATABASE_URL` must point to a persistent, writable path (the compose file mounts `/app/data`). Set `AUTH_SECRET` in your environment / `docker compose` env.

## Security & DevSecOps

- **GitHub Actions** (`.github/workflows/ci.yml`) runs on every push and PR, with PR reviewers protected by **[required status checks](##github-actions)**:
  - **Secret scan** — Gitleaks forbids leaks.
  - **Quality gates** — lint, typecheck, Next.js build, `prisma validate`, `migrate deploy`, seed, all in CI.
  - **Unit tests** — Vitest (`pnpm test:unit`)
  - **Container image** — multi-stage build + **Trivy** image scan (SARIF, `exit-code: 1` on HIGH/CRITICAL).
  - **Filesystem scan** — **Trivy** `fs` scan of the repo (SARIF).
  - **Manifest gate** — committed k8s manifests validated with **kubeconform + kustomize build** (`ci.yml` → `manifest-gate`, the `check_kubeform_ci_gate`-equivalent guard) before anything ships.
  - **Publish + manifest gate** — images pushed to GHCR with OIDC only after `docker`, `quality`, and `e2e` pass; the gate that blocks `/k8s` drift from reaching prod.
  - **End-to-end** — Playwright (Chromium) + a seeded `AUTH`-aware session.
- Threat model applied in code:
  - bcrypt-hashed passwords (never stored in plaintext).
  - Server actions enforce RBAC server-side (client gating is UX only).
  - Zod validation on all inputs. Return-early + typed errors.
  - Audit logging is immutable-ish: new rows only, never updated/deleted.

## Project structure

```
src/
  app/            # App Router routes: (auth) group, dashboard, api/auth
  components/     # UI + feature components (auth forms, inventory, audit)
  lib/            # prisma client, password, seed
  schemas/        # Zod schemas shared client/server
  actions/        # Server actions (auth, inventory)
  auth.ts         # NextAuth config
  proxy.ts        # Next.js proxy (edge auth gate for /dashboard)
prisma/
  schema.prisma   # User, InventoryItem, AuditLog
  migrations/     # versioned SQL migrations
Dockerfile        # multi-stage non-root production image
docker-entrypoint.sh
compose.yaml
.github/workflows/ci.yml
```
