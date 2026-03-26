# Telegram Settings Design

**Date:** 2026-03-26

## Goal

Add a production-style Telegram settings area to the frontend so an authenticated user can:

- connect or disconnect a Telegram account through the backend-owned phone/code/password flow
- manage focus emoji settings for supported iPhone Focus modes
- create, regenerate, and revoke a personal automation token for iOS Shortcuts
- view current Telegram connection and focus-sync state from backend-owned data

The UX should stay calm, minimal, and practical, with one dedicated route at `/settings/telegram`.

## Backend Contract

Machine contract:

- `GET /api/profile/me/telegram`
- `POST /api/profile/me/telegram/connect/start`
- `POST /api/profile/me/telegram/connect/confirm-code`
- `POST /api/profile/me/telegram/connect/confirm-password`
- `DELETE /api/profile/me/telegram/connect`
- `PUT /api/profile/me/telegram/focus-settings`
- `POST /api/profile/me/telegram/automation-token`
- `POST /api/profile/me/telegram/automation-token/regenerate`
- `DELETE /api/profile/me/telegram/automation-token`

Human contract:

- backend `docs/contracts/telegram.md`

Important contract notes:

- `GET /api/profile/me/telegram` is the primary read model for the page and returns connection state, pending auth state, automation-token summary, resolved emoji mappings, effective focus mode, and active focus modes.
- The backend owns connection flow state through `connected`, `pendingAuth`, and `pendingAuth.nextStep`.
- Supported focus modes are `personal`, `airplane`, `do_not_disturb`, `reduce_interruptions`, and `sleep`.
- The backend resolves effective focus priority and emoji-status application. The frontend must not reimplement focus-priority logic.
- The backend returns `resolvedEmojiMappings`, but it does not expose separate user-override metadata. The frontend should not imply an override/default source distinction it cannot prove.
- Raw automation tokens are returned only from create and regenerate endpoints and must not be redisplayed after reload.

## Route Design

- Add a new protected top-level settings route at `/settings/telegram`.
- Update settings navigation so `Account`, `Security`, and `Telegram` appear together as peer sections.
- Keep `/settings/telegram` as one unified page with four stacked sections:
  - `Connection`
  - `Focus settings`
  - `Automation token`
  - `Current state`

This preserves Telegram as a distinct integration area instead of burying it inside security-specific controls.

## Architecture

Create a dedicated Telegram feature module:

- `src/features/telegram/api`
- `src/features/telegram/model`
- `src/features/telegram/hooks`
- `src/features/telegram/components`
- `src/features/telegram/pages`

Implementation boundaries:

- API transport stays handwritten and explicit in `src/features/telegram/api.ts`.
- Generated OpenAPI types remain the source of request and response DTO shapes.
- DTO normalization and small frontend-facing helper types live in `src/features/telegram/model.ts`.
- React Query orchestration lives in `src/features/telegram/hooks.ts`.
- The route page stays thin and composes focused section components.

Use one primary read hook, `useTelegramSettingsQuery`, for `GET /api/profile/me/telegram`.

All Telegram mutations should invalidate and refetch that query instead of deriving long-lived local state from mutation results.

## Page Composition

The route shell should stay structurally similar to the existing settings pages:

- `TelegramSettingsPage` handles `PageHeader`, `SettingsTabs`, page layout, and a right-hand contextual sidebar.
- The main column renders one stacked Telegram settings composition.
- Individual sections remain focused and mostly presentational:
  - `TelegramConnectionSection`
  - `TelegramFocusSettingsSection`
  - `TelegramAutomationTokenSection`
  - `TelegramCurrentStateSection`

This keeps the route readable while avoiding page-level complexity from the primary query.

## Connection Flow

The connection flow should be backend-driven, not router-driven.

The UI should render one of three states based on backend data:

1. Disconnected:
   - show phone number input and `Connect` action
2. Pending auth:
   - if `nextStep === "CODE"`, show code confirmation form
   - if `nextStep === "PASSWORD"`, show password confirmation form
