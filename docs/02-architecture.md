# Architecture v1

## Architecture

TypeScript monorepo + modular monolith.

## Stack

- Runtime: Node.js
- Backend: NestJS + TypeScript
- Frontend: Angular + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Cache: Redis
- Background jobs: BullMQ
- API: REST + OpenAPI/Swagger
- Realtime: WebSockets / Socket.IO through NestJS
- Testing: Jest + Supertest
- Containers: Docker + Docker Compose
- CI: GitHub Actions

## Proposed repository

flowai/
apps/
api/ NestJS
web/ Angular
packages/
contracts/ shared DTO/API contracts where appropriate
config/ shared tooling/config only if justified
docs/
docker-compose.yml
package.json

Do not create packages merely for abstraction.

## Backend modules

- auth
- workspaces
- users
- contacts
- conversations
- messaging
- leads
- pipeline
- tasks
- ai
- integrations
- analytics
- audit

## Backend layering

Within each module prefer clear boundaries:

- controller / transport
- application service/use cases
- domain rules
- repository/infrastructure adapter

Controllers must not contain business logic.

## Inbound message path

Provider/Demo
-> controller/webhook
-> persist integration event when external
-> idempotency check
-> normalize message
-> upsert contact
-> persist conversation/message
-> enqueue expensive work if needed
-> websocket notification

## AI path

Conversation context
-> AiQualificationService
-> AiProvider interface
-> provider adapter
-> structured output validation
-> persist AiRun
-> return suggestion

## Cross-cutting

- UTC timestamps
- structured logs
- correlation/request IDs
- centralized exception handling
- DTO validation
- pagination
- tenant scoping
- idempotency for external events
- secrets through environment/secret store

## Avoid

- microservices
- Kubernetes
- event sourcing
- unnecessary CQRS frameworks
- premature generic repositories
- excessive shared packages
