# Chronos API – Postman

This folder contains a Postman collection and environment so you can run and test the Chronos API from Postman.

## What’s included

| File | Purpose |
|------|--------|
| `chronos-api.postman_collection.json` | All API endpoints with request bodies and docs |
| `chronos-local.postman_environment.json` | Local dev environment (base URL, token, clientId, assessmentId) |

## Prerequisites

1. **API running locally**  
   From the repo root:
   ```bash
   # Ensure DB is up (e.g. Docker)
   npx nx serve api
   ```
   Default base URL: `http://localhost:4000` (or set `API_PORT` in `.env`).

2. **Postman**  
   [Download Postman](https://www.postman.com/downloads/) if you don’t have it.

## Import into Postman

1. Open Postman.
2. **Import collection**  
   File → Import → drag or select `chronos-api.postman_collection.json`.
3. **Import environment (optional)**  
   File → Import → drag or select `chronos-local.postman_environment.json`.  
   Then in the top-right environment dropdown, choose **Chronos Local**.

The collection already defines variables (`baseUrl`, `token`, `clientId`, `assessmentId`). The environment can override them (e.g. different `baseUrl` for another host/port).

## How to run requests

1. **Get a token**  
   Run **Auth → Login** (or **Auth → Register** with a new email).  
   **Important:** Login and Register do **not** use Basic Auth. Leave **Authorization** set to **No Auth** and send credentials in the **Body** tab as raw JSON (`email` and `password`). The **Tests** script saves the JWT into both the collection and the active environment (if any), so `{{token}}` is set for requests like List clients. Run Login (or Register) **before** any protected request. For a pre-seeded local user, see the project root [README](../README.md).

2. **Use IDs from responses**  
   After **Create client**, the collection variable `clientId` is set from the response.  
   After **Create assessment**, `assessmentId` is set.  
   So you can run “List assessments”, “Get assessment scores”, etc. without pasting IDs.

3. **Optional: use environment**  
   If you imported **Chronos Local**, select it in the environment dropdown. You can edit its values (e.g. `baseUrl` for `http://localhost:3000`) and they’ll override the collection’s defaults.

## Endpoints in the collection

- **Health & Root** – `GET /health`, `GET /`
- **Auth** – `POST /auth/register`, `POST /auth/login`
- **Clients** – `GET /clients`, `POST /clients`, `GET /clients/:clientId`
- **Members** – `GET /clients/:clientId/members`, `POST /clients/:clientId/members`
- **Assessments** – `GET /clients/:clientId/assessments`, `POST /clients/:clientId/assessments`, `GET /assessments/:assessmentId/scores`, `PUT /assessments/:assessmentId/scores`

Protected routes require a valid JWT (run Login or Register first).

## Error responses

The API returns errors in this shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Common codes: `UNAUTHORIZED`, `VALIDATION_ERROR`, `NOT_FOUND`, `EMAIL_TAKEN`, `INVALID_CREDENTIALS`, `MEMBER_EXISTS`.

## Enums reference

- **Role:** `OWNER`, `CONSULTANT`, `VIEWER`
- **AssessmentType:** `AI_ADOPTION`, `DIGITAL_TRANSFORMATION`
- **AssessmentDomain:** `STRATEGY`, `PROCESS`, `DATA`, `TECH`, `PEOPLE`, `GOVERNANCE`, `SECURITY`

Scores use domains above; `score` is an integer 0–5.

## Troubleshooting

- **List clients (or other protected request) returns 401 "Invalid or missing authentication token"**  
  Run **Auth → Login** first. The token is saved by the request’s Tests script. If you use the **Chronos Local** environment, the script now writes the token there too so `{{token}}` is filled. Then send the protected request again.
