# Signal Room UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the full frontend into the approved Signal Room operator-console aesthetic while preserving current route behavior, auth flows, and backend contract usage.

**Architecture:** Rebuild the UI from the shared shell outward. Start by locking route and shell semantics in tests, then replace the global token system and shared layout primitives, then move route groups inwards: anonymous entry routes first, authenticated workspaces second, and passkey/security surfaces last. Keep data loading and mutations untouched unless a UI seam truly requires a small orchestration adjustment.

**Tech Stack:** React 19, React Router 7, TanStack Query 5, React Hook Form, Zod, Vitest, Vite, CSS

---

## File Structure And Responsibilities

- `src/app/app.css`: global Signal Room tokens, typography, shell layout, auth/workspace bands, responsive breakpoints, and shared state styling.
- `src/app/layout/AppLayout.tsx`: persistent header, route navigation, anonymous/authenticated utility action behavior, and shared page framing.
- `src/shared/ui/AuthPageShell.tsx`: two-zone anonymous-route layout for auth and verification states.
- `src/shared/ui/PageHeader.tsx`: authenticated workspace header with stronger title/context/action layout.
- `src/pages/login/LoginPage.tsx`: login route copy and right-side utility action.
- `src/pages/register/RegisterPage.tsx`: register route copy and right-side utility action.
- `src/pages/forgot-password/ForgotPasswordPage.tsx`: reset-request route framing and back-to-login utility action.
- `src/pages/reset-password/ResetPasswordPage.tsx`: reset route framing for token-driven password replacement.
- `src/pages/verify-email/VerifyEmailPage.tsx`: verification and resend states inside the new auth shell.
- `src/pages/profile/ProfilePage.tsx`: identity workspace layout, grouped details, and page-level actions.
- `src/pages/settings/SecuritySettingsPage.tsx`: security workspace layout and passkey posture framing.
- `src/features/passkeys/components/PasskeySection.tsx`: passkey management content band and action grouping inside the security workspace.
- `src/app/router.test.tsx`: route accessibility, redirects, and top-nav expectations after shell changes.
- `src/features/auth/components/LoginForm.test.tsx`: login surface behavior while the surrounding layout changes.
- `src/features/auth/components/ResetPasswordForm.test.tsx`: regression coverage for reset flow while entry surfaces are rebuilt.
- `src/pages/verify-email/VerifyEmailPage.test.tsx`: verification, resend, success, and error-state coverage during the auth-shell rewrite.
- `src/pages/profile/ProfilePage.test.tsx`: loading, refresh, error, and authenticated-detail coverage during the workspace rewrite.
- `src/features/passkeys/components/PasskeySection.test.tsx`: security/passkey behavior while its UI structure changes.

### Task 1: Lock Shell Semantics Before Restyling

**Files:**
- Modify: `src/app/router.test.tsx`
- Modify: `src/app/layout/AppLayout.tsx`
- Modify: `src/shared/ui/AuthPageShell.tsx`

- [ ] Step 1: Add failing route tests that describe the new shell expectations for anonymous and authenticated states.
  Example assertions to add in `src/app/router.test.tsx`:
  ```tsx
  expect(within(primaryNav).getByRole('link', { name: 'Sign in' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Create account' })).toBeTruthy();
  expect(within(primaryNav).queryByRole('link', { name: 'Profile' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy();
  ```
- [ ] Step 2: Run `npm test -- src/app/router.test.tsx` and confirm the new assertions fail because the current shell still renders the old navigation/actions.
- [ ] Step 3: Update `src/app/layout/AppLayout.tsx` so anonymous routes expose only the minimal route navigation plus one right-side utility action, while authenticated routes keep account-oriented actions with `Sign out` as the utility action.
- [ ] Step 4: Update `src/shared/ui/AuthPageShell.tsx` to support the new two-zone structure without breaking existing children/footer composition.
- [ ] Step 5: Re-run `npm test -- src/app/router.test.tsx` and verify the route coverage passes.
- [ ] Step 6: Commit the shell-semantic baseline.
  ```bash
  git add src/app/router.test.tsx src/app/layout/AppLayout.tsx src/shared/ui/AuthPageShell.tsx
  git commit -m "feat: establish signal room shell semantics"
  ```

### Task 2: Replace Global Tokens And Shared Layout Primitives

**Files:**
- Modify: `src/app/app.css`
- Modify: `src/shared/ui/PageHeader.tsx`
- Modify: `src/shared/ui/AuthPageShell.tsx`
- Modify: `src/app/layout/AppLayout.tsx`
- Modify: `src/app/router.test.tsx`

- [ ] Step 1: Add the smallest failing structural assertions needed to guard the new shared primitives, such as named auth intro/context regions or stronger workspace header semantics if they are not already covered by Task 1.
  Example:
  ```tsx
  expect(screen.getByText('Use your account details or a passkey.')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
  ```
