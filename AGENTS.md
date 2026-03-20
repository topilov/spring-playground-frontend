# Frontend Contract Rules

This repository is a frontend API consumer only.

- Backend is the source of truth for every HTTP request shape, response shape, and auth behavior.
- Always follow the machine contract first: published OpenAPI from the backend GitHub Pages site.
- Always follow the human contract second: backend `docs/contracts/*.md` for cookies, sessions, CSRF notes, and behavior details that do not fit cleanly in OpenAPI.
- Do not invent request or response shapes in this repository.
- Keep API transport handwritten and explicit. Generate types only, not a full generated client.

When backend changes:

1. Regenerate types from the backend OpenAPI.
2. Update the handwritten API layer in `src/shared/api` and `src/features/*/api.ts`.
3. Update UI and feature flows that depend on the changed contract.

Backend references:

- Repo: `https://github.com/topilov/spring-playground-backend`
- Intended Pages OpenAPI JSON: `https://topilov.github.io/spring-playground-backend/openapi/openapi.json`
- Raw schema fallback used by tooling when Pages is not ready: `https://raw.githubusercontent.com/topilov/spring-playground-backend/main/openapi/openapi.yaml`
