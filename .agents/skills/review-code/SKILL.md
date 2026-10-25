---
name: review-code
description: Review XRegion-EC2 code for architecture violations, correctness, maintainability, cloud safety, API contract drift, and missing tests without making unrelated changes.
---

# Review Code

Use for focused review before or after implementation.

## Review priorities

Review in this order:

1. correctness
2. cloud safety/security
3. architecture compliance
4. API contract compliance
5. migration consistency
6. error handling
7. type safety
8. tests
9. maintainability
10. UI/UX consistency when frontend is involved

## Architecture checks

Flag:

- frontend calling AWS/OpenStack directly
- business logic inside Vue components
- giant Lambda handlers
- direct provider-specific response shapes leaking into domain
- duplicated contracts
- unnecessary framework/dependency additions
- silent API route changes

## Cloud safety checks

Flag:

- hardcoded credentials
- destructive calls without validation
- overly broad IAM assumptions
- public internal ports
- missing region/resource checks
- absent rollback logic

## Migration checks

Verify:

- legal state transitions
- terminal states
- rollback conditions
- duplicate/retry safety
- DynamoDB/state update logic
- DNS switch ordering
- failure visibility

## Review format

Report findings grouped by severity:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

For each finding:

- file/location
- issue
- impact
- recommended fix

Do not invent problems merely to fill categories.

If no serious findings exist, say so explicitly.

Only modify code if the human asked for review + fix.
