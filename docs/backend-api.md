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
- For passkeys, treat the backend `publicKey` payload as WebAuthn protocol data: decode Base64URL binary members before calling `navigator.credentials.create()` or `navigator.credentials.get()`, then send JSON-serialized credentials back to the backend verify endpoints.

Current frontend passkey touchpoints:

- `/login` starts unauthenticated passkey sign-in through the backend ceremony endpoints.
- `/settings/security` lists, adds, renames, and deletes the authenticated user's passkeys.
- `src/features/passkeys/api.ts` owns the handwritten passkey HTTP layer.
- `src/features/passkeys/webauthn.ts` owns browser-side WebAuthn adaptation and serialization.

When backend changes:

1. Regenerate types from the published schema.
2. Update the handwritten API layer if request bodies, responses, or status handling changed.
3. Update UI flows that depend on the changed behavior.
4. Re-read backend `docs/contracts/*.md` for auth, cookie, or validation notes.