- [ ] Step 2: Run the focused test file(s) again and confirm any new semantic assertions fail before changing styles.
- [ ] Step 3: Rewrite `src/app/app.css` around the Signal Room token set:
  - graphite and near-black background layers
  - pale text tiers
  - mint accent and accent-soft states
  - measured spacing scale
  - compact header chrome
  - centered session/context indicator styling for routes that have relevant context
  - responsive two-zone auth and single-rail workspace layouts
- [ ] Step 4: Update `src/shared/ui/PageHeader.tsx` so it supports the stronger authenticated workspace hierarchy and compact action placement described in the spec.
- [ ] Step 5: Adjust `src/app/layout/AppLayout.tsx` and `src/shared/ui/AuthPageShell.tsx` markup only as needed to align with the new CSS primitives, including the centered session/context indicator when relevant; avoid introducing a second parallel layout abstraction.
- [ ] Step 6: Implement the shared interaction rules in `src/app/app.css` and shared markup:
  - route-entry reveal for shell, heading, and main content plane
  - crisp hover and focus surface shifts for primary actions and key controls
  - consistent active-state treatment in navigation
  - motion that can be removed without harming comprehension
- [ ] Step 7: Run `npm test -- src/app/router.test.tsx` to confirm the shared shell refactor did not regress route behavior.
- [ ] Step 8: Commit the token and primitive rewrite.
  ```bash
  git add src/app/app.css src/shared/ui/PageHeader.tsx src/shared/ui/AuthPageShell.tsx src/app/layout/AppLayout.tsx src/app/router.test.tsx
  git commit -m "feat: add signal room design primitives"
  ```

### Task 3: Rebuild Anonymous Entry Routes In The New Shell

**Files:**
- Modify: `src/pages/login/LoginPage.tsx`
- Modify: `src/pages/register/RegisterPage.tsx`
- Modify: `src/pages/forgot-password/ForgotPasswordPage.tsx`
- Modify: `src/pages/reset-password/ResetPasswordPage.tsx`
- Modify: `src/pages/verify-email/VerifyEmailPage.tsx`
- Modify: `src/features/auth/components/LoginForm.test.tsx`
- Modify: `src/features/auth/components/ResetPasswordForm.test.tsx`
- Create: `src/pages/verify-email/VerifyEmailPage.test.tsx`

- [ ] Step 1: Add or extend failing tests so the rebuilt entry routes still expose the expected actions and status copy inside the new operator shell.
  Example additions:
  ```tsx
  expect(screen.getByRole('button', { name: 'Sign in with passkey' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Reset password' })).toBeTruthy();
  ```
- [ ] Step 2: Add failing page tests in `src/pages/verify-email/VerifyEmailPage.test.tsx` for token-verifying, verified, failed, idle, and resend-success branches so the verify-email redesign is behavior-safe.
  Example:
  ```tsx
  expect(screen.getByText('Checking your verification link...')).toBeTruthy();
  expect(await screen.findByText('Email verified. You can sign in now.')).toBeTruthy();
  ```
- [ ] Step 3: Run `npm test -- src/features/auth/components/LoginForm.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx src/pages/verify-email/VerifyEmailPage.test.tsx` and verify the new assertions fail if they depend on updated route framing or labels.
- [ ] Step 4: Update `src/pages/login/LoginPage.tsx`, `src/pages/register/RegisterPage.tsx`, `src/pages/forgot-password/ForgotPasswordPage.tsx`, and `src/pages/reset-password/ResetPasswordPage.tsx` to supply the concise operational copy, utility actions, and any new side-note content needed by the two-zone auth shell.
- [ ] Step 5: Refactor `src/pages/verify-email/VerifyEmailPage.tsx` so verification, resend, success, and error states inherit the same entry-shell structure instead of stacking banners like a legacy form page.
- [ ] Step 6: Re-run the focused auth and verify-email tests and fix any regressions without changing backend-facing behavior.
- [ ] Step 7: Manually sanity-check `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/verify-email` in the browser at ~390px and ~1280px widths before committing, including verify-email success/error/resend branches.
- [ ] Step 8: Commit the anonymous-route redesign.
  ```bash
  git add src/pages/login/LoginPage.tsx src/pages/register/RegisterPage.tsx src/pages/forgot-password/ForgotPasswordPage.tsx src/pages/reset-password/ResetPasswordPage.tsx src/pages/verify-email/VerifyEmailPage.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/features/auth/components/LoginForm.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx
  git commit -m "feat: redesign anonymous entry routes"
  ```

### Task 4: Rebuild Profile And Security As Measured Workspaces

**Files:**
- Modify: `src/pages/profile/ProfilePage.tsx`
- Modify: `src/pages/settings/SecuritySettingsPage.tsx`
- Modify: `src/features/passkeys/components/PasskeySection.tsx`
- Modify: `src/features/passkeys/components/PasskeySection.test.tsx`
- Modify: `src/app/app.css`
- Create: `src/pages/profile/ProfilePage.test.tsx`

- [ ] Step 1: Extend `src/features/passkeys/components/PasskeySection.test.tsx` with any missing behavior assertions that protect the current flows while the layout changes.
  Example:
  ```tsx
  expect(screen.getByRole('heading', { name: 'Passkeys' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Add passkey' })).toBeTruthy();
  ```
