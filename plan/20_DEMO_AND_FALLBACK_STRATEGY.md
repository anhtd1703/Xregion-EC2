# Demo and Fallback Strategy

## Purpose

Cloud infrastructure can fail at demo time.

The project must have a deterministic fallback.

---

## Modes

Support:

```text
mock
real
```

Configured by environment.

The UI should not need separate codebases.

---

## Demo scenario

Prepare a fixed scenario:

```text
Instance:
web-prod-01

Source:
Region A - Singapore

Destination:
Region B - N. Virginia

DNS:
enabled

Rollback:
enabled
```

Successful migration should visibly pass through all migration steps.

Also prepare a failure scenario where Health Check fails and rollback succeeds.

---

## Presentation sequence

1. Login
2. Dashboard
3. Instances
4. Launch or inspect VM
5. Migration Scenarios
6. Trigger migration
7. Show live progress
8. Show destination state
9. Show DNS active region
10. Show monitoring and logs
11. Demonstrate failure + rollback if time permits

---

## Fallback rule

If real infrastructure is unavailable within the demo session:

- switch provider mode to mock
- continue using identical UI
- clearly tell the evaluator which part is simulated
- do not claim fake data is live AWS data

The mock engine is a resilience mechanism for presentation, not a replacement for real integration work.
