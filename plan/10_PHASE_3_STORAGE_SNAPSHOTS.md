# Phase 3 — Images and Snapshots

## Goal

Implement image selection and snapshot management.

---

## Routes

```text
/snapshots
```

Tabs:

```text
Images
Snapshots
```

---

## Images

Display:

- image ID
- name
- OS
- version
- architecture
- region availability

The Create Instance page should consume this API instead of hardcoded image cards.

---

## Snapshots

Display:

- snapshot ID
- source instance
- source region
- copied regions
- size
- status
- creation time

Actions:

- create snapshot
- copy snapshot to another region
- delete snapshot

Use mock progress/state transitions.

---

## Provider

Create:

```ts
interface SnapshotProvider
```

Mock implementation only.

Design the interface so it can later wrap AWS EBS Snapshot APIs.

---

## Completion criteria

Snapshots participate in the mock migration story and are reusable by the migration engine.
