# FlowAI

AI-powered WhatsApp lead qualification and follow-up platform.

## Portfolio objective

Demonstrate production-oriented full-stack TypeScript engineering with:

- Node.js 26 + NestJS 12
- Angular 22 + TypeScript
- PostgreSQL 16 + Prisma 7
- Redis 7
- BullMQ (introduced when background jobs are needed)
- REST/OpenAPI (Swagger)
- WebSockets / Socket.IO (Phase 3+)
- WhatsApp Cloud API (Phase 5+)
- LLM structured outputs (Phase 4+)
- Docker + Docker Compose
- GitHub Actions CI

## Product objective

Help SMEs centralize inbound WhatsApp leads, qualify them with AI, organize follow-ups and measure conversion.

## Core flow

```
WhatsApp message → webhook → conversation → AI qualification → lead → pipeline → follow-up → won/lost
```

## Engineering rule

Build a modular monolith first. Do not introduce microservices unless a documented requirement justifies them.

---

## Local setup (Phase 0)

### Prerequisites

| Tool           | Version | Notes                       |
| -------------- | ------- | --------------------------- |
| Node.js        | 26.x    | `node --version`            |
| npm            | 10+     | bundled with Node 26        |
| Docker         | Latest  | for PostgreSQL + Redis      |
| Docker Compose | v2      | bundled with Docker Desktop |

### 1. Clone

```bash
git clone https://github.com/your-org/flowai.git
cd flowai
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` if you need to change ports or credentials. The defaults work out of the box with the Docker Compose file.

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts:

- **PostgreSQL 16** on `localhost:5432`
- **Redis 7** on `localhost:6379`

Check readiness:

```bash
docker compose ps
```

Wait until both services show `healthy`.

### 4. Install dependencies

```bash
npm install
```

This installs dependencies for all workspaces (`apps/api`, `apps/web`) in one step.

### 5. Generate Prisma client & apply migrations

```bash
npm run db:generate        # generate the TypeScript Prisma client
npm run db:migrate:dev     # apply migrations (creates tables in PostgreSQL)
```

> On first run `db:migrate:dev` will also create the migration SQL file.

### 6. Start the API

```bash
npm run dev:api
```

The NestJS API starts on **http://localhost:3000**.

### 7. Start the Angular app

```bash
npm run dev:web
```

The Angular dev server starts on **http://localhost:4200**.

### 8. Verify

| What            | URL                                 |
| --------------- | ----------------------------------- |
| Angular app     | http://localhost:4200               |
| Health endpoint | http://localhost:3000/api/v1/health |
| Swagger UI      | http://localhost:3000/api/docs      |

### 9. Run tests

```bash
# Unit tests (API)
npm run test:api

# E2E tests (API, no DB required)
npm run test:api:e2e

# Lint + typecheck
npm run lint
npm run typecheck

# Build everything
npm run build
```

---

## Repository structure

```
flowai/
  apps/
    api/                 NestJS 12 API
      src/
        health/          GET /api/v1/health
        prisma/          PrismaService (global)
      prisma/
        schema.prisma    Prisma schema
      test/              e2e tests
    web/                 Angular 22 frontend
  packages/              shared packages (added when justified)
  docs/                  Architecture, data model, API contracts, ADRs
  docker-compose.yml     PostgreSQL + Redis
  .env.example           Environment variable reference
  .github/workflows/ci.yml  GitHub Actions CI
```

## npm workspace scripts

| Script                   | Description                            |
| ------------------------ | -------------------------------------- |
| `npm run dev:api`        | Start NestJS in watch mode             |
| `npm run dev:web`        | Start Angular dev server               |
| `npm run build`          | Build all workspaces                   |
| `npm run lint`           | Lint all workspaces                    |
| `npm run typecheck`      | Typecheck all workspaces               |
| `npm run test`           | Run all tests                          |
| `npm run test:api`       | API unit tests                         |
| `npm run test:api:e2e`   | API e2e tests (Supertest)              |
| `npm run db:generate`    | Generate Prisma client                 |
| `npm run db:migrate`     | Deploy migrations (production)         |
| `npm run db:migrate:dev` | Create + apply migration (development) |
| `npm run format`         | Format all files with Prettier         |

## Architecture decisions

See [`docs/11-adrs.md`](docs/11-adrs.md) for full ADR list.

**Monorepo tooling:** npm workspaces (built-in, no extra toolchain).  
**Module system:** NestJS modular monolith — strong module boundaries, thin controllers, business logic in services.  
**Database:** PostgreSQL via Prisma ORM — typed access, migration support, tenant-scoped queries.  
**Background jobs:** Redis is available now; BullMQ will be added when actual queue requirements appear (Phase 3+).

See [`docs/`](docs/) for full documentation before implementing any phase.
