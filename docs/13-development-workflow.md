# Development Workflow

FlowAI is developed incrementally, with an emphasis on small, reviewable changes
and a stable main branch.

## Development cycle

For each implementation slice:

1. Review the relevant product and architecture documentation.
2. Define the scope and acceptance criteria.
3. Create or continue work on the appropriate feature branch.
4. Implement the smallest complete change that satisfies the requirement.
5. Review the implementation for architecture, security and tenant isolation concerns.
6. Run formatting, type checking, linting, tests and build validation.
7. Perform manual verification when appropriate.
8. Commit the completed slice with a descriptive commit message.
9. Push only after all local quality checks pass.
10. Use CI and code review before merging into `main`.

A new development slice should not begin while the current one is known to be unstable.

## Git workflow

Feature development does not happen directly on `main`.

Recommended branch naming:

- `feat/<feature>`
- `fix/<issue>`
- `chore/<task>`

Examples:

- `feat/identity-tenancy`
- `feat/contacts`
- `feat/inbox`
- `fix/auth-validation`

Commit messages should describe the completed change clearly.

Examples:

- `chore: initialize FlowAI foundation`
- `feat: add identity and tenancy data model`
- `feat: add user login with JWT authentication`
- `test: verify workspace isolation`
- `fix: prevent cross-tenant resource access`

## Quality gates

Before a change is pushed, the repository must pass the relevant local checks for:

- formatting
- TypeScript type checking
- linting
- unit tests
- E2E tests
- application builds

GitHub Actions independently validates the repository after changes are pushed.

## Review principles

Changes should remain small enough to understand and review without requiring
unrelated refactoring.

Reviews should consider:

- correctness
- security
- tenant isolation
- module boundaries
- error handling
- validation
- test coverage
- maintainability
- unnecessary complexity

Architecture should evolve from concrete product requirements rather than
premature infrastructure or abstraction.

## Documentation

Documentation should be updated when a change affects:

- architecture
- public API behavior
- data models
- security assumptions
- environment configuration
- development workflow
- major technical decisions

Sensitive configuration, credentials and internal operational information must
not be committed to the public repository.
