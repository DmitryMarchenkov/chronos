# Security

This document defines implementation-focused security controls. Normative policy and compliance gates are defined in `docs/engineeringpractices.md`.

Interpretation keywords in this document follow policy language:
- **MUST** / **MUST NOT**: mandatory requirement.
- **SHOULD** / **SHOULD NOT**: strong recommendation; deviation requires justification.

## Tenant Scoping (Workspace Boundary)
- A Workspace is the tenant boundary.
- Every client-scoped API route **MUST** verify that the authenticated user is a member of the target workspace.
- Membership is stored in `WorkspaceMember` and includes a role.
- Prisma access rules:
  - All reads/lists for client-scoped entities **MUST** filter by `workspaceId`.
  - All writes **MUST** set `workspaceId` server-side (payload values are ignored or rejected).

## Runtime Security Baseline
- `JWT_SECRET` is mandatory in production and **MUST** be at least 32 characters.
- `CORS_ORIGINS` **MUST** be explicitly configured in production.
- Authentication endpoints **MUST** be rate-limited to reduce brute-force risk.
- Services **MUST NOT** return temporary or bootstrap credentials in production API responses.

## Secure Coding Practices

- Services **MUST** validate all externally controlled input (body/query/params/headers where applicable) using shared schemas.
- Services **MUST** enforce authorization by default and grant only explicit least-privilege access.
- Teams **MUST** keep secrets out of code, logs, and API responses.
- Services **MUST** use generic auth/tenant error responses to avoid information leakage.
- UI code **MUST** sanitize or encode untrusted content to reduce XSS risk.
- Teams **SHOULD** prefer HttpOnly, Secure, SameSite cookie-based sessions for browser clients.

## Logging and Telemetry Redaction

Always redact or exclude:
- access tokens and refresh tokens,
- passwords, password hashes, and reset tokens,
- API keys and secrets,
- full PII payloads unless explicitly required and approved.

Teams **MUST** use structured logs that include correlation IDs and request metadata, and **MUST NOT** dump raw sensitive payloads.

## Security Anti-Patterns to Avoid

- Permissive CORS in production (`origin: true` or wildcard).
- Trusting client-provided `workspaceId` or equivalent tenant scope in write paths.
- Returning verbose auth errors that reveal account existence.
- Storing long-lived bearer tokens in `localStorage` without strict mitigation.
- Returning temporary credentials from API responses.

## RBAC Matrix
| Action | OWNER | CONSULTANT | VIEWER |
| --- | --- | --- | --- |
| View workspaces | ✅ | ✅ | ✅ |
| Create workspace | ✅ | ❌ | ❌ |
| View assessments | ✅ | ✅ | ✅ |
| Create/update assessments | ✅ | ✅ | ❌ |
| Update domain scores | ✅ | ✅ | ❌ |
| View members | ✅ | ✅ | ✅ |
| Manage members | ✅ | ❌ | ❌ |