# Passkey Security Settings Design

## Goal

Add production-style passkey support to the frontend so anonymous users can sign in with a passkey and authenticated users can manage passkeys from a dedicated `/settings/security` route.

## Backend Contract

The frontend must follow the backend OpenAPI and `docs/contracts/auth.md` for:

- `POST /api/auth/passkeys/register/options`
- `POST /api/auth/passkeys/register/verify`
- `GET /api/auth/passkeys`
- `PATCH /api/auth/passkeys/{id}`
- `DELETE /api/auth/passkeys/{id}`
- `POST /api/auth/passkey-login/options`
- `POST /api/auth/passkey-login/verify`

The backend returns WebAuthn `publicKey` option objects with Base64URL-encoded binary members. The frontend must decode those members before passing them to `navigator.credentials.create()` or `navigator.credentials.get()`, then serialize the resulting credential back into JSON for the verify endpoints.

## Route Design

- Keep `/profile` focused on profile/session information.
- Add a protected `/settings/security` route as the home for passkey management.
- Add a clear CTA from `/profile` to `/settings/security`.
- Keep the new page modular so it can grow into broader security settings later without moving passkey code again.

## Architecture

Add a dedicated `features/passkeys` area with:

- an explicit handwritten API layer
- query and mutation hooks for list/register/rename/delete
- a browser-facing WebAuthn service that owns Base64URL decoding, credential serialization, and browser capability checks
- focused UI components for passkey login and passkey management

Route pages should remain thin. WebAuthn ceremony details should stay out of `LoginPage` and `SecuritySettingsPage`.

## UX

### Login

- Add a `Sign in with passkey` button alongside the existing password form.
- Handle loading, unsupported browsers, cancellation, invalid login, and generic backend failures with non-technical copy.
- Successful passkey login should follow the same session refresh and redirect behavior as password login.

### Security Settings

- Show a `Passkeys` section on `/settings/security`.
- Show an empty state when no passkeys exist.
- Allow users to add a passkey, rename it, and delete it.
- Show passkey metadata where available: name, created date, last used date, device hint, transports.
- Confirm deletion before revoking a passkey.

## Error Handling

- Unsupported browser/device: explain that passkeys are not available in the current environment.
- User cancellation: keep it low-friction and non-alarming.
- Registration/login verify failure: show backend-derived error messaging where possible.
- Duplicate credential registration: surface the backend conflict cleanly.
- Rename/delete failures: keep errors local to the affected action.

## Testing

- API tests for passkey endpoints.
- Unit tests for WebAuthn adapter helpers and ceremony orchestration.
- Route coverage for `/settings/security`.
- Component tests for passkey login initiation and settings-management flows.

## Files To Add Or Extend

- `src/entities/auth/model.ts`
- `src/features/auth/api.ts`
- `src/features/auth/mutations.ts`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/passkeys/*`
- `src/pages/settings/SecuritySettingsPage.tsx`
- `src/app/router.tsx`
- `src/shared/routing/paths.ts`
- `src/pages/profile/ProfilePage.tsx`
- `src/app/app.css`
- relevant tests and docs
