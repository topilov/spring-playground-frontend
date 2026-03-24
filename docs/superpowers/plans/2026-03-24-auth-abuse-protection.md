# Auth Abuse Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared frontend abuse-protection pattern with Turnstile, normalized protection-state handling, and contract-aligned protected request payloads across auth, public security, and email-change verification flows.

**Architecture:** Regenerate OpenAPI types first, then add a shared protection module that owns Turnstile lifecycle and backend protection normalization while leaving success behavior and unrelated business-error handling local to each page. Refactor protected auth, 2FA, passkey-login, and authenticated email-change verification flows to submit through that shared controller and render a consistent calm protection UX.

**Tech Stack:** React 19, React Router 7, React Hook Form, Zod, TanStack Query, Vitest, Testing Library, handwritten fetch API client with OpenAPI-generated types, Cloudflare Turnstile runtime loaded in the browser.

---

### Task 1: Refresh Contract Types And Identify Protected Request Shapes

**Files:**
- Modify: `src/shared/api/generated/schema.d.ts`
- Modify: `src/entities/auth/model.ts`
- Modify: `src/entities/session/model.ts`
- Modify: `src/entities/twoFactor/model.ts`
- Modify: `src/entities/passkey/model.ts`
- Modify: profile entity model files that map `POST /api/profile/me/email/verify`
- Test: `src/features/auth/api.test.ts`
- Test: `src/features/two-factor/api.test.ts`
- Test: `src/features/passkeys/api.test.ts`

- [ ] **Step 1: Regenerate the OpenAPI types**

Run: `npm run openapi:generate`
Expected: `src/shared/api/generated/schema.d.ts` includes required `captchaToken` fields and protected-response shapes from the backend contract.

- [ ] **Step 2: Write the failing API tests**

Add or update API tests so the protected requests assert contract-aligned JSON bodies:
- `register` sends `captchaToken`
- `login` sends `captchaToken`
- `forgotPassword` sends `captchaToken`
- `resetPassword` sends `captchaToken`
- `resendVerificationEmail` sends `captchaToken`
- `verifyTwoFactorLogin` and `verifyTwoFactorBackupCodeLogin` send `captchaToken`
- `startPasskeyLogin` and `finishPasskeyLogin` send `captchaToken`
- authenticated email-change verification sends `captchaToken`

- [ ] **Step 3: Run the focused API tests to verify they fail**

Run: `npm test -- src/features/auth/api.test.ts src/features/two-factor/api.test.ts src/features/passkeys/api.test.ts`
Expected: FAIL because the current entity mappers and handwritten API layer do not yet include captcha-enabled protected payloads everywhere.

- [ ] **Step 4: Implement the contract-aligned request mappers**

Update the relevant entity model files so protected input types can carry `captchaToken`, then wire those shapes through the handwritten feature API modules.

- [ ] **Step 5: Run the focused API tests to verify they pass**

Run: `npm test -- src/features/auth/api.test.ts src/features/two-factor/api.test.ts src/features/passkeys/api.test.ts`
Expected: PASS

### Task 2: Build Shared Protection Types, Parsing, And Retry Formatting

**Files:**
- Create: `src/shared/protection/types.ts`
- Create: `src/shared/protection/contract.ts`
- Create: `src/shared/protection/formatRetryAfter.ts`
- Create: `src/shared/protection/contract.test.ts`
- Create: `src/shared/protection/formatRetryAfter.test.ts`

- [ ] **Step 1: Write the failing shared-layer tests**

Add tests that cover:
- captcha-validation failure normalizes to `captcha_invalid`
- generic `429` throttling normalizes to `rate_limited`
- cooldown responses normalize to `cooldown_active`
- retry/cooldown timing is formatted consistently from `retryAfterSeconds`
- unrelated domain errors are not reclassified as protection errors

- [ ] **Step 2: Run the shared-layer tests to verify they fail**

Run: `npm test -- src/shared/protection/contract.test.ts src/shared/protection/formatRetryAfter.test.ts`
Expected: FAIL because the protection contract modules do not exist yet.

- [ ] **Step 3: Implement the protection types and parser**

Create a focused shared protection contract layer that:
- reads only the protection-specific response details it needs
- returns a normalized protection result
- leaves unrelated business/domain errors untouched
- centralizes retry/cooldown formatting helpers

