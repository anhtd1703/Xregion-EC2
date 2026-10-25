# API Contract

Base prefix:

```text
/api/v1
```

## 1. Response envelope

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_xxx"
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "INSTANCE_NOT_FOUND",
    "message": "Instance does not exist"
  },
  "meta": {
    "requestId": "req_xxx"
  }
}
```

Pagination:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "requestId": "req_xxx",
    "page": 1,
    "pageSize": 20,
    "total": 80
  }
}
```

---

# 2. Auth

```http
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

---

# 3. Instances

```http
GET    /api/v1/instances
POST   /api/v1/instances

GET    /api/v1/instances/{id}
DELETE /api/v1/instances/{id}

POST /api/v1/instances/{id}/start
POST /api/v1/instances/{id}/stop
POST /api/v1/instances/{id}/restart
```

Query parameters:

```text
search
status
region
page
pageSize
```

---

# 4. Images

```http
GET /api/v1/images
```

---

# 5. Snapshots

```http
GET    /api/v1/snapshots
POST   /api/v1/instances/{id}/snapshots
POST   /api/v1/snapshots/{id}/copy
DELETE /api/v1/snapshots/{id}
```

---

# 6. Migration scenarios

```http
GET    /api/v1/migration-scenarios
POST   /api/v1/migration-scenarios

GET    /api/v1/migration-scenarios/{id}
PATCH  /api/v1/migration-scenarios/{id}
DELETE /api/v1/migration-scenarios/{id}

POST /api/v1/migration-scenarios/{id}/enable
POST /api/v1/migration-scenarios/{id}/disable
POST /api/v1/migration-scenarios/{id}/run
```

---

# 7. Migrations

```http
POST /api/v1/migrations

GET /api/v1/migrations
GET /api/v1/migrations/{id}

POST /api/v1/migrations/{id}/retry
POST /api/v1/migrations/{id}/cancel
```

`POST /migrations` is the manual migration entry point.

Example request:

```json
{
  "instanceId": "vm_123",
  "destinationRegion": "us-east-1",
  "autoUpdateDns": true,
  "rollbackOnFailure": true
}
```

---

# 8. Monitoring

```http
GET /api/v1/instances/{id}/metrics
GET /api/v1/costs
```

Metrics query:

```text
range=1h|24h|7d
```

---

# 9. Logs

```http
GET /api/v1/logs
GET /api/v1/logs/{id}
```

Filters:

```text
service
severity
instanceId
migrationId
from
to
```

---

# 10. Networking

```http
GET /api/v1/network
GET /api/v1/security-groups
```

---

# 11. DNS

```http
GET   /api/v1/dns
PATCH /api/v1/dns
```

Manual DNS update must be protected by authorization and confirmation.

---

# 12. Error codes

Recommended stable codes:

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR

INSTANCE_NOT_FOUND
INSTANCE_INVALID_STATE
INSTANCE_OPERATION_FAILED

SNAPSHOT_NOT_FOUND
SNAPSHOT_COPY_FAILED

SCENARIO_NOT_FOUND
SCENARIO_CONFLICT
SCENARIO_COOLDOWN_ACTIVE

MIGRATION_NOT_FOUND
MIGRATION_ALREADY_RUNNING
MIGRATION_PRECHECK_FAILED
MIGRATION_SNAPSHOT_FAILED
MIGRATION_RESTORE_FAILED
MIGRATION_HEALTH_CHECK_FAILED
MIGRATION_DNS_FAILED
MIGRATION_ROLLBACK_FAILED

PROVIDER_UNAVAILABLE
INTERNAL_ERROR
```

Do not change these casually once frontend integration starts.