3. Connected:
   - show Telegram account summary and `Disconnect` action

Rules:

- Use `pendingAuthId` from the backend response or settings query as the source for confirm-code and confirm-password submissions.
- Do not add subroutes or a client-side state-machine library for the flow.
- Local state should be limited to transient input values and local action banners.
- After every successful mutation, refetch the Telegram settings query so the UI snaps back to backend truth.

## Focus Settings

The focus settings section should let the user edit:

- `defaultEmojiStatusDocumentId`
- one emoji-status document id per supported focus mode

Because the current contract exposes `resolvedEmojiMappings` but not separate override metadata:

- initialize editable values from `defaultEmojiStatusDocumentId` and `resolvedEmojiMappings`
- treat those resolved mapping values as the practical in-session source of truth after save/reload
- do not label values as `default` or `override`

Validation should stay intentionally light:

- trim values
- allow empty values when the backend contract permits absence
- optionally show gentle inline guidance for emoji document ids
- do not invent stricter frontend validation rules than the contract defines

The section should save through `PUT /api/profile/me/telegram/focus-settings` and then rely on query refetch for the resulting state.

## Automation Token UX

The automation-token section should show:

- whether a token exists
- token hint
- created-at metadata
- last-used metadata

Behavior:

- if no token exists, show `Create token`
- if a token exists, show `Regenerate token` and `Revoke token`
- show the raw token only immediately after a successful create or regenerate call
- provide copy-to-clipboard while the raw token is visible
- show a short reminder that the raw token will not be shown again
- do not persist the raw token outside transient local UI state
- do not attempt to redisplay it after reload or query refetch

The section may include a small helper note that the token is intended for iOS Shortcuts and should be sent as a bearer token by automation clients.

## Current State

The current-state section remains fully read-only and backend-owned.

It should display:

- active focus modes
- effective focus mode
- currently applied emoji-status document id inferred from backend-owned effective state and returned mappings/default
- Telegram premium capability

If the connected Telegram account is not premium, show a calm warning that emoji-status sync cannot be applied until premium is available.

The section must not duplicate backend logic for resolving focus priority.

## Error Handling

Use shared API error handling as the fallback, but add Telegram-specific error-code mapping for stable UX in the Telegram feature.

Known codes to normalize include:

- `TELEGRAM_INVALID_AUTH_STEP`
- `TELEGRAM_PENDING_AUTH_NOT_FOUND`
- `TELEGRAM_NOT_CONNECTED`
- `TELEGRAM_PREMIUM_REQUIRED`
- `TELEGRAM_AUTOMATION_TOKEN_INVALID`
- `RATE_LIMITED` where applicable

Guidelines:

- keep user-facing messages short and practical
- do not expose raw backend payloads directly
- keep action errors local to the relevant section where possible
- let shared unauthorized handling continue to surface session-expired states
- treat unknown Telegram errors with the shared fallback message flow

## Testing Strategy

Follow the existing repo pattern with targeted Vitest coverage.

Coverage should include:

- API tests for Telegram transport functions and DTO mapping
- route coverage for `/settings/telegram` and updated settings navigation
- component tests for connection states and backend-driven step transitions
- component tests for Telegram-specific error rendering
- component tests for focus-settings save behavior
- component tests for one-time raw token display and copy interaction
- component tests for current-state rendering, including non-premium warning behavior

Avoid snapshot-heavy coverage. Prefer tests that assert user-visible behavior and contract-aligned state transitions.

## Files To Add Or Extend

- `src/shared/api/generated/schema.d.ts`
- `src/shared/routing/paths.ts`
- `src/app/router.tsx`
- `src/app/router.test.tsx`
- `src/pages/settings/SettingsTabs.tsx`
- `src/pages/settings/TelegramSettingsPage.tsx`
- `src/features/telegram/*`
- `src/app/app.css`
- relevant tests and docs
