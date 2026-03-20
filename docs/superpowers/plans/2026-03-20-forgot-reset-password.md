# Forgot And Reset Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full forgot/reset password frontend flow that matches the backend contract and ends with a reset success screen linking back to login.

**Architecture:** Keep the existing `/forgot-password` screen for reset-link requests and add a dedicated `/reset-password` anonymous route that reads the token from the query string. Extend the handwritten auth API layer and auth entity model with reset-password types, then implement a focused reset form with local validation and backend-aware error handling.

**Tech Stack:** React 19, React Router 7, React Hook Form, Zod, TanStack Query, Vitest, Testing Library, handwritten fetch API client with OpenAPI-generated types.

---

### Task 1: Reset Password API Contract

**Files:**
- Modify: `src/features/auth/api.test.ts`
- Modify: `src/entities/auth/model.ts`
- Modify: `src/features/auth/api.ts`
- Modify: `src/features/auth/mutations.ts`

- [ ] **Step 1: Write the failing test**

Add a Vitest case in `src/features/auth/api.test.ts` that calls `resetPassword({ token, newPassword })` and expects:
- request URL `http://localhost:8080/api/auth/reset-password`
- method `POST`
- `credentials: "include"`
- JSON body `{"token":"...","newPassword":"..."}`
- parsed result `{ reset: true }`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/auth/api.test.ts`
Expected: FAIL because `resetPassword` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement reset-password DTO mapping in `src/entities/auth/model.ts`, then add `resetPassword()` to the auth API and `useResetPasswordMutation()` to mutations.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/features/auth/api.test.ts`
Expected: PASS

### Task 2: Routing And Page Shell

**Files:**
- Modify: `src/shared/routing/paths.ts`
- Modify: `src/app/router.tsx`
- Modify: `src/app/router.test.tsx`
- Create: `src/pages/reset-password/ResetPasswordPage.tsx`

- [ ] **Step 1: Write the failing test**

Add a router test that renders `/reset-password` as an anonymous user and expects the reset-password page heading to appear.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/router.test.tsx`
Expected: FAIL because the route/page do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add `routePaths.resetPassword`, register the anonymous route, and create the page shell with heading/copy plus the form mount point.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/router.test.tsx`
Expected: PASS

### Task 3: Reset Password Form Behaviors

**Files:**
- Modify: `src/features/auth/forms.ts`
- Create: `src/features/auth/components/ResetPasswordForm.tsx`
- Create: `src/features/auth/components/ResetPasswordForm.test.tsx`
- Modify: `src/pages/reset-password/ResetPasswordPage.tsx`

- [ ] **Step 1: Write the failing tests**

Add component tests covering:
- missing token shows invalid-link state and a login action
- mismatched `confirmPassword` shows a validation error and blocks submission
- successful submission shows the success state with a login action

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/auth/components/ResetPasswordForm.test.tsx`
Expected: FAIL because the component and schema do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create the schema and component:
- accept `token` as a prop
- render error-state when missing
- use `react-hook-form` + `zodResolver`
- call `useResetPasswordMutation`
- surface backend error messages through `getApiErrorMessage`
- swap to success UI on successful reset

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/auth/components/ResetPasswordForm.test.tsx`
Expected: PASS

### Task 4: Full Verification

**Files:**
- Modify only if verification reveals gaps

- [ ] **Step 1: Run focused suite**

Run: `npm test -- src/features/auth/api.test.ts src/app/router.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx`
Expected: PASS

- [ ] **Step 2: Run broader verification**

Run:
- `npm test`
- `npm run lint`
- `npm run typecheck`

Expected: PASS

- [ ] **Step 3: Review final UX states**

Confirm manually from code that:
- forgot-password still shows generic acceptance copy
- reset-password handles both missing-token and success states
- success state links users back to login without auto-login
