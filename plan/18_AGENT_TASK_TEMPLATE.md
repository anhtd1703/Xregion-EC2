# Agent Task Template

Copy this template for every implementation task.

```md
# Task: <short name>

## Required reading

Before coding, read:

- plan/00_START_HERE.md
- plan/01_PROJECT_ARCHITECTURE.md
- plan/03_CODING_RULES.md
- plan/05_API_CONTRACT.md
- <current phase file>

## Goal

<one concrete outcome>

## Scope

Allowed files/directories:

- ...

Do not modify:

- ...

## Functional requirements

1. ...
2. ...
3. ...

## Architecture constraints

- No AWS/OpenStack calls from frontend.
- Use existing API abstraction.
- Use shared contracts.
- Do not alter unrelated API contracts.
- Use mock providers unless this task explicitly belongs to real-infrastructure phase.

## UX requirements

- loading
- empty
- error
- success
- responsive behavior
- destructive confirmation if needed

## Tests

Add/update tests for:

- ...

## Before coding

1. Inspect current implementation.
2. Explain planned file changes.
3. Reuse existing patterns/components.

## After coding

Run:

- formatter
- lint
- typecheck
- tests

Then report:

1. files created
2. files modified
3. tests run
4. assumptions
5. remaining TODOs
```
