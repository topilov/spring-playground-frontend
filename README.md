# Spring Playground Frontend

React + TypeScript + Vite frontend that consumes the backend API contract from the separate backend repository.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Review environment values in `.env.example`.

   - `VITE_API_BASE_URL` is the runtime backend origin for local development.
   - `VITE_API_SCHEMA_URL` is the contract source for type generation and should point at the backend GitHub Pages OpenAPI export.

3. Generate OpenAPI types:

   ```bash
   npm run openapi:generate
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Verify the frontend locally:

   ```bash
   npm test
   npm run typecheck
   npm run build
   ```

## Contract Ownership

- Backend repo: `topilov/spring-playground-backend`
- Backend owns the contract.
- Frontend consumes the contract and must not invent request or response shapes.
- OpenAPI is the machine contract.
- Backend `docs/contracts/*.md` are the human contract for session, cookie, auth, and behavior details.

Primary contract URL:

```text
https://topilov.github.io/spring-playground-backend/openapi/openapi.json
```

## OpenAPI Usage

- Type generation uses `openapi-typescript`.
- Generated files live in `src/shared/api/generated/`.
- Generated files must not be edited manually.
- Transport stays handwritten in `src/shared/api/apiClient.ts` and feature API modules.
- Regenerate types before auth/profile work so the frontend reflects the real backend contract.

The generation script prefers `VITE_API_SCHEMA_URL`. If the published Pages artifact is temporarily unavailable, it falls back to the backend repository's raw `openapi/openapi.yaml` so frontend bootstrap stays unblocked without inventing any shapes.

## Updating the Frontend When Backend Changes

1. Regenerate types:

   ```bash
   npm run openapi:generate
   ```

2. Update handwritten API functions in `src/features/*/api.ts` if routes, payloads, or status handling changed.
3. Update UI to match the new contract and backend docs.
4. Re-run:

   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

## Auth Flow Notes

- Auth is session and cookie based, not token based.
- The frontend always sends requests with `credentials: "include"` so the backend-managed `JSESSIONID` cookie is included automatically.
- `POST /api/auth/register` creates the account and default profile, but it does not auto-login the browser session.
- `POST /api/auth/login` establishes the session cookie.
- `GET /api/profile/me` is the frontend's source of truth for the current authenticated profile.
- `POST /api/auth/logout` invalidates the backend session and the frontend clears local session state after a successful response.
- `POST /api/auth/forgot-password` should always be presented with a generic acceptance message so the UI does not reveal whether an email exists.

## Current Screens

- `/` home page with contract context and navigation
- `/register` account creation form
- `/login` session login form
- `/forgot-password` reset request form
- `/profile` current authenticated profile

## Docs

- Backend contract notes: `docs/backend-api.md`
- OpenAPI generation flow: `docs/openapi-consumption.md`
