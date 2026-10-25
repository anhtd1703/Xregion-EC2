# Phase 2 — Instance Management

## Goal

Implement the complete instance management frontend and mock backend.

---

## Routes

```text
/instances
/instances/create
/instances/:id
```

---

## Instance list

Implement:

- KPI cards
- search
- status filter
- region filter
- pagination if useful
- instance table
- actions menu

Actions:

- start
- stop
- restart
- create snapshot
- migrate
- delete

All actions use mock API.

Destructive action must have confirmation.

---

## Launch Instance

Form sections:

1. Basic details
2. Initial region
3. OS image
4. Flavor
5. Storage
6. Network/security

Use schema validation.

Sticky instance summary.

Submit creates a fake instance through the API abstraction and redirects to detail/list.

---

## Instance detail

Tabs:

- Overview
- Monitoring
- Storage
- Networking
- Snapshots
- Activity

Only Overview must be fully implemented in this phase.

Other tabs may display structured placeholders connected to later phases.

---

## Backend contracts

Implement mock compute provider.

Do not implement OpenStack Nova yet.

Provider interface must already match expected real operations.

---

## Tests

Test:

- filtering
- lifecycle state changes
- invalid action on wrong state
- create instance validation
- delete confirmation flow where practical

---

## Completion criteria

A user can demo the full instance lifecycle using deterministic mock data.
