# Phase 4 — Migration Scenarios

## Goal

Implement creation and management of migration rules.

---

## Routes

```text
/migrations/scenarios
/migrations/scenarios/create
/migrations/scenarios/:id
```

---

## Scenario fields

Required:

- name
- instance
- destination region
- trigger type
- schedule when scheduled
- timezone
- auto-update DNS
- rollback on failure
- notification channel
- cooldown
- status

---

## Supported triggers

```text
MANUAL
SCHEDULED
```

For mock mode, scheduled execution does not need a real EventBridge rule.

It should store the schedule and display the next planned run.

---

## Validation

Reject:

- same source and destination region
- unsupported region
- no target instance
- invalid schedule
- cooldown < allowed minimum
- conflicting active scenario where business rule forbids it

---

## UI

Scenario overview should show:

- active scenarios
- projected saving
- success rate
- running migrations

Provide actions:

- run
- edit
- pause
- enable
- delete

---

## Completion criteria

User can create, edit, pause, enable, delete and manually trigger scenarios in mock mode.