- [ ] **Step 4: Run the shared-layer tests to verify they pass**

Run: `npm test -- src/shared/protection/contract.test.ts src/shared/protection/formatRetryAfter.test.ts`
Expected: PASS

### Task 3: Build The Turnstile Runtime And Protected Action Controller

**Files:**
- Create: `src/shared/protection/turnstile/TurnstileScript.ts`
- Create: `src/shared/protection/turnstile/TurnstileWidget.tsx`
- Create: `src/shared/protection/turnstile/useTurnstileController.ts`
- Create: `src/shared/protection/useProtectedAction.ts`
- Create: `src/shared/protection/ProtectedStatusBanner.tsx`
- Modify: `src/shared/config/appConfig.ts`
- Modify: `src/shared/config/appConfig.test.ts`
- Create: `src/shared/protection/useProtectedAction.test.tsx`
- Create: `src/shared/protection/turnstile/TurnstileWidget.test.tsx`

- [ ] **Step 1: Write the failing controller/runtime tests**

Add tests that verify:
- Turnstile site-key config is read from app config
- the widget/controller can report readiness and reset requests
- `useProtectedAction` acquires a token before calling `execute`
- `useProtectedAction` resets captcha on success
- `useProtectedAction` resets captcha on protection failures
- `useProtectedAction` returns a stable user-facing error when token acquisition fails

- [ ] **Step 2: Run the controller/runtime tests to verify they fail**

Run: `npm test -- src/shared/config/appConfig.test.ts src/shared/protection/useProtectedAction.test.tsx src/shared/protection/turnstile/TurnstileWidget.test.tsx`
Expected: FAIL because the Turnstile runtime and shared protected-action controller do not exist yet.

- [ ] **Step 3: Implement the shared runtime and controller**

Create a minimal but complete shared protection runtime:
- add Turnstile env/config support
- load the Turnstile script once
- render the widget inline
- expose token acquisition/reset helpers
- implement `useProtectedAction` with centralized captcha lifecycle and normalized protection handling
- add a small presentational banner component for consistent protection copy

- [ ] **Step 4: Run the controller/runtime tests to verify they pass**

Run: `npm test -- src/shared/config/appConfig.test.ts src/shared/protection/useProtectedAction.test.tsx src/shared/protection/turnstile/TurnstileWidget.test.tsx`
Expected: PASS

### Task 4: Refactor Protected Auth Forms To Use The Shared Pattern

**Files:**
- Modify: `src/features/auth/components/LoginForm.tsx`
- Modify: `src/features/auth/components/RegisterForm.tsx`
- Modify: `src/features/auth/components/ForgotPasswordForm.tsx`
- Modify: `src/features/auth/components/ResetPasswordForm.tsx`
- Modify: resend verification page/component files
- Modify: `src/features/auth/mutations.ts`
- Modify: `src/features/auth/forms.ts`
- Modify: `src/features/auth/components/LoginForm.test.tsx`
- Modify: `src/features/auth/components/ResetPasswordForm.test.tsx`
- Create or modify tests for register, forgot-password, and resend verification components

- [ ] **Step 1: Write the failing form tests**

Update or add tests to verify:
- protected forms render Turnstile inline near the submit area
- protected form submissions include `captchaToken`
- login still handles `EMAIL_NOT_VERIFIED` locally
- forgot-password and resend verification still show generic accepted UX
- reset-password still handles invalid token/business errors locally
- protection failures render the shared calm protection messaging

- [ ] **Step 2: Run the focused auth-form tests to verify they fail**

Run: `npm test -- src/features/auth/components/LoginForm.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx`
Expected: FAIL because the forms do not yet use the shared protected-action pattern.

- [ ] **Step 3: Implement the auth-form refactor**

Refactor the protected auth forms so they:
- render the Turnstile widget inline near submit
- call the shared protected-action controller for captcha/protection behavior
- keep success behavior local to each flow
- keep unrelated domain/business-error handling local to each flow

- [ ] **Step 4: Run the focused auth-form tests to verify they pass**

Run: `npm test -- src/features/auth/components/LoginForm.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx`
Expected: PASS

### Task 5: Refactor Public 2FA Completion And Passkey Login

