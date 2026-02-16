This is a moderate feature.

Please explore the codebase and make sure you understand how the client assessment page works today, how we derive `clientId` from the route, and how the web app calls the API (auth headers, error envelope, etc.).
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

We want to add an AI chat feature that is available only on the client page (client assessment screen). The chat UI starts from a floating button in the bottom-right (use a generic placeholder icon; it will be replaced later). When a user sends a message, it must be sent to an LLM (OpenAI recommended for phase 1) and respond within the chat window.

The LLM will later need to process and analyze internal client data for assessments, but for now the “context” must be based on the current client id and a Wikipedia-only summary derived from the client’s name.

### Context
- Current behavior:
  - The only client-scoped page is the assessment page at `/clients/:clientId/assessment`, implemented in `apps/web/src/app/pages/client-assessment.tsx` which reads the route param via `useParams()` (`clientId`).
  - The web app uses `apps/web/src/app/api.ts` as the API wrapper and attaches auth tokens using `Authorization: Bearer <token>`.
  - The API is a Fastify app with route modules registered in `apps/api/src/app/app.ts`. Client membership is enforced via `requireClientMember` in `apps/api/src/lib/access.ts`.
- Desired behavior:
  - A floating chat button appears in the bottom-right **only** on the client assessment page. Clicking opens a small chat panel containing a message list, input box, and a **Send** button.
  - On send, the message is sent to the backend with the current `clientId`. The backend fetches a Wikipedia-only summary for this client (based on the stored client name) and calls OpenAI to generate a helpful response. The reply is returned and rendered in the chat window.
  - The assistant should be oriented toward helping with client assessment (high level guidance), but must not claim to have analyzed internal Chronos data yet (that is next phase).
- Constraints/non-goals:
  - Do not show this chat UI anywhere except the client assessment page.
  - Do not add chat persistence/history storage in the database yet (in-memory UI state only).
  - Do not implement streaming/SSE in phase 1 (single request/response is fine).
  - Do not add non-Wikipedia browsing; summary source must be Wikipedia-only.
  - Do not put any OpenAI API key in the browser; all LLM calls must be server-side.

**GOAL #1.** Understand the current flow
- Identify the entry point for the client assessment page and how `clientId` is obtained and used.
- Identify where to mount a client-page-only floating widget without affecting other pages.
- Identify existing frontend API conventions (auth header, error handling) and backend route conventions (Fastify route modules, auth, membership checks).
- List the artifacts/types that will be touched (expected: web page/component, `apps/web/src/app/api.ts`, new API routes under `/clients/:clientId/...`, env vars).
- Call out any assumptions and dependencies explicitly:
  - Dependency: OpenAI API key provided via server environment variable(s).
  - Dependency: outbound network access from the API service to Wikipedia + OpenAI.
  - Assumption: client’s name in DB is the string used to find the Wikipedia entry.

**GOAL #2.** Implement the new behavior (acceptance criteria)
- **UI entry point**
  - A floating action button (FAB) appears at the bottom-right of the viewport on the client assessment page.
  - The FAB uses a generic placeholder icon (implementation detail is flexible).
  - Clicking the FAB toggles a chat panel.
- **Chat panel**
  - Contains a message list area.
  - Contains a text input and a **Send** button.
  - Messages are appended in UI state: user message immediately; assistant message after API response.
  - Failure states:
    - If the backend responds with an error, show a clear error message in the panel and allow retry.
- **OpenAI-backed response**
  - Sending a message triggers a backend call that invokes OpenAI and returns an assistant reply.
  - The assistant must not imply it has access to private/internal Chronos client data in phase 1.
- **Wikipedia-only summary context**
  - For the current `clientId`, the backend loads the client record to get the client name.
  - The backend performs a Wikipedia-only lookup to produce a short summary.
  - The summary is used as context when generating the OpenAI response.
  - If Wikipedia lookup fails or is ambiguous, the system falls back to `Not specified` (or similar neutral fallback) rather than inventing facts.
- **Scope**
  - The feature is visible only on `/clients/:clientId/assessment`.
  - No other pages/routes should gain AI chat UI so far.

**GOAL #3.** Add/extend workflow steps (implementation requirements)
This goal splits into sub-steps:

- **GOAL #3.1.** Frontend integration
  - Mount the widget in `apps/web/src/app/pages/client-assessment.tsx` (or a clearly client-scoped equivalent), using `clientId` from route params as the context id.
  - Add API methods in `apps/web/src/app/api.ts` for:
    - fetching the client Wikipedia summary (optional but recommended for caching/loading state)
    - sending a chat message for a given client id
  - Keep UI consistent with existing conventions and global styles in `apps/web/src/styles.css` (avoid introducing a new CSS file unless necessary).

- **GOAL #3.2.** Backend API endpoints
  - Add authenticated endpoints under the clients prefix, e.g.:
    - `GET /clients/:clientId/ai/summary`
    - `POST /clients/:clientId/ai/chat`
  - Enforce access control:
    - Must require auth (`fastify.authenticate`).
    - Must enforce client membership via `requireClientMember(userId, clientId)`.
  - Response shapes should follow existing error envelope conventions (`apps/api/src/lib/errors.ts` / error handler in `apps/api/src/app/app.ts`).

- **GOAL #3.3.** LLM provider (OpenAI) + configuration
  - Recommend OpenAI for phase 1 integration.
  - Add server-side env vars:
    - `OPENAI_API_KEY` (required)
    - `OPENAI_MODEL` (optional; default in code)
  - Ensure the OpenAI API key is never exposed to the browser.

- **GOAL #3.4.** Wikipedia-only implementation
  - Wikipedia-only: use Wikipedia APIs (search → page summary) and do not use general web search.
  - Add timeouts and safe fallbacks for network failures.

**GOAL #4.** Review and completeness
- Confirm the chat UI is mounted only on the client assessment page and does not appear on dashboard, leads, or other routes.
- Confirm membership checks prevent cross-tenant leakage (cannot query summary/chat for a client you are not a member of).
- Confirm OpenAI calls are server-side only and require env configuration.
- Confirm Wikipedia lookup does not fabricate facts; fallback uses neutral “Not specified”.
- List follow-ups explicitly (not in scope for this story), such as:
  - Persisting chat history
  - Streaming responses (SSE)
  - Injecting internal client data (assessment scores, notes) into context
  - Prompt hardening, citations, and safety policies
