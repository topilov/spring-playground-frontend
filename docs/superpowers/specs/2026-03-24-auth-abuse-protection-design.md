# Auth Abuse Protection Design

**Date:** 2026-03-24

## Goal

Implement production-grade abuse-protection UX in the frontend so protected auth and security flows match the backend contract while sharing one reusable protected-form pattern.

The implementation should:

- integrate Cloudflare Turnstile inline near the submit area
- send `captchaToken` for every backend-protected request that requires it
- normalize backend abuse-protection behavior in one shared place
- keep page-level success behavior local to each flow
- keep the UX calm, minimal, and non-enumerating where required

## Backend Contract

Machine contract:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/resend-verification-email`
- `POST /api/auth/reset-password`
- `POST /api/auth/2fa/login/verify`
- `POST /api/auth/2fa/login/verify-backup-code`
- `POST /api/auth/passkey-login/options`
- `POST /api/auth/passkey-login/verify`
- `POST /api/profile/me/email/verify`

Human contract:

- backend `docs/contracts/auth.md`
- backend `docs/contracts/profile.md`
- sensitive public auth/security requests require `captchaToken`
- captcha validation failures can surface through `400 Bad Request`
- abuse protection can surface through `429 Too Many Requests`
- `retryAfterSeconds` is part of the stable protection contract for throttled/cooldown responses
- forgot-password and resend-verification remain non-enumerating on first accepted submission
- repeated forgot-password and resend-verification submissions can return `429` with cooldown semantics keyed by the submitted email
- two-factor completion and passkey public login participate in the same centralized protection model

## Protected Flows

The reusable protection layer should cover these frontend flows in the first pass:

- register
- login
- forgot password
- resend verification email
- reset password
- password-login 2FA completion with TOTP
- password-login 2FA completion with backup code
- public passkey login start and finish
- authenticated email-change verification through `POST /api/profile/me/email/verify`

Protected but authenticated passkey-management and authenticated TOTP-management endpoints are out of scope because the backend contract for this task does not require captcha for those flows.

## Chosen Approach

Use a shared protected-action controller with small reusable UI/runtime primitives.

The architecture has five pieces:

1. a shared protection contract-normalization module
2. a dedicated Turnstile runtime
3. a shared `useProtectedAction` controller
4. a small presentational protection UI layer
5. feature-local success and domain-error handling on each page or flow

This keeps the contract-specific protection behavior centralized without turning page components into thin wrappers around an opaque framework.

## Architecture

### Shared Protection Contract

Create a shared module that interprets backend protection-related failures from `ApiClientError` and converts them into a normalized frontend shape.

That normalized shape should cover:

- captcha invalid or captcha rejected
- generic rate limit / throttled response
- cooldown-active response
- generic protection failure
- retry/cooldown timing derived from `retryAfterSeconds`

This shared module is the only place allowed to inspect raw backend protection codes or backend protection-specific response body details.

It should not swallow unrelated business/domain errors such as:

- invalid credentials
- email not verified
- invalid reset token
- username/email conflicts
- invalid 2FA code
- expired or invalid login challenge

Those errors should remain available to page- or feature-level logic after the shared protection layer decides that the error is not a protection error.

### Turnstile Runtime

Add a dedicated Turnstile runtime that:

- loads the Cloudflare Turnstile script once
- exposes readiness and widget lifecycle state
- renders the widget inline near the submit area
- acquires a token for the next protected request
- resets the widget centrally after success or protection failure
- returns a stable user-facing failure when token acquisition is unavailable

Environment-driven configuration should be added through shared app config so the site key lives outside feature code.

### Protected Action Controller

Add a shared `useProtectedAction` controller that coordinates:

- token acquisition from the Turnstile runtime
- request execution with a locally supplied `execute(payloadWithCaptcha)` callback
- shared interpretation of abuse/captcha/cooldown failures
- centralized captcha reset behavior
- a small normalized result/state shape for the page to render

The controller should be strong but not magical:

- pages still own their success behavior
- pages still own unrelated business-error handling
- the controller owns only captcha lifecycle and normalized protection-state handling

### Presentational Protection UI

Add a small UI layer for consistent messaging, likely a banner-like component plus shared formatting helpers.

This layer should render:

- calm error and retry messaging
- cooldown or retry timing when available
- generic non-enumerating copy for forgot-password and resend-verification style flows where needed

Pages may still wrap this in local layout or combine it with local action CTAs.

## Flow Integration

### Auth Forms

Refactor these forms to submit through the protected-action controller:

- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- resend verification form/page

Each form still keeps its local success handling:

- login still decides whether to redirect immediately or store the 2FA challenge
- register still shows account-created success UI
- forgot-password and resend-verification still show generic accepted states
- reset-password still swaps to its success UI

### Two-Factor Login Completion

Update the public second-step flow on `/login/2fa` so both:

- TOTP verification
- backup-code verification

submit through the shared protected-action controller and include `captchaToken` in their backend requests.

The page still owns challenge-expired handling and redirect behavior.

### Public Passkey Login

Update passkey login so both:

- ceremony start
- ceremony finish

participate in the shared protected-action pattern and send `captchaToken` according to the backend contract.

Passkey-specific browser/WebAuthn errors remain outside the protection layer and should continue to be handled by the passkey feature.

### Authenticated Email-Change Verification

Update the email-change verification flow to use the same protection abstraction even though it lives in an authenticated profile/security area.

This keeps:

- captcha integration
- protection error interpretation
- retry/cooldown formatting

consistent across public and authenticated protected flows.

## Captcha Lifecycle Rules

The shared captcha lifecycle should follow these rules:

- render Turnstile inline near the submit area of each protected flow
- acquire the token immediately before executing the protected request
- reset the widget after every successful protected submission
- reset the widget after captcha-specific failures
- reset the widget after protection-related `429` responses so the next attempt starts clean
- surface a stable message when Turnstile is not ready or token acquisition fails

Pages should not manage widget reset logic directly beyond calling the shared controller.

## Protection UX

Normalize protection responses into a small set of user-facing states:

- `captcha_invalid`
- `rate_limited`
- `cooldown_active`
- `protection_error`

Each state should expose:

- a calm message suitable for immediate rendering
- optional `retryAfterSeconds`
- optional formatted retry text such as `Try again in 2 minutes.`
- a flag indicating whether the captcha widget should be considered refreshed/reset

Forgot-password and resend-verification UX must stay generic and non-enumerating even when a cooldown is active.

## API And Entity Updates

Update entity/request mappers so the frontend contract types reflect backend-protected request shapes:

- `src/entities/auth/model.ts`
- `src/entities/session/model.ts`
- `src/entities/twoFactor/model.ts`
- `src/entities/passkey/model.ts`
- profile/email-change model files as needed

Regenerate OpenAPI types before changing the handwritten API layer so the contract remains the source of truth.

## Error Handling Boundaries

The shared protection layer handles only abuse/captcha/rate-limit behavior.

Feature-level code continues to handle unrelated domain/business errors, for example:

- `EMAIL_NOT_VERIFIED` login behavior and CTA
- invalid credentials copy
- invalid/expired reset token copy
- invalid/expired verification token copy
- 2FA challenge unavailable logic
- passkey browser support or cancellation errors

The rule is:

- if the error matches the shared protection contract, normalize it centrally
- otherwise return the error to the feature/page so existing domain handling still works

## Testing Strategy

Follow TDD and cover both shared behavior and representative flow integration.

### Shared-Layer Tests

- unit tests for protection-contract normalization
- unit tests for retry/cooldown formatting
- unit or integration tests for Turnstile runtime behavior
- unit or integration tests for `useProtectedAction`

### Feature-Level Tests

Add or update representative tests for:

- login
- forgot-password
- reset-password
- one 2FA completion path
- one public passkey login path
- authenticated email-change verification

These tests should verify:

- `captchaToken` is sent where required
- normalized protection UX is rendered consistently
- unrelated business errors are still handled by the page or feature
- non-enumerating forgot/resend acceptance behavior remains intact

## Documentation

Update README and any relevant project docs with:

- Turnstile environment/config setup
- the fact that protected auth/security flows now require captcha
- the fact that the frontend uses a shared protection abstraction rather than page-specific logic

## Out Of Scope

- backend contract changes
- redesigning unrelated auth/security screens
- extending captcha to authenticated settings endpoints that do not require it in the current backend contract
- changing passkey registration or authenticated passkey-management semantics