**Files:**
- Modify: `src/pages/login/TwoFactorLoginPage.tsx`
- Modify: `src/pages/login/TwoFactorLoginPage.test.tsx`
- Modify: `src/features/two-factor/hooks.ts`
- Modify: `src/features/passkeys/hooks.ts`
- Modify: passkey-login related component or page tests where that flow is covered

- [ ] **Step 1: Write the failing public-security tests**

Add or update tests to verify:
- 2FA TOTP verification uses the shared protected-action pattern and protection UI
- backup-code verification uses the same pattern
- challenge-expired logic still stays local to the page
- passkey login start/finish send `captchaToken`
- passkey browser errors still surface outside the protection layer

- [ ] **Step 2: Run the focused 2FA/passkey tests to verify they fail**

Run: `npm test -- src/pages/login/TwoFactorLoginPage.test.tsx src/features/two-factor/api.test.ts src/features/passkeys/api.test.ts src/features/passkeys/webauthn.test.ts`
Expected: FAIL because the flows do not yet integrate the shared protection pattern.

- [ ] **Step 3: Implement the 2FA/passkey refactor**

Update the public 2FA completion and passkey-login flows to:
- use the shared protected-action controller
- keep challenge-expired and WebAuthn/browser-specific behavior local
- render normalized shared protection messaging when abuse or captcha failures occur

- [ ] **Step 4: Run the focused 2FA/passkey tests to verify they pass**

Run: `npm test -- src/pages/login/TwoFactorLoginPage.test.tsx src/features/two-factor/api.test.ts src/features/passkeys/api.test.ts src/features/passkeys/webauthn.test.ts`
Expected: PASS

### Task 6: Refactor Authenticated Email-Change Verification

**Files:**
- Modify: profile/email-change API, hooks, and page/component files that submit `POST /api/profile/me/email/verify`
- Modify: `src/pages/verify-email-change/VerifyEmailChangePage.tsx`
- Modify: `src/pages/verify-email-change/VerifyEmailChangePage.test.tsx`
- Add tests around the authenticated protected submit path if missing

- [ ] **Step 1: Write the failing email-change verification tests**

Add or update tests to verify:
- the authenticated email-change verification flow renders Turnstile inline near submit
- the request includes `captchaToken`
- shared protection messaging is used for captcha/throttle/cooldown behavior
- non-protection email-change business errors still surface through local flow logic

- [ ] **Step 2: Run the focused email-change tests to verify they fail**

Run: `npm test -- src/pages/verify-email-change/VerifyEmailChangePage.test.tsx`
Expected: FAIL because the flow does not yet use the shared protected-action pattern.

- [ ] **Step 3: Implement the authenticated email-change protection integration**

Wire the same shared protection abstraction into the authenticated verification flow while keeping its success and non-protection failure behavior local to that page/feature.

- [ ] **Step 4: Run the focused email-change tests to verify they pass**

Run: `npm test -- src/pages/verify-email-change/VerifyEmailChangePage.test.tsx`
Expected: PASS

### Task 7: Documentation And Full Verification

**Files:**
- Modify: `README.md`
- Modify: any auth/security docs that mention the protected flows if needed
- Modify only if verification reveals gaps

- [ ] **Step 1: Update docs**

Document:
- Turnstile environment/setup requirements
- protected flows that now require captcha
- the shared protection abstraction and its purpose

- [ ] **Step 2: Run the representative focused suite**

Run: `npm test -- src/shared/protection/contract.test.ts src/shared/protection/formatRetryAfter.test.ts src/shared/protection/useProtectedAction.test.tsx src/features/auth/api.test.ts src/features/two-factor/api.test.ts src/features/passkeys/api.test.ts src/features/auth/components/LoginForm.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx src/pages/login/TwoFactorLoginPage.test.tsx src/pages/verify-email-change/VerifyEmailChangePage.test.tsx`
Expected: PASS

- [ ] **Step 3: Run full verification**

Run:
- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Expected: PASS

- [ ] **Step 4: Review final UX and contract alignment**

Confirm manually from code and tests that:
- all protected flows use inline Turnstile near submit
- captcha lifecycle/reset behavior is centralized
- protection states are normalized and calm
- retry/cooldown formatting is shared
- unrelated business errors are still handled by the owning page or feature
