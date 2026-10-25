---
name: implement-frontend-page
description: Implement or revise a Nuxt dashboard page for XRegion-EC2 using the existing architecture, shared contracts, mock/API abstractions, and UI conventions.
---

# Implement Frontend Page

Use this skill for Nuxt page/component implementation.

## Required reading

Read:

- `AGENTS.md`
- `plan/04_UI_UX_SPEC.md`
- `plan/05_API_CONTRACT.md`
- `plan/06_DATA_MODELS.md`
- `.agents/rules/frontend.md`
- the current phase file

Inspect existing components before creating new ones.

## Workflow

### 1. Inspect

Identify:

- route
- existing page
- relevant composable
- relevant store
- shared contracts
- reusable UI components

### 2. Plan

State:

- files to create
- files to modify
- data source
- UI states
- test approach

### 3. Implement

Rules:

- use Nuxt UI where practical
- use Tailwind for layout/custom styling
- API calls go through composables / `useApi`
- no AWS/OpenStack imports
- no hardcoded fake data inside pages
- use deterministic mock data source in mock mode

Every resource page should support relevant:

- loading
- empty
- error
- success

Destructive operations need confirmation.

### 4. Types

Use contracts from `packages/contracts`.

Avoid duplicate interfaces.

### 5. Verify

Run relevant:

```text
format
lint
typecheck
tests
build if the change affects production build
```

### 6. Report

Report:

- changed files
- route implemented
- reused components
- API/composable used
- tests/checks
- TODOs
