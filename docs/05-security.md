# Security Requirements

## Authentication

Use a maintained NestJS-compatible authentication design. Passwords must use a strong password hashing algorithm. Access tokens must be short-lived. Refresh tokens, if used, must be revocable and handled securely.

## Authorization

Roles:

- ADMIN
- MANAGER
- AGENT

Enforce authorization server-side with guards/policies.

## Tenant isolation

Never trust workspaceId supplied arbitrarily by the client. Resolve workspace membership from authenticated context. Every tenant-owned repository query must be scoped.

Create integration tests specifically attempting cross-workspace access.

## Webhooks

- verify provider challenge/signature as applicable
- store external event identifiers
- idempotent processing
- acknowledge quickly
- never log credentials/secrets

## AI trust boundary

- inbound conversation text is untrusted
- structured outputs only
- validate AI response using a runtime schema (e.g. Zod or equivalent)
- AI cannot execute privileged actions in MVP
- qualification is advisory
- never persist hidden chain-of-thought

## General

- Helmet/security headers
- CORS configured explicitly
- rate limiting
- DTO validation
- Prisma parameterized access
- secret management
- dependency scanning
- sensitive log redaction
- HTTPS in deployment
