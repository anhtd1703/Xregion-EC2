# Cloud Safety Rules

Applies to real AWS/OpenStack integration and deployment.

## Hard safety rule

The agent must NOT perform real cloud mutation without explicit human authorization for the concrete operation.

Mutation includes:

- create EC2 instance
- terminate EC2 instance
- create/delete EBS snapshot
- copy snapshot across regions
- create/delete volume
- create/update Route53 record
- deploy/modify Lambda
- change IAM
- create/delete EventBridge schedules
- create/delete OpenStack VM
- change OpenStack networking
- modify security groups

## Before execution

Show:

1. provider
2. account/project when known
3. region
4. resource
5. exact operation
6. possible cost
7. destructive impact
8. rollback strategy

## Credentials

Never print or commit:

- AWS access key
- AWS secret
- Keystone password
- SSH private key
- long-lived token

Prefer IAM roles.

## Network security

- expose 80/443 publicly
- restrict SSH
- do not expose Nuxt port 3000 publicly
- avoid public access to internal OpenStack APIs unless required and secured

## Demo fallback

Preserve `mock` mode so the university demo can continue if real cloud resources fail.
