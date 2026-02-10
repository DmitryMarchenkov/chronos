# Engineering Practices (Unified)

This document is the single source of truth for Chronos engineering standards, security requirements, testing strategy, and delivery quality gates.

## 1) Scope and terminology

- Tenant boundary in product docs is **Workspace**.
- Current DB/API model names this entity **Client**.
- Mapping:
  - Workspace (PRD) = `Client` (implementation)
  - Workspace membership = `WorkspaceMember`

All teams must keep this mapping explicit in code reviews and docs to avoid tenant-scope mistakes.

## 2) Canonical stack and architecture

- Monorepo: Nx + TypeScript
- API: Fastify + Prisma + PostgreSQL
- Web: React + React Router
- Shared libraries:
  - `@chronos/shared-types`
  - `@chronos/shared-validation`
  - `@chronos/shared-rbac`
- Infra skeleton: AWS CDK app (`apps/infra`)
- AI worker: Python placeholder (`apps/ai-worker`)

Non-negotiables:
- Use Prisma for DB access (no raw SQL/extra ORM).
- Keep tenant scoping enforced in API handlers and Prisma queries.
- Keep RBAC enforcement server-side for all mutable operations.

## 3) Core coding rules

- Use TypeScript for Node.js and React code.
- Validate request **body, querystring, and params** with Zod schemas from `@chronos/shared-validation`.
- Use `@chronos/shared-types` for shared enums/contracts.
- Use `@chronos/shared-rbac` helpers for role checks.
- Return API errors in standard envelope:
  - `{ "error": { "code": "STRING", "message": "STRING", "details"?: "ANY" } }`
- For external data ingestion, always add guardrails (timeout, row limits, payload caps).
- Update `CHANGELOG.md` for every merged change.
- If changing navigation/layout/auth flow, also update `new_screen_template.md`.

## 4) Security baseline

### 4.1 Tenant isolation and RBAC

Must enforce:
- Authenticated user must be a member of target workspace/client.
- All reads are tenant-scoped by server-owned IDs.
- All writes set tenant scope server-side only.
- Role matrix:
  - `OWNER`: full tenant access + member management
  - `CONSULTANT`: create/update assessments, no member management
  - `VIEWER`: read-only

### 4.2 Authentication and secrets

Required practices:
- Password hashing with Argon2 (already used).
- Production `JWT_SECRET` must be mandatory and high entropy (no fallback defaults).
- Token TTL must be explicit and reviewed.
- Add brute-force protection on auth routes (rate limit + lockout/backoff).

### 4.3 API hardening

Required practices:
- Restrict CORS origins by environment (no open wildcard policy in production).
- Validate route params with Zod, not only body/query.
- Avoid resource existence leaks across tenants (prefer tenant-scoped query patterns returning neutral 404).
- Never return bootstrap/temporary credentials in API responses.

### 4.4 Frontend auth storage

Current implementation stores JWT in `localStorage`, which increases XSS blast radius.

Recommended direction:
- Move to HttpOnly, Secure, SameSite cookies and short-lived access tokens.
- If bearer token storage is retained temporarily, add strict CSP and harden all XSS vectors first.

## 5) Performance and scalability baseline

- All list endpoints must be paginated (max page size enforced).
- Add DB indexes for high-frequency filter/sort fields.
- Keep query shape tenant-scoped and avoid N+1 queries.
- Prefer server-side pagination in SQL/Prisma over in-memory slicing.
- Add request timeout budgets and circuit breakers for external fetches.
- Add observability:
  - request latency percentiles
  - error rate by endpoint
  - DB query duration/slow-query alerts

## 6) Testing and quality gates

### 6.1 Required coverage areas

- Unit tests:
  - `shared-validation` schemas
  - `shared-rbac` role logic
  - auth utilities and error mappers
  - tenant-scope helper behavior
- API integration tests:
  - auth flow
  - RBAC matrix by endpoint
  - tenant isolation on all scoped routes
- UI smoke tests:
  - sign-in
  - workspace/client list
  - assessment editor role-based behavior

### 6.2 CI and execution standards

- CI must fail on lint/test/build failures.
- PR checks should include at minimum:
  - lint
  - tests
  - build
- Avoid stale command docs; keep repository commands executable as documented.

## 7) Documentation standards

- Keep `PRD.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `TEST_STRATEGY.md` aligned with implementation.
- Record important architectural choices in `docs/DECISIONS.md`.
- Keep naming consistency explicit until full migration from `Client` to `Workspace` is completed (if migration chosen).

## 8) Audit snapshot (2026-02-10)

### What is implemented well

- Tenant membership checks are present on protected client-scoped API routes.
- RBAC checks are implemented for write/member-management paths.
- Input validation exists for core request bodies and pagination.
- Pagination and basic DB indexing are present for key list endpoints.
- Standard error envelope is consistently used by API error handler.

### High-priority findings

1. **CI/test commands are not reliable as documented**
   - `npx nx lint` and `npx nx test` fail at workspace level because target/project resolution is incomplete.
   - `apps/ai-worker/project.json` uses `@nx/workspace:run-commands`, which is unresolved in current Nx setup.
   - `web:test` fails (`TextEncoder is not defined`) in current Jest environment.

2. **Security hardening gaps**
   - API accepts default JWT secret fallback.
   - CORS is configured as `origin: true` (too permissive for production).
   - No auth rate limiting / brute-force controls on login/register.
   - Member invitation currently issues a static temporary password and returns it in API response.
   - Web stores JWT in `localStorage` (elevated XSS impact).

3. **Documentation-to-code drift**
   - Docs require Zod validation for params; handlers currently cast params directly.
   - Docs specify using shared RBAC helpers; API uses local role-check helpers instead.
   - Test strategy expects substantial unit/integration coverage, but current suite is minimal.
   - PRD states member management includes role changes/removal; routes currently provide list/add only.

### Medium-priority findings

- Assessment score read path paginates in memory after loading full score set.
- Tenant/resource lookup pattern can still reveal resource existence in some flows (403 vs 404 behavior).
- No explicit production security headers baseline (helmet/CSP/HSTS policy not yet codified).

## 9) Prioritized remediation backlog

### P0 (immediate)

- Fix CI command reliability and align docs with real commands.
- Repair web test environment (`TextEncoder` polyfill/setup).
- Replace unresolved ai-worker executors with supported Nx executor.
- Enforce required `JWT_SECRET` for non-dev environments.
- Restrict production CORS origins.
- Add auth rate limiting on `/auth/login` and `/auth/register`.

### P1 (next sprint)

- Stop returning temporary passwords from API; move to secure invite/reset flow.
- Add Zod validation schemas for route params across all API handlers.
- Consolidate role checks through `@chronos/shared-rbac`.
- Add API integration tests for RBAC and tenant isolation scenarios.

### P2 (near-term hardening)

- Move web auth to HttpOnly cookie-based session model.
- Add security headers and CSP policy.
- Add structured observability and SLO-based alerting.
- Revisit naming migration (`Client` -> `Workspace`) to reduce conceptual drift.

## 10) Definition of done for compliance

A change is compliant only when:
- tenant scope + RBAC are enforced server-side,
- validation exists for body/query/params,
- tests cover behavior and negative paths,
- docs and changelog are updated,
- CI executes and passes with documented commands.
