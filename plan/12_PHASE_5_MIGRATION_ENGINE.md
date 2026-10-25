# Phase 5 — Migration Engine and Rollback

## Goal

Build the core migration domain and the most important demo screen.

Still use mock infrastructure providers first.

---

## Core principle

Never implement the whole migration engine inside one handler.

Use explicit step modules.

---

## Steps

```text
PRE_CHECK
STOP_SOURCE
CREATE_SNAPSHOT
COPY_SNAPSHOT
CREATE_VOLUME
RESTORE_DESTINATION
HEALTH_CHECK
SWITCH_DNS
COMPLETE
```

---

## Migration UI

Route:

```text
/migrations/:id
```

Show:

- source and destination
- status
- elapsed time
- six-step human-friendly timeline
- snapshot progress
- detailed event log
- rollback status
- final IP/endpoint after success

Human-facing timeline may combine internal states:

```text
1 Pre-check
2 Stop source VM
3 Snapshot & Copy
4 Restore destination VM
5 Health check
6 Switch DNS
```

---

## Mock execution

Create a deterministic mock executor capable of:

1. successful migration
2. snapshot failure
3. destination boot failure
4. health check failure
5. DNS failure
6. rollback success
7. rollback failure

Use configured scenarios rather than uncontrolled randomness.

---

## Polling

Frontend polls:

```text
GET /api/v1/migrations/:id
```

every ~2–3 seconds while active.

Stop on terminal state.

---

## Rollback

If failure occurs after source stop:

- mark failed step
- enter ROLLING_BACK
- keep/restore DNS to source
- restart source
- enter ROLLED_BACK when successful

---

## Idempotency

Each step should check existing state before repeating destructive work.

Example:

- if snapshot already exists, do not create duplicate blindly
- if source already stopped, continue
- if DNS already points to destination, do not create unnecessary changes

---

## Tests

This phase requires strong unit tests.

Test:

- valid state transitions
- invalid transitions
- each failure path
- rollback
- retry behavior
- duplicate request protection

---

## Completion criteria

A full migration can be demonstrated end-to-end without real AWS resources.
