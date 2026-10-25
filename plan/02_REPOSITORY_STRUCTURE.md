# Repository Structure

## 1. Target monorepo

Create the repository using this structure:

```text
xregion-ec2/
|
|-- AGENTS.md
|-- README.md
|-- package.json
|-- pnpm-workspace.yaml
|-- .editorconfig
|-- .gitignore
|-- .env.example
|
|-- plan/
|   |-- 00_START_HERE.md
|   |-- ...
|
|-- apps/
|   `-- dashboard/
|       |-- app.vue
|       |-- nuxt.config.ts
|       |-- assets/
|       |-- components/
|       |-- composables/
|       |-- layouts/
|       |-- middleware/
|       |-- pages/
|       |-- plugins/
|       |-- stores/
|       |-- types/
|       `-- utils/
|
|-- backend/
|   |-- services/
|   |   |-- auth/
|   |   |-- compute/
|   |   |-- storage/
|   |   |-- scenarios/
|   |   |-- migration/
|   |   |-- monitoring/
|   |   `-- network/
|   |
|   |-- shared/
|   |   |-- aws/
|   |   |-- openstack/
|   |   |-- errors/
|   |   |-- http/
|   |   |-- logging/
|   |   |-- validation/
|   |   `-- types/
|   |
|   `-- tests/
|
|-- packages/
|   `-- contracts/
|       |-- src/
|       |   |-- api/
|       |   |-- enums/
|       |   `-- models/
|       `-- package.json
|
|-- infrastructure/
|   |-- terraform/
|   `-- scripts/
|
`-- docs/
    |-- architecture/
    |-- api/
    `-- demo/
```

---

## 2. Why packages/contracts exists

Frontend and backend must share types for:

- Instance
- Snapshot
- Migration
- MigrationScenario
- API response
- API error
- pagination
- status enums

Do not duplicate the same interfaces independently.

Example:

```ts
export type InstanceStatus =
  | 'CREATING'
  | 'RUNNING'
  | 'STOPPED'
  | 'MIGRATING'
  | 'ERROR'
```

---

## 3. Dashboard structure

```text
apps/dashboard/
|
|-- components/
|   |-- app/
|   |-- common/
|   |-- instance/
|   |-- migration/
|   |-- monitoring/
|   `-- network/
|
|-- composables/
|   |-- useApi.ts
|   |-- useInstancesApi.ts
|   |-- useMigrationApi.ts
|   |-- useSnapshotsApi.ts
|   `-- useMonitoringApi.ts
|
|-- layouts/
|   |-- default.vue
|   `-- auth.vue
|
|-- pages/
|   |-- login.vue
|   |-- index.vue
|   |
|   |-- instances/
|   |   |-- index.vue
|   |   |-- create.vue
|   |   `-- [id].vue
|   |
|   |-- snapshots/
|   |   `-- index.vue
|   |
|   |-- migrations/
|   |   |-- index.vue
|   |   |-- history.vue
|   |   |-- [id].vue
|   |   `-- scenarios/
|   |       |-- index.vue
|   |       |-- create.vue
|   |       `-- [id].vue
|   |
|   |-- network/
|   |   |-- index.vue
|   |   `-- dns.vue
|   |
|   |-- monitoring/
|   |   `-- index.vue
|   |
|   `-- logs/
|       `-- index.vue
|
|-- stores/
|   |-- auth.ts
|   |-- app.ts
|   |-- instances.ts
|   `-- migration.ts
|
|-- types/
|-- utils/
`-- middleware/
```

---

## 4. Backend service structure example

```text
backend/services/migration/
|
|-- handler.ts
|-- routes.ts
|-- service.ts
|-- repository.ts
|
|-- steps/
|   |-- precheck.ts
|   |-- stop-source.ts
|   |-- create-snapshot.ts
|   |-- copy-snapshot.ts
|   |-- restore-destination.ts
|   |-- health-check.ts
|   `-- switch-dns.ts
|
|-- rollback.ts
|-- types.ts
`-- __tests__/
```

Do not put the whole migration process inside `handler.ts`.

`handler.ts` should mainly:

- parse request
- validate auth/input
- call service
- convert result to HTTP response

---

## 5. Package manager

Use `pnpm`.

Root:

```json
{
  "private": true,
  "packageManager": "pnpm@latest"
}
```

Workspace:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "backend/*"
  - "backend/services/*"
```

If a specific backend package structure makes this glob inconvenient, adjust the workspace carefully but keep the monorepo.
