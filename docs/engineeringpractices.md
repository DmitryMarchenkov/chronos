# Engineering Practices (Unified)

This document is the normative source of engineering policy for Chronos. It defines coding principles, security standards, scalability patterns, and quality gates expected from every change.

Interpretation keywords in this document:
- **MUST** / **MUST NOT**: mandatory requirement.
- **SHOULD** / **SHOULD NOT**: strong recommendation; deviation must be justified.
- **MAY**: optional, context-dependent practice.

## 1) Scope and terminology

- Tenant boundary in product docs is **Workspace**.
- Current DB/API model names this entity **Client**.
- Mapping:
  - Workspace (PRD) = `Client` (implementation)
  - Workspace membership = `WorkspaceMember`

All teams **MUST** keep this mapping explicit in code reviews and docs to avoid tenant-scope mistakes.

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
- Teams **MUST** use Prisma for DB access (no raw SQL or additional ORM layers).
- Teams **MUST** enforce tenant scoping in API handlers and Prisma queries.
- Teams **MUST** enforce RBAC server-side for all mutable operations.

## 3) Engineering design principles

These principles apply to API, web, and shared libraries:

- **SOLID**
  - Single Responsibility: each module has one reason to change.
  - Open/Closed: extend behavior through composition/helpers before editing core flows.
  - Liskov + Interface Segregation: shared contracts must be narrow and stable for consumers.
  - Dependency Inversion: route handlers depend on service interfaces/helpers, not concrete infrastructure details.
- **DRY**
  - Teams **MUST** centralize repeated validation, RBAC checks, and shared contracts in `libs/shared-*`.
  - Teams **MUST NOT** copy business rules across routes or pages; extract shared services/utilities.
- **KISS**
  - Teams **SHOULD** choose the simplest implementation that satisfies current functional and non-functional requirements.
  - Teams **SHOULD** favor readable code paths over clever abstractions.
- **YAGNI**
  - Teams **SHOULD NOT** add framework layers, generic abstractions, or feature flags without a documented near-term use case and ADR approval in `docs/DECISIONS.md`.

## 4) Code structure and boundaries

### 4.1 Layer responsibilities

- Route handlers **MUST** do input validation, authentication/authorization, orchestration, and response mapping only.
- Service layer **MUST** own domain logic, policy decisions, and transactional workflows.
- Repository/data layer **MUST** own Prisma queries and persistence details only.
- Shared libraries **MUST** remain reusable and app-agnostic (no app-specific side effects).

### 4.2 Dependency direction

Allowed dependency flow:
- `apps/web` -> API contracts only (no direct DB coupling).
- `apps/api/routes` -> service layer -> repository layer.
- Repository layer -> Prisma client.
- Shared libraries **MAY** be depended on by all layers, but shared libraries **MUST NOT** depend on app-specific modules.

### 4.3 Core coding rules

- Teams **MUST** use TypeScript for Node.js and React code.
- Teams **MUST** validate request body, querystring, and params with Zod schemas from `@chronos/shared-validation`.
- Teams **MUST** use `@chronos/shared-types` for shared enums/contracts.
- Teams **MUST** use `@chronos/shared-rbac` helpers for role checks.
- APIs **MUST** return errors in standard envelope:
  - `{ "error": { "code": "STRING", "message": "STRING", "details"?: "ANY" } }`
- For external data ingestion, teams **MUST** add guardrails (timeout, row limits, payload caps).
- Teams **MUST** update `CHANGELOG.md` for every merged change.
- If changing navigation/layout/auth flow, teams **MUST** also update `new_screen_template.md`.

## 5) Enterprise secure coding standard

### 5.1 Tenant isolation and RBAC

Must enforce:
- Authenticated user **MUST** be a member of target workspace/client.
- All reads **MUST** be tenant-scoped by server-owned IDs.
- All writes **MUST** set tenant scope server-side only.
- Role matrix:
  - `OWNER`: full tenant access + member management
  - `CONSULTANT`: create/update assessments, no member management
  - `VIEWER`: read-only

### 5.2 Authentication, sessions, and secrets

Required practices:
- Password hashing **MUST** use Argon2.
- Production `JWT_SECRET` **MUST** be mandatory and high entropy (no fallback defaults).
- Token TTL **MUST** be explicit and reviewed.
- Auth routes **MUST** have brute-force protection (rate limit + lockout/backoff).
- Teams **SHOULD** prefer HttpOnly, Secure, SameSite cookies for session tokens.

