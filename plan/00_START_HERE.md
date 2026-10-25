# XRegion-EC2 — START HERE

## 1. Purpose

This folder is the execution plan for the **XRegion-EC2** Cloud Computing capstone project.

XRegion-EC2 is a cloud-management control plane that provides an EC2-like experience for creating and managing virtual machines, with the distinguishing feature of **cross-region VM migration**.

The target system includes:

- Admin authentication
- Instance lifecycle management
- Images and snapshots
- Migration scenarios
- Manual and scheduled migration
- Migration progress tracking
- Auto rollback
- Automatic DNS switching
- Monitoring
- Logs
- Cost estimation

The frontend will be implemented with:

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- Nuxt UI
- Pinia
- VueUse

The backend control plane will use:

- Amazon API Gateway
- AWS Lambda with TypeScript
- Amazon DynamoDB
- Amazon EventBridge Scheduler
- Amazon CloudWatch
- Amazon Route 53
- AWS SDK v3
- OpenStack APIs: Keystone, Nova, Neutron, Glance

Deployment of the dashboard:

- AWS EC2
- Ubuntu
- Nginx
- systemd
- HTTPS with Let's Encrypt / Certbot

---

## 2. IMPORTANT: Agent execution rules

Before writing any code, the agent MUST read these files in this order:

1. `00_START_HERE.md`
2. `01_PROJECT_ARCHITECTURE.md`
3. `02_REPOSITORY_STRUCTURE.md`
4. `03_CODING_RULES.md`
5. `04_UI_UX_SPEC.md`
6. `05_API_CONTRACT.md`
7. `06_DATA_MODELS.md`
8. The phase file currently being implemented.

Do not start coding before understanding the architecture and constraints.

---

## 3. Main architecture rule

The dashboard MUST NOT directly call AWS or OpenStack APIs.

Correct:

```text
Nuxt Dashboard
      |
      v
API Gateway
      |
      v
AWS Lambda
      |
      +---- AWS APIs
      |
      +---- OpenStack APIs
```

Incorrect:

```text
Vue Component
      |
      v
AWS SDK / OpenStack directly
```

---

## 4. Development strategy

The project MUST be developed using **mock-first architecture**.

Order:

```text
UI
-> Mock API
-> Stable frontend flows
-> Backend interfaces
-> Mock backend providers
-> Real AWS/OpenStack providers
-> Integration
-> Deployment
```

Do NOT connect real AWS/OpenStack infrastructure during the first frontend phases.

---

## 5. Phases

| Phase | Goal |
|---|---|
| 0 | Initialize repository and engineering foundations |
| 1 | Build design system, app shell and mock API |
| 2 | Implement instance management |
| 3 | Implement images and snapshots |
| 4 | Implement migration scenarios |
| 5 | Implement migration execution and rollback |
| 6 | Implement monitoring, logs, networking and DNS |
| 7 | Connect real AWS/OpenStack infrastructure |
| 8 | Authentication and security hardening |
| 9 | Testing and end-to-end validation |
| 10 | EC2 deployment, domain, HTTPS and CI/CD |

Each phase has its own Markdown file.

---

## 6. Definition of done for every phase

A phase is complete only when:

- The implementation matches the plan.
- TypeScript passes without errors.
- Lint passes.
- Relevant tests pass.
- Loading state exists.
- Empty state exists where applicable.
- Error state exists.
- No secrets are hard-coded.
- No unrelated files are modified.
- Documentation is updated where necessary.
- The agent reports:
  - files created
  - files modified
  - tests executed
  - remaining TODOs

---

## 7. First task for Gemini / Antigravity

Read all specification files in `plan/`.

Then execute only:

`07_PHASE_0_PROJECT_INITIALIZATION.md`

Do not implement application features yet.

At the end, show:

1. Final repository tree.
2. Dependencies installed.
3. Commands available.
4. Environment variables required.
5. Test/lint/typecheck results.
6. Any assumptions made.


## Antigravity workspace extensions

This repository also uses:

```text
AGENTS.md
.agents/rules/
.agents/skills/
```

Purpose:

- `AGENTS.md`: permanent project-wide AI agent rules.
- `.agents/rules/`: domain-specific coding and cloud-safety rules.
- `.agents/skills/`: reusable execution procedures.

Before implementing a task, the agent should identify whether one of these skills applies:

```text
implement-frontend-page
implement-api
review-code
verify-project
deploy-xregion
```

`plan/` remains the product/architecture source of truth.

Skills describe HOW to execute recurring tasks; they do not replace phase plans or architecture.
