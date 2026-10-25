# Phase 0 — Project Initialization

## Goal

Create a clean, runnable monorepo with engineering foundations.

Do NOT implement real application features in this phase.

---

## 1. Prerequisites

Required locally:

- Node.js LTS
- pnpm
- Git

Optional until infrastructure phases:

- AWS CLI
- Terraform
- Docker

---

## 2. Initialize repository

If no repository exists:

```bash
mkdir xregion-ec2
cd xregion-ec2
git init
pnpm init
```

Copy the provided `plan/` directory into the repository root.

Create:

```text
AGENTS.md
README.md
.env.example
.editorconfig
.gitignore
pnpm-workspace.yaml
```

---

## 3. Initialize Nuxt dashboard

Create Nuxt app under:

```text
apps/dashboard
```

Use the official current Nuxt project initializer.

Target:

- Nuxt 4
- TypeScript
- SSR enabled
- Tailwind through Nuxt UI / supported current integration
- Nuxt UI
- Pinia
- VueUse

Do not manually install obsolete Nuxt 3 packages.

After initialization, verify:

```bash
pnpm dev
```

works.

---

## 4. Create shared contracts package

Create:

```text
packages/contracts
```

Purpose:

- shared TypeScript models
- enums
- API envelope
- DTO contracts

Set up TypeScript.

Frontend and backend must import from this package.

---

## 5. Initialize backend workspace

Create:

```text
backend/
backend/services/
backend/shared/
backend/tests/
```

Use TypeScript.

Do not add NestJS.

Create placeholder service packages/modules for:

```text
auth
compute
storage
scenarios
migration
monitoring
network
```

Each service should compile but does not need actual AWS logic yet.

---

## 6. Root scripts

Root package should expose commands similar to:

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

The exact implementation may use workspace recursive commands.

---

## 7. Code quality

Set up:

- ESLint
- Prettier
- TypeScript strict mode

Do not create conflicting lint/prettier configurations.

Prefer Nuxt's current recommended lint integration for the dashboard.

---

## 8. Environment file

Create `.env.example`.

Suggested placeholders:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8787/api/v1

AWS_REGION_A=ap-southeast-1
AWS_REGION_B=us-east-1

DYNAMODB_MIGRATIONS_TABLE=xregion-migrations
DYNAMODB_SCENARIOS_TABLE=xregion-scenarios

KEYSTONE_BASE_URL=
KEYSTONE_PROJECT_NAME=

ROUTE53_HOSTED_ZONE_ID=
ROUTE53_RECORD_NAME=

APP_ENV=development
```

Do NOT put real credentials in `.env.example`.

---

## 9. Create AGENTS.md

At the root, create an `AGENTS.md` containing:

- requirement to read `/plan`
- architecture constraints
- mock-first development
- no direct AWS calls from frontend
- no hardcoded secrets
- run lint/typecheck/tests
- report changed files
- do not perform real cloud mutations unless explicitly requested

It can summarize `plan/03_CODING_RULES.md`.

---

## 10. Dashboard route placeholders

Create page placeholders only:

```text
/
login
instances
instances/create
snapshots
migrations/scenarios
migrations/history
monitoring
logs
network
network/dns
```

They may display simple titles.

Do not build feature UI yet.

---

## 11. Mock infrastructure foundation

Create an environment switch concept:

```text
mock
real
```

Example:

```env
XREGION_PROVIDER_MODE=mock
```

Backend provider factory:

```ts
getComputeProvider()
getSnapshotProvider()
getDnsProvider()
```

In mock mode, providers return deterministic fake data.

Real providers are not implemented yet.

---

## 12. Completion criteria

Phase 0 is complete when:

- repo structure exists
- Nuxt dashboard runs
- TypeScript works
- Nuxt UI works
- Pinia works
- contracts package compiles
- backend workspace compiles
- lint passes
- typecheck passes
- tests command runs successfully
- no AWS infrastructure has been created
- no credentials are committed

---

## 13. Gemini execution prompt

Use this instruction:

> Read every file in `/plan` before acting. Execute Phase 0 only. Create the repository skeleton exactly following the architecture. Do not implement product features and do not connect to real AWS or OpenStack. Use current stable Nuxt tooling rather than outdated setup commands. Run lint, typecheck and tests at the end, then report the final repository tree and all assumptions.
