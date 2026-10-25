# Phase 9 — Testing and End-to-End Validation

## Goal

Ensure the project can be reliably demonstrated and graded.

---

## Test layers

### Unit

Test:

- domain services
- validation
- migration state machine
- rollback logic
- cost calculation
- provider mapping

### API

Test critical handlers:

- auth
- instances
- scenarios
- migration status

### Frontend

Test critical interactions where practical:

- create instance validation
- filters
- lifecycle action
- scenario form
- migration timeline state
- rollback error display

### E2E

Minimum E2E demo:

```text
Login
-> create VM
-> view VM
-> create migration scenario
-> trigger migration
-> watch progress
-> complete
-> verify destination
-> verify DNS state
```

Failure E2E:

```text
trigger migration configured to fail
-> failure
-> rollback
-> source running again
```

---

## Demo-safe mode

Maintain a deterministic mock scenario for presentation.

Example IDs and names should remain stable so screenshots/demo scripts match.

---

## Test data

Seed:

- 8 instances
- 2 regions
- 4 images
- several snapshots
- 3 migration scenarios
- migration history
- logs
- metric history

---

## Completion criteria

The team can run the full demo twice consecutively without resetting code manually.
