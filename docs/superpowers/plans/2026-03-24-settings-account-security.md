# Settings Account And Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add account settings flows for username, email change request, email change verification, and password change using the backend OpenAPI contract.

**Architecture:** Keep the API transport handwritten in feature modules, add a dedicated account settings route for username and email actions, and keep password management with existing security controls. Verification of an email change stays token-based on a standalone route because the backend completes it from a query-token link.

**Tech Stack:** React 19, React Router 7, React Hook Form, Zod, Vitest, handwritten fetch API client, generated OpenAPI types

---

### Task 1: Extend Profile Contract Helpers

**Files:**
- Modify: `src/entities/profile/model.ts`
- Modify: `src/features/profile/api.ts`
- Test: `src/features/profile/api.test.ts`

- [ ] Write failing API tests for username update, password change, email change request, and email change verification.
- [ ] Run `npm test -- src/features/profile/api.test.ts` and confirm the new tests fail for missing exports/behavior.
- [ ] Add generated-contract-backed request/response types and handwritten API functions.
- [ ] Run `npm test -- src/features/profile/api.test.ts` and confirm it passes.

### Task 2: Add Settings Account Navigation

**Files:**
- Modify: `src/shared/routing/paths.ts`
- Modify: `src/app/router.tsx`
- Create: `src/pages/settings/AccountSettingsPage.tsx`
- Test: `src/app/router.test.tsx`

- [ ] Write failing routing/navigation tests for the new account settings route and settings tabs.
- [ ] Run `npm test -- src/app/router.test.tsx` and confirm failure.
- [ ] Add the account settings route and tab navigation structure.
- [ ] Run `npm test -- src/app/router.test.tsx` and confirm pass.

### Task 3: Build Account Settings Forms

**Files:**
- Create: `src/features/profile/components/AccountSettingsSection.tsx`
- Create: `src/features/profile/components/AccountSettingsSection.test.tsx`
- Modify: `src/pages/settings/AccountSettingsPage.tsx`

- [ ] Write failing tests for username save, email change request success state, and API error rendering.
- [ ] Run `npm test -- src/features/profile/components/AccountSettingsSection.test.tsx` and confirm failure.
- [ ] Implement the minimal account settings form UI and session refresh behavior.
- [ ] Run `npm test -- src/features/profile/components/AccountSettingsSection.test.tsx` and confirm pass.

### Task 4: Add Password Change To Security

**Files:**
- Create: `src/features/profile/components/PasswordChangeSection.tsx`
- Create: `src/features/profile/components/PasswordChangeSection.test.tsx`
- Modify: `src/pages/settings/SecuritySettingsPage.tsx`

- [ ] Write failing tests for password validation, submit success, and API error handling.
- [ ] Run `npm test -- src/features/profile/components/PasswordChangeSection.test.tsx` and confirm failure.
- [ ] Implement the minimal password change form above 2FA and passkeys.
- [ ] Run `npm test -- src/features/profile/components/PasswordChangeSection.test.tsx` and confirm pass.

### Task 5: Add Email Change Verification Route

**Files:**
- Create: `src/pages/verify-email-change/VerifyEmailChangePage.tsx`
- Create: `src/pages/verify-email-change/VerifyEmailChangePage.test.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/shared/routing/paths.ts`

- [ ] Write failing tests for token verification success, missing token state, and verification failure state.
- [ ] Run `npm test -- src/pages/verify-email-change/VerifyEmailChangePage.test.tsx` and confirm failure.
- [ ] Implement the token-driven verification page with profile refresh after success.
- [ ] Run `npm test -- src/pages/verify-email-change/VerifyEmailChangePage.test.tsx` and confirm pass.

### Task 6: Final Verification

**Files:**
- Modify as needed from previous tasks

- [ ] Run targeted Vitest suites for all changed areas.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
