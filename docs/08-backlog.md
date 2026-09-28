# Development Plan

## Phase 0 - Foundation

0.1 Initialize TypeScript monorepo
0.2 Create NestJS API
0.3 Create Angular web app
0.4 PostgreSQL + Redis with Docker Compose
0.5 Prisma setup + connectivity
0.6 API health endpoint
0.7 Swagger/OpenAPI
0.8 lint/format/test scripts
0.9 GitHub Actions CI
0.10 environment example and startup documentation

## Phase 1 - Identity & tenancy

1.1 User model
1.2 Registration/login
1.3 Workspace creation
1.4 Workspace membership
1.5 roles/guards
1.6 refresh/logout strategy
1.7 tenant-isolation integration tests

## Phase 2 - CRM

2.1 Contacts
2.2 Leads
2.3 seed default pipeline
2.4 lead movement
2.5 leads UI
2.6 Kanban
2.7 audit trail

## Phase 3 - Inbox

3.1 Conversation/message models
3.2 demo inbound transport
3.3 inbox API
3.4 inbox UI
3.5 composer
3.6 assignment
3.7 WebSocket updates

## Phase 4 - AI

4.1 AiProvider interface
4.2 deterministic FakeAiProvider
4.3 runtime qualification schema
4.4 real LLM adapter
4.5 qualification use case
4.6 AI run telemetry
4.7 qualification UI
4.8 prompt-injection/adversarial tests

## Phase 5 - WhatsApp

5.1 provider adapter interface
5.2 webhook verification
5.3 inbound webhook
5.4 idempotency
5.5 normalization
5.6 outbound messages
5.7 delivery statuses
5.8 settings UI

## Phase 6 - Tasks & analytics

6.1 tasks
6.2 overdue/upcoming
6.3 dashboard
6.4 pipeline metrics
6.5 response metrics

## Phase 7 - Portfolio/production polish

7.1 rate limiting
7.2 structured logging/observability
7.3 demo seed
7.4 E2E critical path
7.5 security review
7.6 deployment
7.7 README screenshots
7.8 architecture diagram
7.9 90-second demo

## Definition of Done

- acceptance criteria met
- business rules tested
- integration tests for persistence/security boundaries
- no secrets
- Prisma migration for schema changes
- Swagger updated
- lint/typecheck/tests/build pass
- happy path manually verified
