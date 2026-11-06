# Phase 3 Completion Report — Images & Snapshots Management

## Summary

Phase 3 successfully implemented **Images & Snapshots Management** in deterministic mock mode for XRegion-EC2. The implementation establishes the authoritative storage abstraction and point-in-time snapshot foundation required for later disaster recovery and migration phases, completely decoupled from direct cloud vendor dependencies.

## Scope

### Included in Phase 3

1. **Shared OS Machine Images Catalog**: Centralized image catalog supporting Ubuntu 24.04 LTS, Ubuntu 22.04 LTS, Debian 12, and CirrOS 0.6.2 with version, architecture, minimum disk size, and dual-region availability.
2. **Snapshot Management Console (`/snapshots`)**:
   - Two distinct tabs: **Snapshots** and **Machine Images**.
   - Derived KPI summary cards: Total Snapshots, Available, Creating/Copying, Total Stored Size (GB).
   - Real-time search, region filtering (`ALL`, `REGION_A`, `REGION_B`), and status filtering (`ALL`, `AVAILABLE`, `COPYING`, `ERROR`).
   - Snapshot list table with provenance indicator, source instance links, region badges, and status badges.
3. **Snapshot Detail Experience**: Detailed metadata modal/drawer displaying volume attributes, origin region, target copy destinations, copy parent linkage, and quick replication/delete actions.
4. **Create Snapshot from Instance**:
   - Supported via `POST /api/v1/instances/:id/snapshots` and `POST /api/v1/snapshots`.
   - Authoritative verification against `ComputeService`/`MockComputeProvider`.
   - Derives storage size and region directly from source instance.
5. **Cross-Region Snapshot Copy**:
   - Bidirectional replication: Region A (Singapore `ap-southeast-1`) ⇄ Region B (N. Virginia `us-east-1`).
   - Generates an independent snapshot in the destination region with a distinct ID while maintaining provenance (`copiedFromSnapshotId`) and preserving source state.
   - Prevents same-region copying and validates state.
6. **Snapshot Deletion**:
   - Controlled deletion via `DELETE /api/v1/snapshots/:id` requiring user confirmation.
   - Guarded against transient in-flight states (`CREATING`, `COPYING`, `DELETING`).
   - Removes snapshot from authoritative in-memory mock state (subsequent lookups return 404).
7. **Instance Detail Integration (`/instances/:id`)**:
   - Storage tab displays root block device specifications (`vol-root-:id`, 3,000 IOPS baseline, gp3 SSD, KMS encryption).
   - Snapshots tab displays instance-specific snapshots with direct "Create Snapshot" modal and copy/delete actions.
8. **Launch Instance Integration (`/instances/create`)**:
   - Refactored to dynamically consume the shared image catalog via `useImagesApi` / `/api/v1/images`.
   - Preserved Phase 2 instance launching flow with support for preselecting images via query parameters.

### Excluded from Phase 3 (Explicitly Deferred)

- Migration scenarios and scheduling engine (Phase 4).
- Migration execution, automated DNS cutover, rollback engine (Phase 5).
- Real-time CloudWatch telemetry, live network latency graphs (Phase 6).
- Direct AWS EBS/EC2 API calls and real cloud credential usage (Phase 7).

---

## Architecture Flow

The implemented storage workflow strictly adheres to the layered repository architecture:

```text
Nuxt UI (/snapshots & /instances/:id)
   ↓
useSnapshotsApi() / useImagesApi()
   ↓
useApi() (standardized JSON envelope & request IDs)
   ↓
Nuxt Nitro Server Routes (/api/v1/images, /api/v1/snapshots/*, /api/v1/instances/:id/snapshots)
   ↓
StorageService (domain logic & compute state verification)
   ↓
StorageRepository
   ↓
MockSnapshotProvider (shared in-memory state via globalThis)
```

---

## Files

### Files Created

- `packages/contracts/src/constants/images.ts`: Shared source of truth for OS image catalog.
- `packages/contracts/src/constants/index.ts`: Constants export barrel.
- `apps/dashboard/app/composables/useImagesApi.ts`: Frontend composable for machine images API.
- `apps/dashboard/app/composables/useSnapshotsApi.ts`: Frontend composable for snapshots API.
- `apps/dashboard/app/components/snapshots/CreateSnapshotModal.vue`: Modal to capture snapshot from an instance.
- `apps/dashboard/app/components/snapshots/CopySnapshotModal.vue`: Modal for cross-region replication.
- `apps/dashboard/app/components/snapshots/SnapshotDetailModal.vue`: Detailed metadata drawer/modal.
- `apps/dashboard/server/api/v1/images/index.get.ts`: Nitro endpoint for listing OS images.
- `apps/dashboard/server/api/v1/snapshots/index.get.ts`: Nitro endpoint for listing and filtering snapshots.
- `apps/dashboard/server/api/v1/snapshots/index.post.ts`: Nitro endpoint for creating a snapshot.
- `apps/dashboard/server/api/v1/snapshots/[id]/index.get.ts`: Nitro endpoint for retrieving snapshot by ID.
- `apps/dashboard/server/api/v1/snapshots/[id]/copy.post.ts`: Nitro endpoint for copying snapshot across regions.
- `apps/dashboard/server/api/v1/snapshots/[id]/index.delete.ts`: Nitro endpoint for deleting snapshot.
- `apps/dashboard/server/api/v1/instances/[id]/snapshots.post.ts`: Nitro endpoint for creating snapshot from instance route.
- `backend/tests/storage-snapshots.test.ts`: Vitest test suite for storage service, mock provider, and persistence.
- `memory/PHASE_3_COMPLETION_REPORT.md`: This completion report.

