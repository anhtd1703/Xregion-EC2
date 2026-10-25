# Frontend Rules

Applies to `apps/dashboard/**`.

## Architecture

Use this flow:

```text
Page / Component
      ↓
Composable or store
      ↓
useApi()
      ↓
XRegion backend
```

Never:

- import AWS SDK in frontend
- call OpenStack APIs in frontend
- expose cloud credentials
- implement migration orchestration in Vue components

## UI

Prefer Nuxt UI before inventing custom primitives.

Every data page should consider:

- loading
- empty
- error
- success
- refresh

Destructive actions require explicit confirmation.

## State

Use Pinia only for global shared state.

Prefer composables / `useAsyncData` / page-local state for local server data.

## Types

Import shared domain/API types from `packages/contracts`.

Do not duplicate backend contracts in page components.

## Quality

Keep pages orchestration-focused and move reusable UI into components.