- [ ] Step 2: Run `npm test -- src/features/passkeys/components/PasskeySection.test.tsx src/app/router.test.tsx` and confirm coverage is in place before editing the authenticated workspaces.
- [ ] Step 3: Add failing tests in `src/pages/profile/ProfilePage.test.tsx` for authenticated detail rendering, loading shell, refresh error state, and anonymous fallback so the page redesign preserves its behavioral branches.
  Example:
  ```tsx
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();
  expect(await screen.findByRole('alert')).toHaveTextContent('We could not refresh your profile.');
  ```
- [ ] Step 4: Run `npm test -- src/pages/profile/ProfilePage.test.tsx src/features/passkeys/components/PasskeySection.test.tsx src/app/router.test.tsx` and confirm coverage is in place before editing the authenticated workspaces.
- [ ] Step 5: Rewrite `src/pages/profile/ProfilePage.tsx` to use content bands or aligned detail rows rather than stacked cards, while preserving refresh/error/loading behavior.
- [ ] Step 6: Rewrite `src/pages/settings/SecuritySettingsPage.tsx` to match the same workspace geometry and place passkey posture/context in the secondary emphasis zone.
- [ ] Step 7: Refactor `src/features/passkeys/components/PasskeySection.tsx` so add/rename/delete flows remain intact inside the new security layout, with calmer but clearer loading, empty, and error states.
- [ ] Step 8: Fold any route-specific workspace styling back into `src/app/app.css` instead of scattering one-off inline structure across multiple files.
- [ ] Step 9: Re-run the focused profile, passkey, and router tests and keep them green.
- [ ] Step 10: Commit the authenticated workspace redesign.
  ```bash
  git add src/pages/profile/ProfilePage.tsx src/pages/profile/ProfilePage.test.tsx src/pages/settings/SecuritySettingsPage.tsx src/features/passkeys/components/PasskeySection.tsx src/features/passkeys/components/PasskeySection.test.tsx src/app/app.css src/app/router.test.tsx
  git commit -m "feat: redesign profile and security workspaces"
  ```

### Task 5: Polish Shared States, Responsive Behavior, And Final Verification

**Files:**
- Modify: `src/app/app.css`
- Modify: `src/app/layout/AppLayout.tsx`
- Modify: `src/shared/ui/AuthPageShell.tsx`
- Modify: `src/shared/ui/PageHeader.tsx`
- Modify: `src/pages/verify-email/VerifyEmailPage.tsx`
- Modify: `src/pages/profile/ProfilePage.tsx`
- Modify: `src/pages/settings/SecuritySettingsPage.tsx`

- [ ] Step 1: Audit loading, success, empty, and error states across verify-email, profile, and security so they read like part of the Signal Room system rather than leftover banners or cards.
- [ ] Step 2: Audit the motion and interaction requirements from the spec in a real browser:
  - route-entry reveal is visible but restrained
  - hover and focus states sharpen affordance without noise
  - active navigation states remain consistent
  - the UI still reads clearly if motion is reduced or removed
- [ ] Step 3: Add the smallest missing regression tests if the audit reveals an uncovered state transition that could break silently.
- [ ] Step 4: Run `npm test -- src/app/router.test.tsx src/features/auth/components/LoginForm.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/pages/profile/ProfilePage.test.tsx src/features/passkeys/components/PasskeySection.test.tsx`.
- [ ] Step 5: Run `npm run lint`, `npm run typecheck`, and `npm run build`.
- [ ] Step 6: Start the dev server, authenticate with a working local account before checking protected routes, and manually verify `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/profile`, and `/settings/security` at ~390px, ~768px, and ~1280px widths.
  Include explicit checks for:
  - verify-email verifying, verified, failed, and resend-success states
  - profile loading, authenticated detail, refresh failure, and anonymous redirect/fallback behavior
  - a quick `/missing-route` smoke check so the not-found surface still sits correctly inside the rewritten shared shell
  Practical triggers:
  - use valid, invalid, and missing `token` query params on `/verify-email` plus a resend submission to exercise the verification branches
  - use the existing profile refresh control while the backend is unavailable or mocked to fail in order to confirm the refresh-error state
- [ ] Step 7: Fix any issues found and repeat verification until all checks are clean.
- [ ] Step 8: Commit the final polish pass.
  ```bash
  git add src/app/app.css src/app/layout/AppLayout.tsx src/shared/ui/AuthPageShell.tsx src/shared/ui/PageHeader.tsx src/pages/verify-email/VerifyEmailPage.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/pages/profile/ProfilePage.tsx src/pages/profile/ProfilePage.test.tsx src/pages/settings/SecuritySettingsPage.tsx src/app/router.test.tsx src/features/auth/components/LoginForm.test.tsx src/features/auth/components/ResetPasswordForm.test.tsx src/features/passkeys/components/PasskeySection.test.tsx
  git commit -m "feat: finish signal room ui redesign"
  ```
