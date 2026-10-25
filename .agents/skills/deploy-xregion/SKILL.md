---
name: deploy-xregion
description: Plan and execute XRegion-EC2 dashboard/backend deployment safely, separating Nuxt EC2 hosting from API Gateway/Lambda deployment and requiring explicit approval before real cloud mutation.
---

# Deploy XRegion

Use for deployment preparation or approved deployment execution.

## Required reading

Read:

- `AGENTS.md`
- `.agents/rules/cloud-safety.md`
- `plan/17_PHASE_10_DEPLOYMENT.md`
- `plan/01_PROJECT_ARCHITECTURE.md`

## Architecture

Frontend and backend are in one monorepo but deploy independently.

```text
apps/dashboard
    ↓
EC2 + Nginx + systemd

backend/services/*
    ↓
API Gateway + Lambda

packages/contracts
    ↓
shared build-time dependency, not a standalone deployment
```

## Safety gate

Before ANY real cloud mutation, stop and present:

- AWS account/environment if known
- region
- resource
- exact command/action
- expected cost impact
- destructive impact
- rollback

Do not proceed without explicit human approval.

## Frontend deployment checklist

- build dashboard
- provision/use small Ubuntu EC2
- Nginx reverse proxy
- Nuxt bound to localhost:3000
- public 80/443 only
- SSH restricted
- systemd service
- domain DNS
- HTTPS certificate
- restart/reboot verification

## Backend deployment checklist

Deploy separately:

- Lambda packages
- API Gateway routes
- DynamoDB configuration
- IAM roles
- EventBridge schedules
- Route53 permissions

Do not deploy all services if only one changed unless infrastructure tooling requires it.

## CI/CD

Only automate after manual deployment works.

Prefer path-based workflows:

```text
apps/dashboard/** -> frontend pipeline
backend/** -> backend pipeline
packages/contracts/** -> both
```

## Verification

After deployment verify:

- dashboard HTTPS
- API health
- auth
- representative instance API
- migration status API
- CORS
- logs
- no secrets in browser bundle
