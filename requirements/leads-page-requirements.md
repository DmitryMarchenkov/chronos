This is a simple feature.

Please explore the codebase and make sure you understand how client listing and dashboard navigation currently works (how we display and manage client workspaces today).
Call out any assumptions or dependencies you find.
Perform your tasks with accuracy and attention to detail, ensuring a thorough understanding of project documents and contracts (if any).

<important_guidelines>
1. Information accuracy: Only extract and summarize information that is explicitly stated in the provided documents or code. Do not invent or assume. If something is not available, say "Not specified" or "Information not available."
2. Template recognition: Distinguish between real project-specific content and template placeholder text. Ignore placeholders when extracting facts.
3. Response formatting: Do not repeat instructions in your response. Provide only the requested output or findings.
4. Source referencing: When you extract summaries or specific facts, include a reference to where it was found (e.g., section name, file, or function).
5. Think hard, move slowly, take your time.
6. Review what you've done.
</important_guidelines>

The feature is asking you to add a new Leads page in the web app to track potential clients before they become active clients. Leads must appear as a navigation item above Clients in the left sidebar and provide a basic management experience (view list, create lead, update lead status, convert lead to client). The implementation should keep UI and routing consistent with existing authenticated dashboard pages and avoid regressions to the current Clients flow.

**GOAL #1.** Understand the current flow
- Identify the main entry points for dashboard/sidebar navigation and clients page rendering.
- List the existing artifacts/types that will be touched (routes, page components, API client methods, shared validation/types, and API endpoints if needed).
- Note constraints or non-goals: do not remove or redesign Clients behavior; do not introduce unrelated visual system changes.

**GOAL #2.** Implement the new behavior
- Add a new Leads screen under authenticated routes and place its navigation link above Clients.
- The new output should include:
  - A page header with title and short description.
  - A leads list (name, contact, source, status, created date).
  - New, Prospecting, and Converted statuses.
  - Create Convert Lead action (placeholder).
- Follow screen implementation conventions from `new_screen_template.md`:
  - Reuse `stack`, `row`, `grid`, `card`, `page-header`, and `muted` utilities.
  - Match global styling from `apps/web/src/styles.css` and avoid introducing a new CSS file unless required.
  - Keep copy neutral and enterprise-focused.
- Extend types/schemas and hydration/serialization logic where needed so leads are validated end-to-end.
- Keep fallback behavior intact so existing Clients data paths continue to work unchanged.

**GOAL #3.** Add/extend workflow steps
This goal splits into sub-steps:

- **GOAL #3.1.** Update route and navigation definition
  - Register `/leads` in `apps/web/src/app/app.tsx` under `ProtectedLayout`.
  - Ensure sidebar order is: Leads, then Clients.
- **GOAL #3.2.** Implement page orchestration and data flow
  - Add API integration for listing/creating/updating/converting leads via `apps/web/src/app/api.ts`.
  - Reuse existing auth patterns (`getToken`, `clearToken`) only as needed for protected flows.
  - Enforce tenant scoping for leads data.
- **GOAL #3.3.** Add/update validation and contracts
  - Define/extend schemas for lead payloads and responses in shared validation/types.
  - Use `@chronos/shared-validation` (Zod-based schemas) and shared enums/helpers from `@chronos/shared-types` / `@chronos/shared-rbac` where applicable.
  - Ensure request and response validation is applied at API boundaries.

**GOAL #4.** Review and completeness
- Verify the change is used in the intended location only (dashboard protected area).
- Confirm other call sites still use the original Clients behavior.
- Confirm file placement conventions:
  - Leads page component lives in `apps/web/src/app/pages/`.
  - Component naming follows `PascalCasePage` and exports `export const LeadsPage = () => {}` style.
- List follow-ups or missing tests, including:
  - Web route and sidebar rendering tests.
  - Leads page interaction tests (create + status update).
  - API validation tests for lead schemas/endpoints.
- Update `CHANGELOG.md` under `[Unreleased]` as needed.
- Run lint checks or `ReadLints` for touched files and resolve newly introduced lint issues.
- Confirm referenced sources are cited where requested.