### Files Modified

- `packages/contracts/src/models/snapshot.ts`: Enriched `Snapshot` model (`name`, `region`, `copiedFromSnapshotId`, `instanceName`, `description`).
- `packages/contracts/src/models/instance.ts`: Enriched `OsImage` model (`architecture`, `regions`, `icon`, `badge`).
- `packages/contracts/src/api/snapshots.ts`: Added `ListSnapshotsQuery` contract.
- `packages/contracts/src/index.ts`: Exported constants barrel.
- `backend/shared/providers/snapshot.provider.ts`: Enriched `SnapshotProvider` interface (`listImages`, `listSnapshots` with filters, `CreateSnapshotParams`).
- `backend/shared/providers/mock-snapshot.provider.ts`: Implemented full mock storage provider with deterministic fixtures and true cross-region copy.
- `backend/services/storage/repository.ts`: Connected repository methods to provider interface.
- `backend/services/storage/service.ts`: Connected compute instance verification and structured logging.
- `backend/services/storage/handler.ts`: Updated API Gateway Lambda handler to support images and snapshots.
- `apps/dashboard/app/pages/snapshots/index.vue`: Replaced Phase 0 placeholder with complete management console.
- `apps/dashboard/app/pages/instances/[id].vue`: Upgraded Storage and Snapshots tabs with live snapshot actions.
- `apps/dashboard/app/pages/instances/create.vue`: Refactored image selection to use dynamic image catalog from `useImagesApi()`.

---

## Shared Image Catalog

The single source of truth is defined in `packages/contracts/src/constants/images.ts` and exposed via `GET /api/v1/images`:

| Image ID        | Name               | OS Family | Version               | Arch           | Min Disk | Regions            |
| :-------------- | :----------------- | :-------- | :-------------------- | :------------- | :------- | :----------------- |
| `img-ubuntu-24` | Ubuntu 24.04 LTS   | ubuntu    | Noble Numbat 24.04    | x86_64 / arm64 | 20 GB    | REGION_A, REGION_B |
| `img-ubuntu-22` | Ubuntu 22.04 LTS   | ubuntu    | Jammy Jellyfish 22.04 | x86_64 / arm64 | 20 GB    | REGION_A, REGION_B |
| `img-debian-12` | Debian 12 Bookworm | debian    | Bookworm 12.5         | x86_64         | 15 GB    | REGION_A, REGION_B |
| `img-cirros-06` | CirrOS 0.6.2       | cirros    | Minimal 0.6.2         | x86_64         | 5 GB     | REGION_A, REGION_B |

Both `/snapshots` and `/instances/create` consume this catalog, eliminating duplicate frontend lists.

---

## Snapshot Model & Lifecycle

### Snapshot Fields

```ts
export interface Snapshot {
  id: string
  name: string
  instanceId: string
  instanceName?: string
  status: SnapshotStatus
  region: RegionId // Current physical hosting region
  sourceRegion: RegionId // Originating region of original snapshot
  copiedRegions: RegionId[] // Target regions where copies have been sent
  copiedFromSnapshotId?: string // Parent snapshot ID if created via copy
  sizeGb: number
  description?: string
  createdAt: string
  updatedAt: string
}
```

### Action Availability Matrix

| State       | Copy Action | Delete Action | Reason                                                        |
| :---------- | :---------- | :------------ | :------------------------------------------------------------ |
| `AVAILABLE` | Enabled     | Enabled       | Snapshot is stable and ready for read/copy/delete             |
| `CREATING`  | Disabled    | Disabled      | Initial volume read is in-progress; mutations rejected (409)  |
| `COPYING`   | Disabled    | Disabled      | In-flight cross-region transmission; mutations rejected (409) |
| `ERROR`     | Disabled    | Enabled       | Snapshot failed; copying disallowed but cleanup is permitted  |
| `DELETING`  | Disabled    | Disabled      | Resource is undergoing teardown                               |

---

## APIs Implemented

