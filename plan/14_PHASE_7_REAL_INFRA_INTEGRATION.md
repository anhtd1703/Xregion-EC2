# Phase 7 — Real AWS / OpenStack Integration

## Goal

Replace mock providers incrementally with real provider implementations.

This phase may create or modify real cloud resources.

DO NOT execute cloud mutations automatically unless the human explicitly authorizes them.

---

## 1. Integration sequence

Recommended order:

1. Keystone authentication
2. Nova read operations
3. Nova lifecycle operations
4. image lookup
5. EBS snapshot read/create
6. cross-region snapshot copy
7. destination volume restore
8. destination Nova VM creation
9. CloudWatch metrics/log reads
10. Route53 update
11. EventBridge scheduling

Integrate one capability at a time.

---

## 2. Provider strategy

Existing interfaces must remain stable.

Replace:

```text
MockComputeProvider
```

with:

```text
OpenStackComputeProvider
```

Replace:

```text
MockSnapshotProvider
```

with:

```text
AwsEbsSnapshotProvider
```

Replace:

```text
MockDnsProvider
```

with:

```text
Route53DnsProvider
```

---

## 3. AWS credentials

Prefer IAM roles.

For Lambda:

- assign least-privilege execution role
- do not package static AWS credentials

For local development:

- use developer AWS profile / environment managed outside repository

---

## 4. OpenStack

Create API client wrappers for:

- Keystone
- Nova
- Glance
- Neutron as needed

Do not leak OpenStack-specific response shapes throughout business logic.

Normalize them into XRegion domain models.

---

## 5. Safety

Before any destructive infrastructure call:

- validate target resource
- validate region
- validate migration state
- log request ID
- enforce authorization
- check idempotency

---

## 6. Feature flags

Keep:

```text
XREGION_PROVIDER_MODE=mock|real
```

Allow the entire app to return to mock mode for presentation if infrastructure is unavailable.

This is important for a university demo.

---

## 7. Completion criteria

- same frontend works in mock and real modes
- real instance reads work
- lifecycle operations work
- migration happy path works
- failure path rolls back
- no credentials committed
- demo can fall back to mock mode
