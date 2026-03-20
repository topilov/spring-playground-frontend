# Passkey Security Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build passkey login plus authenticated passkey management on a dedicated `/settings/security` route using the backend WebAuthn contract.

**Architecture:** Regenerate the backend types first, then add a dedicated passkey feature area with entity mappings, API functions, query/mutation hooks, and a browser WebAuthn service. Keep page components thin by moving ceremony orchestration into focused feature modules and reuse the existing auth-session refresh flow after successful passkey login.

**Tech Stack:** React 19, React Router 7, TanStack Query 5, React Hook Form, Zod, Vitest, WebAuthn browser APIs

---

### Task 1: Refresh the Contract Surface

**Files:**
- Modify: `src/shared/api/generated/schema.d.ts`
- Modify: `src/entities/auth/model.ts`
- Test: `src/features/auth/api.test.ts`

- [ ] Step 1: Regenerate OpenAPI types from the backend schema.
- [ ] Step 2: Extend auth entity mappings with passkey request/response types and app-facing models.
- [ ] Step 3: Add failing API tests for passkey registration options/verify, list, rename, delete, and passkey login endpoints.
- [ ] Step 4: Run the passkey API tests to verify they fail for missing functions.

### Task 2: Build the Passkey Transport and Browser Boundary

**Files:**
- Create: `src/features/passkeys/webauthn.ts`
- Create: `src/features/passkeys/webauthn.test.ts`
- Modify: `src/features/auth/api.ts`
- Modify: `src/features/auth/mutations.ts`

- [ ] Step 1: Add failing unit tests for Base64URL conversion, backend-option decoding, credential serialization, and unsupported/cancelled browser cases.
- [ ] Step 2: Implement the WebAuthn helper module with decoding and serialization helpers plus ceremony wrappers.
- [ ] Step 3: Add handwritten API functions and mutations that start/finish passkey registration and login while refreshing the auth session cache after successful passkey login.
- [ ] Step 4: Run the focused tests and keep them green before moving on.

### Task 3: Add Protected Security Settings Routing

**Files:**
- Modify: `src/shared/routing/paths.ts`
- Modify: `src/app/router.tsx`
- Modify: `src/app/router.test.tsx`
- Create: `src/pages/settings/SecuritySettingsPage.tsx`
- Modify: `src/pages/profile/ProfilePage.tsx`

- [ ] Step 1: Add a failing router test for `/settings/security` behind `ProtectedRoute`.
- [ ] Step 2: Add the new route path and page shell.
- [ ] Step 3: Add a profile CTA to manage security settings.
- [ ] Step 4: Re-run the router tests.

### Task 4: Build the Passkey Management UI

**Files:**
- Create: `src/features/passkeys/api.ts`
- Create: `src/features/passkeys/hooks.ts`
- Create: `src/features/passkeys/components/PasskeySection.tsx`
- Create: `src/features/passkeys/components/PasskeySection.test.tsx`
- Modify: `src/app/app.css`

- [ ] Step 1: Add failing component tests for empty state, list rendering, register flow trigger, rename, and delete flows.
- [ ] Step 2: Implement the query/mutation hooks and section component.
- [ ] Step 3: Wire the section into `/settings/security` with accessible loading and error states.
- [ ] Step 4: Run the focused UI tests.

### Task 5: Add Passkey Login UX

**Files:**
- Modify: `src/features/auth/components/LoginForm.tsx`
- Create: `src/features/auth/components/LoginForm.test.tsx`

- [ ] Step 1: Add failing tests for the `Sign in with passkey` button and its success/error orchestration.
- [ ] Step 2: Implement the passkey login button and user-facing states without regressing password login.
- [ ] Step 3: Re-run the login form tests.

### Task 6: Documentation and Verification

**Files:**
- Modify: `docs/architecture/frontend-baseline.md`
- Modify: `docs/backend-api.md`
- Modify: `README.md`

- [ ] Step 1: Document the new security route and passkey integration pattern.
- [ ] Step 2: Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- [ ] Step 3: Fix any issues found and re-run verification until clean.
