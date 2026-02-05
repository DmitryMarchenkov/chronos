# Security

## Tenant Scoping (Workspace Boundary)
- A Workspace is the tenant boundary.
- Every client-scoped API route must verify that the authenticated user is a member of the target workspace.
- Membership is stored in `WorkspaceMember` and includes a role.
- Prisma access rules:
  - All reads/lists for client-scoped entities must filter by `workspaceId`.
  - All writes must set `workspaceId` server-side (payload values are ignored or rejected).

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