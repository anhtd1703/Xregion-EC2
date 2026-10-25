---
name: verify-project
description: Run and interpret XRegion-EC2 project quality checks including formatting, lint, typecheck, tests, build, and basic repository consistency checks.
---

# Verify Project

Use after implementation or before commit/deploy.

## 1. Inspect available scripts

Read root `package.json` and workspace package scripts.

Use existing project commands rather than inventing incompatible ones.

## 2. Execute checks

Run available relevant checks:

```text
format check or formatter
lint
typecheck
tests
build
```

For monorepo, verify both dashboard and backend/shared packages.

## 3. Do not hide failures

If a command fails:

- capture the actual cause
- identify whether caused by the current change or pre-existing
- fix current-change failures when within scope
- do not disable checks merely to pass

## 4. Repository consistency

Check:

- no `.env` secrets committed
- no obvious access keys/private keys
- shared contracts compile
- workspace dependencies resolve
- no accidental generated junk committed

## 5. Report

Use:

```text
PASS / FAIL / NOT RUN
```

for:

- format
- lint
- typecheck
- tests
- build

Include concise failure reason and affected package.
