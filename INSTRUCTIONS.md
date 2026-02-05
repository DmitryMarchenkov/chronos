# Project Instructions

## Coding rules

- Use TypeScript for all Node.js/React code.
- Validate all API payloads (body, querystring, params) with 'Zod' schemas from `@chronos/shared-validation`.
- Use `@chronos/shared-types` and `@chronos/shared-rbac` for shared enums/helpers.
- Enforce tenant scoping for every client-scoped API route.
- Use RBAC helpers from @chronos/shared-rbac.
- Use the standard API error envelope: { "error": { "code": "STRING", "message": "STRING", "details"?: "ANY" } }.

## Architecture Rules

- API: Fastify + Prisma.
- Web: React + React Router.
- Database access goes through Prisma only (no raw SQL / other ORMs).
- Tenant scoping (mandatory): every client-scoped API route must enforce tenant isolation:
  - Every Prisma query for client-scoped entities must include tenantId in where.
  - Every Prisma create for client-scoped entities must set tenantId.
- RBAC:
  - VIEWER: read-only
  - CONSULTANT: create/update/delete (no member management)
  - OWNER: full access + manages members (invite/remove/change role)

## Commands
For setup and run commands, see README.md (Quickstart / Useful Commands).