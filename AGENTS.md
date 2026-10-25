# AGENTS.md — XRegion-EC2

This file defines the permanent operating rules for AI coding agents working in this repository.

## 1. Required reading

Before making changes, the agent MUST read:

1. `plan/00_START_HERE.md`
2. `plan/01_PROJECT_ARCHITECTURE.md`
3. `plan/03_CODING_RULES.md`
4. `plan/05_API_CONTRACT.md`
5. `plan/06_DATA_MODELS.md`
6. The phase file relevant to the current task
7. Any relevant files in `.agents/rules/`
8. The relevant skill in `.agents/skills/` when the task matches one

Do not start coding before inspecting the repository and understanding current implementation.

## 2. Source of truth

Use this precedence:

```text
Human instruction in the current task
        ↓
AGENTS.md
        ↓
plan/
        ↓
.agents/rules/
        ↓
.agents/skills/
        ↓
existing code conventions
```

If two instructions conflict, do not silently choose. Report the conflict and follow the highest-priority instruction.

## 3. Architecture constraints

- Nuxt 4 + Vue 3 + TypeScript.
- Tailwind CSS + Nuxt UI.
- Pinia only for genuinely shared client state.
- Frontend MUST NOT call AWS/OpenStack directly.
- Frontend talks only to XRegion backend APIs.
- Backend follows API Gateway + Lambda architecture.
- No NestJS unless explicitly approved later.
- Infrastructure integrations must be behind provider/adapter interfaces.
- Shared contracts belong in `packages/contracts`.
- Default development mode is mock-first.

## 4. Cloud safety

Never create, modify, terminate, delete, migrate, or reconfigure real AWS/OpenStack resources without explicit human authorization for that operation.

Before real infrastructure mutation, show:

- target environment/account/project
- target region
- affected resource(s)
- intended operation
- destructive/cost impact
- rollback or recovery plan when applicable

Never commit credentials, access keys, private keys, secrets, or tokens.

Prefer IAM roles and external environment configuration.

## 5. Coding discipline

- TypeScript strict mode.
- Avoid `any`.
- Do not modify unrelated files.
- Reuse existing shared components and contracts.
- Keep handlers thin and services focused.
- Do not put infrastructure logic in Vue components.
- Do not hide errors.
- Use stable application error codes.
- Write structured logs.
- Keep migration steps idempotent where practical.

## 6. Mandatory verification

Before considering a task complete, run the relevant:

- formatter
- lint
- typecheck
- tests
- build when appropriate

If a check cannot run, clearly explain why.

## 7. Required final report

After implementation, report:

1. files created
2. files modified
3. architecture decisions
4. commands executed
5. lint/typecheck/test/build results
6. assumptions
7. remaining TODOs

## 8. Phase control

Do not automatically continue to the next major phase.

Complete the current phase, report results, and stop unless the human explicitly requests the next phase.

## 9. Skills

Use the relevant workspace skill when appropriate:

- `implement-frontend-page`
- `implement-api`
- `review-code`
- `verify-project`
- `deploy-xregion`

Skills define reusable execution procedures, but they do not override architecture or safety rules.
