# Decisions

## 2026-02-12
- Adopt SOLID, DRY, KISS, and YAGNI as required engineering principles for API, web, and shared libraries.
- Standardize layered boundaries: routes orchestrate, services own domain logic, repositories own Prisma persistence concerns.
- Keep `docs/engineeringpractices.md` as the normative policy source; keep architecture/security/testing docs implementation-focused and linked to policy.
- Enforce secure-by-default delivery gates in pull requests: tenant scope, RBAC, validation coverage, safe error handling, and required CI checks.

## 2026-02-04
- Use Nx integrated workspace for monorepo structure.
- Use Fastify + Prisma for API and persistence.
- Use React + React Router for the web UI.
- Use shared libraries for types, validation, and RBAC helpers.
- Use Docker Compose for local Postgres.
