---
name: implement-api
description: Implement XRegion backend API routes, Lambda handlers, domain services, repositories, providers, validation, and shared contracts without bypassing architecture rules.
---

# Implement API

Use for backend/API work.

## Required reading

Read:

- `AGENTS.md`
- `plan/01_PROJECT_ARCHITECTURE.md`
- `plan/05_API_CONTRACT.md`
- `plan/06_DATA_MODELS.md`
- `.agents/rules/backend.md`
- `.agents/rules/cloud-safety.md`
- current phase file

## Workflow

### 1. Inspect route contract

Confirm:

- method
- path
- request DTO
- response shape
- error codes
- authentication requirement

Do not silently alter API contract.

### 2. Identify layers

Implement through:

```text
handler
  ↓
service
  ↓
repository/provider
```

Keep handler thin.

### 3. Validation

Validate user input before business operations.

Return stable controlled errors.

### 4. Providers

Use provider interfaces for AWS/OpenStack.

During mock phases, implement only mock providers unless the current task explicitly belongs to real integration.

### 5. Security

Never hardcode credentials.

Do not perform real cloud mutation without explicit authorization.

### 6. Migration-specific rule

Migration steps belong in separate modules.

Each step:

- checks preconditions
- updates state
- logs structured event
- throws/returns explicit failure
- is retry-safe where practical

### 7. Testing

Add unit tests for:

- validation
- service behavior
- error mapping
- provider interaction
- status transitions where relevant

### 8. Verify

Run:

- formatter
- lint
- typecheck
- tests

Report changed routes and contracts.
