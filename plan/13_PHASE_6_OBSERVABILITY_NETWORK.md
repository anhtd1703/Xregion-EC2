# Phase 6 — Monitoring, Logs, Networking and DNS

## Goal

Complete the operational dashboard.

---

## Monitoring

Route:

```text
/monitoring
```

Filters:

- instance
- time range

Charts:

- CPU
- RAM
- network in
- network out

Ranges:

- 1h
- 24h
- 7d

Use mock metric series.

---

## Cost

Display:

- hourly estimate
- monthly estimate
- Region A estimate
- Region B estimate
- potential saving

Cost numbers in mock mode are illustrative test data.

Do not claim mock values are live AWS billing.

---

## Logs

Route:

```text
/logs
```

Filters:

- service
- severity
- instance
- migration
- time

Use structured log fixtures.

A log detail drawer should show metadata.

---

## Networking

Route:

```text
/network
```

Show simplified VPC/subnet/security group view for both regions.

Do not attempt to clone full AWS VPC Console.

---

## DNS

Route:

```text
/network/dns
```

Show:

- configured domain
- active region
- Route53 target
- load-balancer health
- automatic switching status

Manual switching requires confirmation.

---

## Completion criteria

The dashboard communicates resource health, migration history and active routing clearly.
