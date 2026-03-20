# Forgot And Reset Password Design

**Date:** 2026-03-20

## Goal

Implement the full password recovery flow in the frontend:

- anonymous users can request a reset link from `/forgot-password`
- the email link opens `/reset-password?token=...`
- users can submit a new password through the backend contract
- successful reset ends on a success screen with a button back to login

## Backend Contract

Machine contract:

- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Human contract:

- backend `docs/contracts/auth.md`
- forgot-password always returns an accepted response for existing and missing emails
- reset-password accepts `{ token, newPassword }`
- reset-password returns `{ reset: true }` on success
- reset-password returns `400 Bad Request` when validation fails or the token is invalid/expired
- successful reset does not log the user in

## Chosen Approach

Use two separate anonymous routes:

1. `/forgot-password` for requesting the reset email
2. `/reset-password` for applying a new password with the `token` query parameter

This keeps the two backend operations separate, matches the email-link contract directly, and simplifies routing and testing.

## UX

### Forgot Password

- keep the existing page and generic explanatory copy
- keep the generic success message so the UI does not reveal whether the email exists
- keep backend errors visible through the shared API error mapping

### Reset Password

- add a dedicated page at `/reset-password`
- read `token` from the query string
- if `token` is missing, show an invalid-link state with a clear message and a link back to login
- otherwise show a form with:
  - `newPassword`
  - `confirmPassword`
- validate `newPassword` locally with the same minimum length as the backend contract
- require `confirmPassword` to match `newPassword`
- do not expose the token as an editable field
- after success, replace the form with a success state and a button/link back to login

## Error Handling

- client-side validation errors stay inline at the field level
- reset token failures should surface the backend error message when available because that message explains that the link is invalid or expired
- generic fallback copy is used only when the backend response does not include a useful message

## Architecture

### Models

Extend `src/entities/auth/model.ts` with reset-password request/response types mapped from the generated OpenAPI contract.

### API Layer

Extend the handwritten auth API layer in `src/features/auth/api.ts` with `resetPassword(payload)` and mirror it in `src/features/auth/mutations.ts`.

### Routing

Add `routePaths.resetPassword` and register a new anonymous route in `src/app/router.tsx`.

### UI

- add `ResetPasswordPage`
- add `ResetPasswordForm`
- keep page-level copy on the page component
- keep form state, success state, and API error handling inside the form component

## Testing Strategy

Follow TDD for each behavior:

1. add a failing auth API test for `POST /api/auth/reset-password`
2. add a failing router test that `/reset-password` renders the new page for anonymous users
3. add failing component tests for:
   - missing token state
   - mismatched passwords validation
   - successful submission and success state
4. implement the minimum production code to satisfy the tests
5. run targeted tests, then the wider suite, then lint/typecheck

## Out Of Scope

- auto-login after reset
- token refresh or resend from the reset screen
- changing backend email templates or token generation behavior
