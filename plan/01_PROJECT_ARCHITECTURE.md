# Project Architecture

## 1. Product

**XRegion-EC2** is an IaaS management dashboard for administrators.

Its main value is automating VM migration between two independent regions.

Core user journey:

```text
Login
  |
  v
Create VM
  |
  v
Monitor VM
  |
  v
Create migration scenario
  |
  v
Execute migration
  |
  v
Track progress
  |
  +---- success -> switch DNS -> complete
  |
  +---- failure -> rollback -> restore source VM
```

---

## 2. High-level architecture

```text
                       ADMIN
                         |
                         v
                +------------------+
                | Nuxt Dashboard   |
                | EC2 + Nginx      |
                +--------+---------+
                         |
                       HTTPS
                         |
                         v
                +------------------+
                | API Gateway      |
                +--------+---------+
                         |
          +--------------+------------------+
          |              |                  |
          v              v                  v
    Auth Lambda    Compute Lambda    Migration Lambda
          |              |                  |
          v              |            +-----+-------+
      Keystone           |            |             |
                         v            v             v
                    OpenStack      DynamoDB     AWS APIs
                    Nova API                    EBS
                                               Route53
                                               CloudWatch
```

Scheduled migrations:

```text
EventBridge Scheduler
        |
        v
Migration Lambda
```

End-user traffic:

```text
Domain
  |
Route53
  |
Active Region ALB
  |
Nova VM / Application
```

---

## 3. Backend services

Use domain-oriented Lambda services rather than one Lambda per endpoint.

Recommended services:

```text
auth-service
compute-service
storage-service
scenario-service
migration-service
monitoring-service
network-service
```

A single service may handle multiple related API routes.

---

## 4. Provider abstraction

Infrastructure code MUST be isolated behind interfaces.

Example:

```ts
interface ComputeProvider {
  listInstances(): Promise<Instance[]>
  getInstance(id: string): Promise<Instance>
  createInstance(input: CreateInstanceInput): Promise<Instance>
  startInstance(id: string): Promise<void>
  stopInstance(id: string): Promise<void>
  restartInstance(id: string): Promise<void>
  deleteInstance(id: string): Promise<void>
}
```

Implementations:

```text
MockComputeProvider
OpenStackComputeProvider
```

Same principle for:

```text
SnapshotProvider
DnsProvider
MetricsProvider
IdentityProvider
SchedulerProvider
```

This allows frontend and backend development without touching production infrastructure.

---

## 5. Migration architecture

Migration is the most important domain.

Use explicit states.

Top-level status:

```text
PENDING
IN_PROGRESS
COMPLETED
FAILED
ROLLING_BACK
ROLLED_BACK
```

Detailed step:

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

Every step MUST:

1. Validate required input.
2. Be safe to retry where possible.
3. Update migration state.
4. Write structured logs.
5. Return structured errors.
6. Never silently continue after failure.

---

## 6. Migration flow

```text
1. PRE_CHECK
   - target region available
   - enough resources
   - no migration already active
   - cooldown respected

2. STOP_SOURCE
   - stop source VM
   - ensure it is stopped

3. CREATE_SNAPSHOT
   - create EBS/data snapshot

4. COPY_SNAPSHOT
   - copy snapshot to destination region
   - track progress

5. CREATE_VOLUME / RESTORE_DESTINATION
   - create destination volume
   - attach to destination compute
   - recreate Nova VM

6. HEALTH_CHECK
   - verify VM started
   - verify application health if available

7. SWITCH_DNS
   - update Route53 when enabled

8. COMPLETE
   - source remains stopped
   - destination becomes active
```

Failure after the source was stopped:

```text
FAILED
  |
  v
ROLLING_BACK
  |
  +-- keep DNS pointing to source
  +-- restart source VM
  +-- record reason
  |
  v
ROLLED_BACK
```

---

## 7. Realtime strategy

MVP uses polling.

Frontend:

```text
GET /api/v1/migrations/{id}
```

Polling interval:

```text
2-3 seconds
```

Stop polling when status is terminal:

```text
COMPLETED
FAILED
ROLLED_BACK
```

Do not add WebSocket/SSE until the MVP is stable.

---

## 8. AWS architecture clarification

API Gateway is the synchronous API entry point.

EventBridge Scheduler is only for scheduled actions.

Correct:

```text
Manual:
Dashboard -> API Gateway -> Lambda

Scheduled:
EventBridge Scheduler -> Lambda
```

Avoid:

```text
Dashboard -> API Gateway -> EventBridge -> Lambda
```

for normal CRUD requests.

---

## 9. Scope control

Do not add unless explicitly requested:

- Kubernetes
- ECS
- EKS
- microservices over network
- Kafka
- RabbitMQ
- GraphQL
- WebSocket
- server-side NestJS gateway
- Redis
- service mesh
- multi-cloud support

The goal is a clear, demonstrable Cloud Computing project, not maximum infrastructure complexity.
