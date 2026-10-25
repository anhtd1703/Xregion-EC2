# Phase 10 — Deployment, Domain, HTTPS and CI/CD

## Goal

Deploy the dashboard safely on a small AWS EC2 instance.

This dashboard EC2 is separate from the Bare Metal/OpenStack infrastructure.

---

## Architecture

```text
Internet
  |
Domain
  |
Elastic IP
  |
EC2 Ubuntu
  |
Nginx :80/:443
  |
Nuxt Node server :3000
```

Port 3000 must not be public.

---

## EC2 setup

Use a small instance sufficient for dashboard demo.

Install:

```bash
sudo apt update
sudo apt install -y nginx git
```

Install current Node.js LTS using a trusted installation method.

Clone repository.

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Build:

```bash
pnpm build
```

---

## systemd

Create a systemd service for the Nuxt production server.

Concept:

```ini
[Unit]
Description=XRegion Dashboard
After=network.target

[Service]
WorkingDirectory=/opt/xregion-ec2/apps/dashboard
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Adjust Node path and working directory to actual installation.

Use an EnvironmentFile for secrets/config if needed.

---

## Nginx

Proxy HTTPS traffic to localhost:3000.

Concept:

```nginx
server {
    listen 80;
    server_name dashboard.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Domain

A low-cost registrar may be used.

Recommended split:

```text
Registrar: inexpensive registrar
DNS: Cloudflare or Route53
Hosting: AWS EC2
```

The project may still use Route53 separately for XRegion's migration/DNS feature.

---

## HTTPS

Install Certbot with Nginx support and issue a Let's Encrypt certificate.

Verify automatic renewal.

---

## Security group

Allow:

```text
22  SSH    trusted admin IP only
80  HTTP   public
443 HTTPS  public
```

Do not open:

```text
3000
```

to the Internet.

---

## CI/CD

Only add after manual deployment works.

Simple GitHub Actions strategy:

```text
push main
-> CI checks
-> SSH EC2
-> git pull / deploy artifact
-> pnpm install
-> pnpm build
-> restart systemd
```

Avoid exposing a long-lived private SSH key if a safer deployment mechanism is available.

For a university MVP, document whichever approach is chosen.

---

## Deployment checklist

- domain resolves
- HTTPS valid
- HTTP redirects HTTPS
- dashboard process auto-starts after reboot
- API base URL points to deployed API Gateway
- CORS configured
- no secret appears in browser bundle
- mock fallback remains available if needed
