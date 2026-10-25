# Phase 1 — App Shell, Design System and Mock Data

## Goal

Build a polished dashboard shell and establish mock-driven frontend development.

No real AWS/OpenStack integration.

---

## Deliverables

### Layout

- desktop sidebar
- mobile responsive sidebar
- top header
- breadcrumb
- region selector
- system health indicator
- notifications placeholder
- user menu

### Reusable UI

Create reusable components for:

- PageHeader
- StatCard
- StatusBadge
- DataTable wrapper if needed
- EmptyState
- ErrorState
- LoadingSkeleton
- ConfirmDialog
- RegionBadge

### Pages

Build UI for:

- Login
- Overview

Other pages remain placeholders.

---

## Dashboard mock data

Provide deterministic fixtures:

- 8 instances
- 5 running
- 2 stopped
- 1 migrating
- Region A and Region B
- migration history
- cost estimates
- system health

Do not generate random data on every reload because screenshots and tests should be repeatable.

---

## API abstraction

Implement:

```text
useApi.ts
```

Then specific composables can depend on it.

For mock mode, use either:

- Nuxt server mock routes, or
- a clean mock repository layer

Choose one approach and use it consistently.

Do not hard-code fake data directly inside pages.

---

## Completion criteria

- dark design system is consistent
- app navigation works
- login UI exists
- overview dashboard exists
- responsive behavior is acceptable
- mock data comes through abstraction
- loading/error/empty patterns established
- lint/typecheck/tests pass
