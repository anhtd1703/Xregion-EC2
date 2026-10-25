# Coding Rules for Gemini / Antigravity

These are hard constraints.

## 1. General

1. Read architecture and phase plan before coding.
2. Do not modify unrelated files.
3. Prefer small, focused modules.
4. Use TypeScript strict mode.
5. Do not use `any` unless absolutely necessary and documented.
6. Avoid premature abstractions.
7. Do not add a dependency if the platform/framework already provides the capability.
8. Do not introduce a new architecture pattern without documenting why.

---

## 2. Frontend

Frontend components MUST NOT:

- import AWS SDK
- call OpenStack
- know AWS credentials
- implement migration orchestration
- calculate infrastructure state transitions

All HTTP calls go through:

```text
page/component
    |
composable/store
    |
useApi()
    |
API Gateway
```

Avoid `$fetch()` scattered across components.

---

## 3. State

Use Pinia only for global/client-shared state.

Good stores:

- auth
- app
- instances
- migration

Do not put all server data in Pinia automatically.

Simple page-local data may use `useAsyncData`, `useFetch`, or composables.

---

## 4. Backend

Lambda handlers must be thin.

Business logic goes in services.

Infrastructure integrations go in providers/adapters.

Example:

```text
HTTP Handler
   |
MigrationService
   |
SnapshotProvider
ComputeProvider
DnsProvider
MigrationRepository
```

---

## 5. Security

NEVER hard-code:

- AWS access keys
- AWS secret keys
- Keystone credentials
- private SSH keys
- tokens
- passwords
- API secrets

Use environment variables or IAM roles.

Do not commit `.env`.

Provide `.env.example`.

---

## 6. Destructive actions

Require confirmation before:

- deleting VM
- deleting snapshot
- deleting migration scenario
- forcing migration
- changing active DNS
- terminating a resource

Frontend confirmation must clearly state the affected resource.

---

## 7. API errors

Do not expose raw internal exceptions directly.

Map them to stable application error codes.

Example:

```json
{
  "success": false,
  "error": {
    "code": "INSTANCE_NOT_FOUND",
    "message": "Instance does not exist"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Logs may contain technical details, but responses should remain controlled.

---

## 8. Logging

Prefer structured logs.

Example:

```ts
logger.info('migration.step.completed', {
  migrationId,
  instanceId,
  step: 'CREATE_SNAPSHOT',
  durationMs,
})
```

Avoid random console messages.

---

## 9. Testing

At minimum test:

- domain services
- status transitions
- validation
- rollback behavior
- critical API handlers

Infrastructure providers should be mockable.

---

## 10. Agent workflow

Before coding:

1. Inspect current code.
2. State intended files to create/modify.
3. Verify existing patterns.

After coding:

1. Run format.
2. Run lint.
3. Run typecheck.
4. Run tests.
5. Fix failures caused by the change.
6. Report changed files.
7. Report assumptions.
8. Report TODOs.

---

## 11. Forbidden agent behavior

Do not:

- rewrite the project from scratch during a feature task
- silently change API contracts
- silently rename routes
- add backend frameworks unnecessarily
- connect real AWS during mock phases
- auto-create or destroy real infrastructure without explicit instruction
- skip typecheck because tests pass
- make fake tests that only assert `true`
