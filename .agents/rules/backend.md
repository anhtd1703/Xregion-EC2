# Backend Rules

Applies to `backend/**`.

## Layers

Preferred flow:

```text
HTTP handler
   ↓
service
   ↓
repository / provider
   ↓
AWS or OpenStack
```

Handlers should parse input, authorize, validate, call service, and map response.

Do not place an entire business workflow in `handler.ts`.

## Providers

Infrastructure integrations must use interfaces.

Examples:

- ComputeProvider
- SnapshotProvider
- DnsProvider
- MetricsProvider
- IdentityProvider
- SchedulerProvider

Mock providers must remain available until real integration is stable.

## Errors

Return stable app-level error codes.

Do not leak raw provider exceptions directly to clients.

## Logging

Use structured logs containing identifiers such as:

- requestId
- instanceId
- migrationId
- operation
- step

## Migration

Each migration step should:

- validate preconditions
- update state
- log result
- be retry-safe when practical
- fail explicitly