### 5.3 API hardening

Required practices:
- CORS origins **MUST** be restricted by environment (no wildcard policy in production).
- Teams **MUST** validate route params with Zod, not only body/query.
- APIs **MUST** avoid resource existence leaks across tenants (prefer neutral 404 for unauthorized cross-tenant lookups).
- APIs **MUST NOT** return bootstrap/temporary credentials in responses.
- Services **MUST** redact secrets, tokens, and credential-like values from logs and error details.

### 5.4 Dependency and supply-chain hygiene

- Teams **SHOULD** pin and review critical security dependencies.
- CI **MUST** run vulnerability scanning and teams **MUST** triage findings by severity.
- Teams **MUST** keep runtime/framework versions on supported release lines.

## 6) Scalability and reliability patterns

- All list endpoints **MUST** be paginated and enforce a max page size.
- Teams **SHOULD** add DB indexes for high-frequency filter/sort fields.
- Teams **MUST** keep query shape tenant-scoped and avoid N+1 queries.
- Teams **MUST** prefer server-side pagination in SQL/Prisma over in-memory slicing.
- Services **MUST** use explicit timeouts and retry budgets for outbound dependencies.
- Mutable APIs exposed to retries **SHOULD** use idempotency keys or deterministic deduping.
- Teams **SHOULD** define graceful degradation paths for non-critical external dependencies.
- Teams **MUST** track observability signals:
  - request latency percentiles
  - error rate by endpoint
  - DB query duration and slow-query alerts

## 7) Testing and quality gates

### 7.1 Required coverage areas

- Unit tests:
  - `shared-validation` schemas
  - `shared-rbac` role logic
  - auth/session utilities and error mappers
  - tenant-scope helper behavior
- API integration tests:
  - auth flow
  - RBAC matrix by endpoint
  - tenant isolation on all scoped routes
  - failure-path behavior (invalid input, rate limits, unauthorized access)
- UI smoke tests:
  - sign-in
  - workspace/client list
  - assessment editor role-based behavior

### 7.2 CI and execution standards

- CI **MUST** fail on lint, typecheck, test, or build failures.
- PR checks **MUST** include at minimum:
  - lint
  - typecheck
  - tests
  - build
- Teams **MUST** avoid stale command docs and keep repository commands executable as documented.

## 8) Documentation standards

- Teams **MUST** keep `PRD.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `TEST_STRATEGY.md` aligned with implementation.
- Teams **MUST** record important architectural and policy choices in `docs/DECISIONS.md`.
- Teams **MUST** keep naming consistency explicit until full migration from `Client` to `Workspace` is completed.
- This file **MUST** remain policy-oriented; implementation specifics belong in companion docs.

## 9) Clarification and approval protocol

- When this document is provided in chat, the implementing assistant **MUST** follow it as binding guidance.
- Teams **MUST** ask clarifying questions before implementation when requirements, acceptance criteria, or scope are ambiguous.
- Teams **MUST** ask for explicit approval before:
  - architecture-impacting changes,
  - security posture changes,
  - database schema/migration changes,
  - external dependency or framework additions.
- If behavior or results are puzzling, contradictory, or risky, teams **MUST** pause and ask questions instead of making assumptions.
- PR descriptions **MUST** document key assumptions and unresolved questions.

## 10) Code review checklist (mandatory)

Each PR reviewer **MUST** verify:
- Tenant scope and RBAC are enforced server-side on all changed routes.
- Validation exists for body/query/params and invalid input behavior is tested.
- Business logic placement follows layer boundaries (route/service/repository).
- No avoidable duplication; shared abstractions are used where appropriate.
- Security controls are preserved (secret handling, logging redaction, auth hardening).
- Scalability and reliability concerns are addressed (pagination, query efficiency, timeouts, retries).
- Observability is sufficient for new critical paths.
- Docs and changelog updates are included when behavior/contracts change.
- Ambiguities and approvals were handled via explicit questions and documented decisions.

## 11) Definition of done for compliance

A change is compliant only when all conditions below are true:
- tenant scope and RBAC are enforced server-side,
- validation exists for body/query/params,
- tests cover behavior and negative paths,
- docs and changelog are updated,
- CI executes and passes with documented commands.
