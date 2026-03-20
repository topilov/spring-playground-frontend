# OpenAPI Consumption

This frontend consumes the backend contract from a stable, published URL instead of discovering schema from a local backend.

Primary schema URL pattern:

```text
https://<owner>.github.io/<backend-repo>/openapi/openapi.json
```

Current backend example:

```text
https://topilov.github.io/spring-playground-backend/openapi/openapi.json
```

The generator reads `VITE_API_SCHEMA_URL` and writes generated types to:

```text
src/shared/api/generated/schema.d.ts
```

Run generation with:

```bash
npm run openapi:generate
```

Important rules:

- Generated files must not be edited manually.
- Handwritten transport belongs in `src/shared/api/apiClient.ts`.
- Feature-specific request helpers belong in `src/features/*/api.ts`.
- If the Pages artifact is temporarily unavailable, the generator falls back to the backend repository's raw `openapi/openapi.yaml` so type generation can still use a backend-owned schema.

Recommended update flow after backend contract changes:

1. Pull or inspect the updated backend contract.
2. Run `npm run openapi:generate`.
3. Review the generated diff in `src/shared/api/generated/`.
4. Adjust handwritten API calls and UI flows.
5. Run lint, typecheck, and build.
