# Test Strategy (MVP)

This document captures implementation testing practices. Policy-level quality gates are defined in `docs/engineeringpractices.md`.

Interpretation keywords in this document follow policy language:
- **MUST** / **MUST NOT**: mandatory requirement.
- **SHOULD** / **SHOULD NOT**: strong recommendation; deviation requires justification.

## Scope

### Unit Tests
- Shared libraries (`libs/shared-*`):
  - validation schemas
  - RBAC helpers (role checks, permission mapping)
  - shared types/utility functions
- API helpers:
  - auth/JWT utilities
  - error envelope mapper
  - tenant-scoping helper (where/data enrichment)

### API Integration Tests (MVP-critical)
- Fastify routes **MUST** be tested via request injection against a test database:
  - auth flow (sign-in, token validity)
  - RBAC enforcement per route
  - tenant isolation for all client-scoped endpoints
  - invalid input behavior (body/query/params schema failures)
  - neutral errors for unauthorized cross-tenant access patterns

### UI Tests (Smoke)
- Basic UI tests for critical flows:
  - sign-in
  - workspace list
  - assessment list + editor read/write behavior based on role

## Tooling
- Jest as the primary test runner.
- CI and local verification **MUST** include Nx targets:
  - `npx nx test` for running tests
  - `npx nx lint` for lint checks
  - `npx nx build` for build verification
  - `npx nx run-many -t typecheck` (or project equivalent) for type safety

## MVP Focus (Must-Have Assertions)

### Auth
- Invalid credentials return the standard error envelope.
- Authenticated requests require a valid JWT.

### RBAC
- VIEWER cannot create/update/delete assessments.
- CONSULTANT can create/update assessments but cannot manage members.
- OWNER can manage members and has full access within the workspace.

### Tenant Isolation
- A user cannot read or mutate any resource from a workspace where they are not a member.
- All write operations set `tenantId/workspaceId` server-side (client cannot override it).
- List endpoints return only resources scoped to the current workspace.

### Resilience and Scalability Checks
- List endpoints **MUST** enforce max page size.
- Critical external calls **SHOULD** have timeout behavior tested.
- Error paths **MUST** be validated for safe envelope format and non-sensitive messages.

## Maintainability Quality Gates

- Every changed API route **MUST** have:
  - authz regression assertions,
  - tenant-scope regression assertions,
  - validation failure assertions.
- Shared contracts and validation schemas **MUST** include contract tests when changed.
- Merge criteria **MUST** include lint, typecheck, tests, and build.
- Teams **SHOULD** add focused regression tests for each production bug fix.

## Test Data
- Seed creates at least:
  - Workspace A + OWNER user
  - Workspace B + another OWNER user
  - One shared email that is member in only one workspace (to verify isolation)