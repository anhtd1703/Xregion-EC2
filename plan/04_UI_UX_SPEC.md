# UI / UX Specification

## 1. Design direction

Visual style:

- dark cloud-management dashboard
- compact but readable
- AWS-console inspired, but simpler
- clear status badges
- high information density
- consistent cards and tables
- responsive desktop-first design

Use:

- Nuxt UI components where practical
- Tailwind CSS for layout and custom styling
- Lucide icons through the supported Nuxt UI/icon integration

Avoid building a custom component if Nuxt UI already provides a suitable accessible component.

---

## 2. Main navigation

```text
OVERVIEW
- Dashboard

COMPUTE
- Instances
- Images & Snapshots

CROSS-REGION
- Migration Scenarios
- Migration History

NETWORK
- Networking
- DNS Routing

OBSERVABILITY
- Monitoring
- Logs

SECURITY
- Access & Security
```

For MVP, Access & Security may initially contain only basic identity/session information.

---

## 3. Dashboard `/`

Cards:

- Total instances
- Running instances
- Migration count / success rate
- Estimated monthly cost

Sections:

- Region A overview
- Region B overview
- Recent migrations
- Cost comparison
- system health

---

## 4. Instances `/instances`

Top actions:

- search
- status filter
- region filter
- Fast Migrate
- Launch Instance

KPI cards:

- total
- running
- stopped
- migrating

Table columns:

- instance ID
- name
- current region
- flavor
- IP
- status
- estimated cost
- actions

Actions:

- View
- Start
- Stop
- Restart
- Create snapshot
- Migrate
- Delete

---

## 5. Launch Instance `/instances/create`

Sections:

1. Basic details
2. Initial region
3. OS image
4. Instance flavor
5. Block storage
6. Networking and security

Sticky summary panel:

- selected region
- image
- vCPU
- RAM
- disk
- firewall
- estimated hourly/monthly cost

Primary action:

`Launch Compute Instance`

---

## 6. Instance Detail `/instances/:id`

Header:

- name
- status
- region
- actions

Tabs:

- Overview
- Monitoring
- Storage
- Networking
- Snapshots
- Activity

Overview:

- instance ID
- image
- flavor
- IP
- created time
- storage
- status

---

## 7. Snapshots `/snapshots`

Tabs:

- Images
- Snapshots

Snapshot table:

- snapshot ID
- source instance
- source region
- copied region
- size
- state
- created time

Actions:

- copy
- create volume
- delete

---

## 8. Migration Scenarios `/migrations/scenarios`

Top actions:

- Trigger Manual Migration
- Create Scenario

KPI cards:

- active scenarios
- estimated monthly saving
- success rate
- migrations running now

Scenario card/table fields:

- scenario name
- target instance
- source region
- destination region
- schedule
- auto-DNS
- status

Actions:

- enable
- pause
- edit
- delete
- run now

---

## 9. Create Scenario

Inputs:

- scenario name
- target instance
- destination region
- trigger type: Manual / Scheduled
- schedule
- timezone
- auto update Route53
- rollback on failure
- notification preference
- cooldown

---

## 10. Migration Execution `/migrations/:id`

This is a primary demo page.

Header:

- instance
- source -> destination
- current status
- elapsed time

Timeline:

```text
1. Pre-check
2. Stop source VM
3. Snapshot and copy
4. Restore destination VM
5. Health check
6. Switch DNS
```

Show for each step:

- state
- start/end
- message
- progress where relevant

Side panel:

- migration ID
- source
- destination
- snapshot
- DNS mode
- rollback mode

Bottom:

- structured activity log

Failure UI must visibly show rollback status.

---

## 11. Migration History

Columns:

- time
- instance
- source
- destination
- duration
- trigger
- result

Click row -> migration detail.

---

## 12. Monitoring `/monitoring`

Filters:

- instance
- time range: 1h / 24h / 7d

Charts:

- CPU
- RAM
- Network In
- Network Out

Cost cards:

- current region
- alternative region
- estimated monthly saving

---

## 13. Logs `/logs`

Filters:

- service
- severity
- instance
- migration
- time range

Columns:

- timestamp
- level
- service
- event
- resource

Click -> drawer with structured log data.

---

## 14. Networking `/network`

Show simplified infrastructure:

- Region A VPC
- public subnet
- private subnet
- gateway status
- security groups

Same for Region B.

Do not build an AWS-console-level network editor.

---

## 15. DNS `/network/dns`

Show:

- application domain
- current active region
- current Route53 target
- Region A load balancer health
- Region B load balancer health
- automatic DNS switching enabled/disabled

Manual DNS changes require confirmation.

---

## 16. Universal page states

Every resource page should support:

- loading skeleton
- error state
- empty state
- successful content
- refresh

Destructive actions require confirmation modal.
