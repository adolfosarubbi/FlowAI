# FlowAI

AI-powered WhatsApp lead qualification and follow-up platform.

## Portfolio objective

Demonstrate production-oriented full-stack TypeScript engineering with:

- Node.js 26 + NestJS 12
- Angular 22 + TypeScript
- PostgreSQL 16 + Prisma 7
- Redis 7
- REST / OpenAPI (Swagger)
- WebSockets / Socket.IO when real-time requirements justify them
- WhatsApp Cloud API in a later phase
- Structured LLM outputs for lead qualification
- Docker + Docker Compose
- GitHub Actions CI
- Vitest

## Product objective

Help SMEs centralize inbound WhatsApp leads, qualify them with AI, organize follow-ups, manage a sales pipeline and measure conversion.

## Core flow

```text
WhatsApp message
→ webhook
→ conversation
→ AI qualification
→ lead
→ pipeline
→ follow-up
→ won/lost
```

## Engineering principles

FlowAI starts as a modular monolith.

The architecture should evolve with real product needs. Do not introduce microservices, queues, WebSockets, distributed infrastructure or additional technologies unless a concrete requirement justifies them.

The application is designed as a multi-tenant SaaS. Tenant isolation is a fundamental security requirement.

---

## Current status

### Phase 0 — Foundation

Completed.

Implemented:

- npm workspaces monorepo
- NestJS API
- Angular frontend
- PostgreSQL 16
- Redis 7
- Prisma 7
- Docker Compose
- environment configuration
- health endpoint
- PostgreSQL connectivity
- Swagger / OpenAPI
- Vitest unit tests
- Vitest E2E tests
- ESLint
- TypeScript typecheck
- Prettier
- GitHub Actions CI
- protected main branch workflow

### Phase 1 — Identity & Tenancy

In progress.

Implemented:

- `User`
- `Workspace`
- `Membership`
- roles:
  - `ADMIN`
  - `MANAGER`
  - `AGENT`
- multi-tenant identity data model
- user registration with initial workspace creation
- initial user receives the `ADMIN` role
- email normalization and validation
- password hashing with Argon2id
- email/password login
- short-lived JWT access tokens
- active-user validation
- generic authentication failures to avoid account enumeration
- workspace memberships returned after authentication
- Swagger documentation for authentication endpoints
- unit tests for registration and login

The relationship between users and workspaces is represented through `Membership`, allowing a user to belong to multiple workspaces with different roles.

The initial access token is user-scoped. Workspace and role context will be introduced explicitly rather than selecting a workspace implicitly for users who may belong to multiple tenants.

Next Phase 1 work includes workspace context resolution, tenant isolation, authorization guards, role enforcement and refresh-token lifecycle design.

---

## Roadmap

```text
Phase 0 — Foundation                      ✅ Completed
Phase 1 — Identity & Tenancy              🚧 In progress
Phase 2 — CRM
Phase 3 — Inbox / Demo Transport / Realtime
Phase 4 — AI Qualification
Phase 5 — WhatsApp Integration
Phase 6 — Tasks / Analytics
Phase 7 — Production / Portfolio Polish
```

The roadmap is a guide and should only change when there is a clear technical or product reason.

---

## Local development

FlowAI is developed as an npm workspaces monorepo with containerized PostgreSQL
and Redis infrastructure.

The local development environment uses:

- Node.js 26
- npm
- Docker / Docker Compose
- PostgreSQL 16
- Redis 7
- Prisma 7
- NestJS API
- Angular frontend

Environment-specific configuration is managed through environment variables.
Only safe placeholders and development defaults are included in the repository;
real credentials and secrets must never be committed.

Database schema evolution is managed through Prisma migrations.

The repository includes scripts for development, database management, testing,
linting, type checking, formatting and production builds.

Detailed environment configuration and deployment procedures are intentionally
not documented as part of the public portfolio.

---

## Quality checks

Before pushing changes, run the repository formatting check:

```bash
npm run format:check
```

From the repository root:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

API-specific checks can also be run from the repository root:

```bash
npm run typecheck --workspace=apps/api
npm run lint --workspace=apps/api
npm run test --workspace=apps/api
npm run test:e2e --workspace=apps/api
npm run build --workspace=apps/api
```

GitHub Actions runs formatting, API validation and frontend validation on supported branches and pull requests.

---

## Repository structure

```text
FlowAI/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── health/
│   │   │   └── prisma/
│   │   ├── test/
│   │   └── prisma.config.ts
│   │
│   └── web/
│
├── docs/
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml
```

Shared packages should only be introduced when there is an actual reuse requirement.

---

## Identity & tenancy model

The initial tenancy model is:

```text
User
  │
  └── Membership ───── Workspace
          │
          └── Role
              ├── ADMIN
              ├── MANAGER
              └── AGENT
```

A role belongs to a `Membership`, not directly to a `User`.

This allows the same user to belong to multiple workspaces with different permissions.

Business data introduced in later phases must always be scoped to a workspace.

---

## Authentication

Currently implemented:

- email + password registration and login
- email normalization
- password hashing with Argon2id
- short-lived JWT access tokens
- inactive-user rejection
- generic invalid-credential responses
- authenticated user and workspace memberships returned on login

Access tokens are currently user-scoped. They identify the authenticated user but do not implicitly select a workspace or role.

Planned Phase 1 authentication and authorization work:

- explicit workspace context resolution
- workspace-scoped authorization
- role-based authorization
- guards for protected endpoints
- cross-tenant access prevention
- refresh-token lifecycle, rotation and revocation

Passwords must never be stored or logged in plain text. Authentication failures should not disclose whether an account exists.

---

## Development workflow

Feature development does not happen directly on `main`.

```text
main
→ feature branch
→ implementation
→ typecheck
→ lint
→ tests
→ build
→ commit
→ push
→ Pull Request
→ GitHub Actions
→ review
→ merge
```

`main` should remain stable.

Work should be implemented in small, reviewable slices instead of large phase-wide changes.

---

## Architecture decisions

See:

```text
docs/11-adrs.md
```

for architectural decision records.

Key principles:

- modular monolith
- explicit module boundaries
- thin controllers
- business logic in services
- PostgreSQL via Prisma
- tenant-scoped data access
- Redis only when an actual use case requires it
- queues only when asynchronous work justifies them
- WebSockets only when real-time product behavior requires them
- external AI providers behind abstractions
- structured AI outputs must be validated
- no secrets committed to GitHub

See the `docs/` directory for product, architecture, security, API and development documentation.
