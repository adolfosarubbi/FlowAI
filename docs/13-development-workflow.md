# Development Workflow with Antigravity

For now Antigravity is the only AI development assistant used on FlowAI.

## Per phase

1. Read source-of-truth docs.
2. Give Antigravity only the current phase.
3. Review its proposed plan.
4. Allow implementation.
5. Run its self-review prompt.
6. Verify application manually.
7. Commit.
8. Start next phase only after current phase is stable.

## Git

Recommended branch naming:

- feat/phase-0-foundation
- feat/phase-1-identity
- feat/contacts
- feat/inbox

Commit examples:

- chore: initialize FlowAI monorepo
- feat(api): add health endpoint
- feat(crm): add contact management
- test(auth): verify workspace isolation

## Rule

Never ask: "Build the entire application."

Prefer:
"Implement backlog item 2.3 only. Read the docs first, state acceptance criteria, implement, test and stop."

This makes AI-generated changes reviewable and keeps architecture under human control.
