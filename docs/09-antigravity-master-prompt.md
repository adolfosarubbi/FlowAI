# Antigravity Master Prompt - FlowAI

You are the implementation agent for FlowAI, a production-oriented portfolio application.

IMPORTANT: This project is Node.js/TypeScript based. Do not introduce C#, .NET, ASP.NET, Java or Spring.

Before changing code:

1. Read README.md.
2. Read every document in /docs.
3. Treat them as the source of truth.
4. If a requested implementation contradicts them, explain the conflict before changing architecture.

## Required stack

- Node.js
- TypeScript
- NestJS backend
- Angular frontend
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ only when background jobs become necessary
- REST + Swagger/OpenAPI
- WebSockets/Socket.IO when realtime is implemented
- Jest + Supertest
- Docker Compose
- GitHub Actions

## Version policy

Use:

- Node.js 26.x
- Angular 22.x
- NestJS 12.x
- Prisma 7.x stable
- npm as package manager

IMPORTANT:

- Do NOT install Prisma 8 release candidate.
- Do NOT use prerelease, beta, alpha or RC dependencies.
- Prefer stable package versions.
- Angular CLI, NestJS CLI and Prisma CLI must be project dependencies/devDependencies where appropriate, not required global installations.

## Engineering principles

- modular monolith
- strong module boundaries
- thin controllers
- business logic in services/use cases/domain
- dependency injection
- external systems behind interfaces/adapters
- tenant isolation is a security boundary
- AI output is untrusted until schema validated
- webhook processing is idempotent
- no secrets committed
- avoid premature abstractions
- avoid microservices
- avoid implementing future phases early

## Working method for every task

1. Restate the current phase and acceptance criteria.
2. Inspect existing repository state.
3. Propose a short implementation plan.
4. Implement only the requested phase.
5. Run formatter/linter/typecheck/tests/build as applicable.
6. Fix failures before stopping.
7. Summarize:
   - files created/changed
   - commands to run
   - tests executed
   - architectural decisions
   - known limitations
   - next recommended backlog item

# CURRENT TASK: PHASE 0 ONLY

Implement Phase 0 - Foundation.

## Phase 0 requirements

- initialize a TypeScript monorepo suitable for apps/api and apps/web
- create NestJS API in apps/api
- create Angular application in apps/web
- configure PostgreSQL and Redis using Docker Compose
- configure Prisma for PostgreSQL in the API
- create a minimal initial Prisma schema only as needed to verify setup; DO NOT implement Phase 1 domain entities yet
- create GET /api/v1/health
- health response should report API status and database connectivity without leaking secrets
- configure Swagger/OpenAPI for the API
- create .env.example with documented variables and no real secrets
- create root scripts for development, build, lint/typecheck and tests where practical
- configure GitHub Actions to install dependencies and run validation/build/tests
- update README with exact local setup instructions
- establish formatting/linting conventions
- add at least one automated API test for the health endpoint

## Phase 0 non-goals

DO NOT implement:

- authentication
- users/workspaces
- contacts
- leads
- conversations
- AI
- WhatsApp
- queues/jobs
- dashboard
- business domain entities

Redis should run locally now but does not need application usage until justified.

## Acceptance criteria

A new developer can:

1. clone the repository
2. copy .env.example to .env
3. start PostgreSQL and Redis with Docker Compose
4. install dependencies
5. apply Prisma setup/migration if required
6. start NestJS and Angular
7. open the Angular application
8. call GET /api/v1/health successfully
9. open Swagger
10. run the automated validation/test commands successfully

Keep the implementation simple and explain any monorepo tooling choice before adopting it.
