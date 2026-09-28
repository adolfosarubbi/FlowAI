# Architecture Decision Records

## ADR-001 TypeScript end-to-end

Status: Accepted
Use TypeScript across frontend/backend to reduce context switching and support shared tooling/contracts.

## ADR-002 NestJS backend

Status: Accepted
Provides structured modules, dependency injection, guards, validation and enterprise-oriented architecture while staying in the Node.js ecosystem.

## ADR-003 Angular frontend

Status: Accepted
Fits the enterprise/full-stack positioning of the portfolio and existing developer experience.

## ADR-004 PostgreSQL + Prisma

Status: Accepted
Relational transactional data fits CRM workflows; Prisma provides typed Node.js access and migrations.

## ADR-005 Modular monolith

Status: Accepted
Clear boundaries without distributed-system overhead.

## ADR-006 Redis available, not forced

Status: Accepted
Run Redis in local infrastructure but only use it when caching, distributed state or BullMQ jobs have an actual requirement.

## ADR-007 Demo message transport first

Status: Accepted
Core product can be built/tested without Meta account configuration.

## ADR-008 AI provider abstraction

Status: Accepted
Automated tests and demos should not require paid external model calls.

## ADR-009 Human-overridable AI

Status: Accepted
Qualification is advisory, editable and never treated as unquestionable truth.
