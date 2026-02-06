---
title: New Screen Template
purpose: Prompt instructions for adding a new UI screen
scope: Web app (apps/web)
---

# New Screen Template

Use this prompt when you want to add a new screen to the app. It aligns with
design, navigation, security, and app conventions.

## Prompt

You are working in the Chronos repo. Create a new screen that matches the
current UI system and navigation. Follow these rules strictly:

### 1) Design & UI consistency
- Reuse existing layout utilities: `stack`, `row`, `grid`, `card`, `page-header`,
  `muted`.
- Match typography and spacing in `apps/web/src/styles.css`.
- Buttons, inputs, and tables must use the global styles. Do not introduce new
  CSS files unless necessary; prefer updating existing global classes.
- Use neutral copy and enterprise tone; avoid playful or brand-specific motifs.

### 2) Navigation & routing
- Add the route in `apps/web/src/app/app.tsx` under the correct layout (public
  vs. protected).
- If the screen is part of authenticated flows, place it under `ProtectedLayout`.
- Ensure any navigation entry or link points to the new route.

### 3) Security & auth
- For protected screens, check auth via the existing `ProtectedLayout` route.
- Never expose authenticated-only data on public pages.
- Use `getToken` and `clearToken` from `apps/web/src/app/auth` only when needed.

### 4) Data & API usage
- Use `apps/web/src/app/api.ts` for API calls.
- If new API endpoints are required, add validation in the API layer using
  `@chronos/shared-validation` with Zod schemas.
- Use shared enums/helpers from `@chronos/shared-types` and
  `@chronos/shared-rbac` when applicable.
- Enforce tenant scoping for client-scoped routes.

### 5) File placement
- New page components go in `apps/web/src/app/pages/`.
- Use `PascalCasePage` naming and export as `export const NamePage = () => {}`.
- Keep the file focused on a single screen.

### 6) Content structure
- Start with a `page-header` containing a title and short description.
- Use cards to group content and actions.
- Include loading, error, and empty states where relevant.

### 7) Changelog & commits
- Update `CHANGELOG.md` under `[Unreleased]` with Added/Changed as needed.
- Use conventional commits (e.g., `feat(web): add <screen name>`).

### 8) Quality checks
- Run lint checks or verify with `ReadLints` after changes.
- Ensure no new linter errors in touched files.

## Example starter layout (adjust as needed)

```
export const NewScreenPage = () => {
  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Screen title</h1>
          <p className="muted">Short description.</p>
        </div>
      </div>

      <div className="card stack">
        <h2>Section title</h2>
        <p className="muted">Section description.</p>
        <div className="grid">
          {/* Content */}
        </div>
      </div>
    </div>
  );
};
```

## Inputs to provide
- Screen name and route
- Public or protected
- Core data requirements (API calls)
- Primary actions (create, update, export, etc.)
- Any navigation updates needed
