# Backend API Ownership

The backend repository owns the HTTP contract for this frontend.

- Backend repo: `https://github.com/topilov/spring-playground-backend`
- Intended GitHub Pages contract site: `https://topilov.github.io/spring-playground-backend/`
- Intended OpenAPI JSON: `https://topilov.github.io/spring-playground-backend/openapi/openapi.json`
- Source OpenAPI in backend repo: `openapi/openapi.yaml`

The frontend must treat backend contract material in two layers:

1. OpenAPI is the machine-readable contract and the only source for generated request and response types.
2. Backend `docs/contracts/*.md` are the human-readable contract for session cookies, auth flow, CSRF notes, and behavior details that are not fully captured by the schema.

Current backend contract docs include:

- `docs/contracts/auth.md`
- `docs/contracts/profile.md`
- `docs/contracts/public.md`

Frontend rules:

- Do not invent shapes locally.
- Do not create frontend-only request or response models that drift from backend docs or OpenAPI.
- Keep the HTTP transport handwritten and explicit.
- Preserve `credentials: "include"` because the backend uses a session cookie.
- Leave room for CSRF support, but follow backend docs before adding a token flow.

When backend changes:

1. Regenerate types from the published schema.
2. Update the handwritten API layer if request bodies, responses, or status handling changed.
3. Update UI flows that depend on the changed behavior.
4. Re-read backend `docs/contracts/*.md` for auth, cookie, or validation notes.
