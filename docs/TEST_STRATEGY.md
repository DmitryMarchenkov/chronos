# Test Strategy (MVP)

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
- Fastify routes tested via request injection against a test database:
  - auth flow (sign-in, token validity)
  - RBAC enforcement per route
  - tenant isolation for all client-scoped endpoints

### UI Tests (Smoke)
- Basic UI tests for critical flows:
  - sign-in
  - workspace list
  - assessment list + editor read/write behavior based on role

## Tooling
- Jest as the primary test runner.
- Nx targets:
  - `npx nx test` for running tests
  - `npx nx lint` for lint checks

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

## Test Data
- Seed creates at least:
  - Workspace A + OWNER user
  - Workspace B + another OWNER user
  - One shared email that is member in only one workspace (to verify isolation)