| Method   | Endpoint                          | Description                                                             | Status Code          |
| :------- | :-------------------------------- | :---------------------------------------------------------------------- | :------------------- |
| `GET`    | `/api/v1/images`                  | List available base OS images                                           | 200                  |
| `GET`    | `/api/v1/snapshots`               | List snapshots with optional `instanceId`, `region`, `status`, `search` | 200                  |
| `GET`    | `/api/v1/snapshots/:id`           | Get snapshot by ID                                                      | 200 (or 404)         |
| `POST`   | `/api/v1/snapshots`               | Create snapshot from instance payload                                   | 201                  |
| `POST`   | `/api/v1/instances/:id/snapshots` | Create snapshot for instance `:id`                                      | 201                  |
| `POST`   | `/api/v1/snapshots/:id/copy`      | Replicate snapshot to opposite region                                   | 200 (or 400/409/404) |
| `DELETE` | `/api/v1/snapshots/:id`           | Permanently delete snapshot                                             | 200 (or 404/409)     |

---

## Persistence Mechanism

Mock storage state persists in-memory using `globalThis.__xregion_snapshot_provider__` in `backend/shared/providers/provider-factory.ts`.

- **Across Nitro requests**: State remains persistent throughout the server process lifetime.
- **Server restart**: Reinitializes state to the deterministic initial fixtures (`snap-001`, `snap-001-copy-va`, `snap-002`, `snap-003`).
- **Test reset**: `resetMockProviders()` resets all singleton instances for isolated unit and integration testing.

---

## Cross-Region Replication Behavior

- When copying a snapshot in `REGION_A` (`ap-southeast-1`), the target must be `REGION_B` (`us-east-1`), and vice versa.
- Attempting to copy to the same region is rejected with a `422 ValidationError`.
- Attempting to copy a non-available snapshot is rejected with a `409 InvalidStateError`.
- The source snapshot remains untouched in its original region, with `copiedRegions` updated to record the destination.
- The destination snapshot is created with:
  - Unique ID: `snap-copy-...`
  - Name: `<source-name>-copy-<sg|va>`
  - Provenance: `copiedFromSnapshotId = sourceSnap.id`
  - Preserved storage size: exactly matches source size.

---

## Quality Gates Results

| Check                    | Command             | Result                                                                  |
| :----------------------- | :------------------ | :---------------------------------------------------------------------- |
| Code Formatting          | `pnpm format:check` | PASSED (All files conform to Prettier)                                  |
| Linter                   | `pnpm lint`         | PASSED (0 errors, 0 warnings across all workspaces)                     |
| Typecheck                | `pnpm typecheck`    | PASSED (0 errors in contracts, backend, and dashboard)                  |
| Unit & Integration Tests | `pnpm test`         | PASSED (6 test files, 47 tests passed)                                  |
| Production Build         | `pnpm build`        | PASSED (Nuxt 4.6.2 and Nitro server bundle built successfully in 48.8s) |

---

## Runtime Smoke Test Results

Executed live against `http://localhost:3000`:

1. **Flow A — Images**:
   - `GET /api/v1/images` -> Returned 4 deterministic images with complete metadata and dual-region availability.
2. **Flow B — Create Snapshot**:
   - `POST /api/v1/instances/vm-prod-01/snapshots` with `phase3-test-snapshot` -> Succeeded (201). Created `snap-mvq3wqkx-4qyd` in `REGION_A` with 50 GB.
3. **Flow C — Cross-Region Copy**:
   - `POST /api/v1/snapshots/snap-mvq3wqkx-4qyd/copy` with destination `REGION_B` -> Succeeded (200). Generated `snap-copy-mvq3wv16-zzus` in `REGION_B` with 50 GB and `copiedFromSnapshotId: snap-mvq3wqkx-4qyd`.
   - Verified source snapshot retained `region: REGION_A` and recorded `copiedRegions: ["REGION_B"]`.
4. **Flow D — Delete Copy**:
   - `DELETE /api/v1/snapshots/snap-copy-mvq3wv16-zzus` -> Succeeded (200).
   - Subsequent `GET /api/v1/snapshots/snap-copy-mvq3wv16-zzus` returned controlled `404 Not Found`.
   - Verified original snapshot `snap-mvq3wqkx-4qyd` remained intact and accessible.
5. **Flow E — Invalid Operations**:
   - Copy nonexistent snapshot (`snap-phantom`) -> Returned controlled `404 Not Found`.
   - Create snapshot for nonexistent instance (`vm-ghost-999`) -> Returned controlled `404 Not Found`.
   - Copy snapshot to same region (`REGION_A` -> `REGION_A`) -> Returned controlled `422 Validation Error`.
6. **Phase 2 Regression Protection**:
   - `POST /api/v1/instances` with `img-ubuntu-24` -> Succeeded (201). Created running instance `phase3-compat-check` (`vm-mvq3ycm8`).

---

## Cloud Safety & Regions Verification

- Zero real cloud mutations were executed.
- No cloud credentials or secret tokens exist in the repository.
- Regions strictly normalized to:
  - `REGION_A`: `ap-southeast-1` (Singapore)
  - `REGION_B`: `us-east-1` (N. Virginia)
- Zero references to `ap-southeast-2` or `Sydney` in runtime code or templates.
