# PRD - Chronos

## Goal
Build a multi-tenant B2B consulting delivery platform for client assessments. The system must enforce tenant isolation (workspace scoping) and role-based access control (RBAC).

## Users & Roles
- OWNER: manages workspaces and members; full access to all workspace data.
- CONSULTANT: creates/updates assessments within a workspace; cannot manage members.
- VIEWER: read-only access within a workspace.

## Tenancy Model
- A Workspace is the tenant boundary.
- All client-scoped data (memberships, assessments, assessment items/scores) must be scoped to a workspace.
- A user may belong to multiple workspaces with potentially different roles.

## MVP Scope

### Authentication
- Email + password sign-up/sign-in.
- Passwords hashed (argon2).
- JWT-based auth for API; web stores token and uses it for API requests.

### Workspaces & Memberships
- Create workspace (OWNER only).
- List workspaces where the user is a member.
- Manage members (OWNER only):
  - invite/add member (by email)
  - change role (OWNER/CONSULTANT/VIEWER)
  - remove member

### Assessments
- Create assessment (OWNER/CONSULTANT).
- View assessment list per workspace (all roles).
- Edit assessment (OWNER/CONSULTANT), view only for VIEWER.
- Domain scoring:
  - Assessment contains a set of domains.
  - Each domain has a numeric score and an optional comment.
  - (Exact domain list and score scale are defined in the UI/API contract for MVP.)

### Web UI (minimum screens)
- Sign-in page
- Workspace list page (user’s workspaces)
- Assessment list page (within workspace)
- Assessment editor page (domain scoring + comments)

### Local Development
- Postgres runs locally via Docker Compose.
- Prisma migrations + seed create:
  - one default workspace
  - one OWNER user (seed credentials)
  - optional sample assessment

## Out of Scope (MVP)
- Billing, notifications, marketing pages
- Production infra deployment (AWS, CI/CD hardening, monitoring)
- SSO / external identity providers
- Advanced reporting / exports

## Success Criteria (Definition of Done)
- Tenant isolation: a user cannot access data from a workspace where they are not a member (API enforced).
- RBAC enforced on API routes (OWNER/CONSULTANT write, VIEWER read-only; OWNER manages members).
- End-to-end flow works locally:
  - sign in → select workspace → create/edit assessment → viewer can only read.
- Seeded environment works with one command sequence (Quickstart).