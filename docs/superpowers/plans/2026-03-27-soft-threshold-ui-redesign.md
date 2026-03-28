# Soft Threshold UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the frontend into the approved Soft Threshold experience so anonymous users see a calm public product entry, authenticated users get a quieter tool-space shell with sidebar navigation, and all backend-facing behavior remains intact.

**Architecture:** Keep the current feature modules as the contract-preserving core and perform the redesign around them. First lock route and navigation semantics in tests, then split the presentation into `PublicShell` and `AppShell`, then replace the shared visual system and page framing, then rebuild public routes and authenticated workspaces, and finally verify the result with automated checks plus local Playwright QA against the running backend.

**Tech Stack:** React 19, React Router 7, TanStack Query 5, React Hook Form, Zod, Vitest, Vite, CSS, Playwright

---

## File Structure And Responsibilities

- `.env.development` (local-only, do not commit): development-only API/captcha overrides for local QA against the backend at `127.0.0.1:8080`.
- `src/app/router.tsx`: top-level route composition, including the public home route and shell boundaries.
- `src/app/router.test.tsx`: route semantics, shell behavior, and navigation expectations.
- `src/pages/AnonymousEntryRoutes.test.tsx`: anonymous route behavior, especially `/` and auth entry screens.
- `src/app/layout/AppLayout.tsx`: shell switching seam if retained as the top-level wrapper.
- `src/app/layout/PublicShell.tsx`: shared anonymous-route shell with compact top bar and lighter density.
- `src/app/layout/AppShell.tsx`: authenticated shell with compact top bar, sidebar, and workspace frame.
- `src/app/layout/AuthenticatedSidebar.tsx`: persistent authenticated navigation for `Profile`, `Account`, `Security`, and `Telegram`.
- `src/app/app.css`: global light-theme tokens, typography, spacing, layout primitives, shell styles, and responsive behavior.
- `src/shared/ui/AuthPageShell.tsx`: shared public/auth route framing built from the new public intro/content structure.
- `src/shared/ui/PageHeader.tsx`: authenticated workspace header with clearer role separation for title, context, status, and actions.
- `src/pages/home/HomePage.tsx`: anonymous product entry for `/` and authenticated redirect behavior.
- `src/pages/login/LoginPage.tsx`: sign-in page copy and public-shell framing.
- `src/pages/register/RegisterPage.tsx`: registration page copy and public-shell framing.
- `src/pages/forgot-password/ForgotPasswordPage.tsx`: password-reset request framing.
- `src/pages/reset-password/ResetPasswordPage.tsx`: token-based password reset framing.
- `src/pages/verify-email/VerifyEmailPage.tsx`: verification and resend flows inside the new public shell.
- `src/pages/verify-email-change/VerifyEmailChangePage.tsx`: email-change verification flow inside the new public shell.
- `src/pages/login/TwoFactorLoginPage.tsx`: two-factor continuation flow inside the new public shell.
- `src/pages/not-found/NotFoundPage.tsx`: not-found state inside the shared shell system.
- `src/pages/profile/ProfilePage.tsx`: identity overview workspace distinct from account-editing settings.
- `src/pages/settings/AccountSettingsPage.tsx`: account-editing workspace for username and email changes.
- `src/pages/settings/SecuritySettingsPage.tsx`: security workspace for password, two-factor, and passkeys.
- `src/pages/settings/TelegramSettingsPage.tsx`: Telegram integration workspace.
- `src/pages/settings/SettingsTabs.tsx`: remove once sidebar navigation replaces it fully.
- `src/features/auth/components/LoginForm.test.tsx`: login behavior protection while page framing changes.
- `src/pages/verify-email/VerifyEmailPage.test.tsx`: verification/resend behavior protection.
- `src/pages/verify-email-change/VerifyEmailChangePage.test.tsx`: email-change verification behavior protection.
- `src/pages/profile/ProfilePage.test.tsx`: profile loading, refresh, and error-state protection.
- `src/features/profile/components/AccountSettingsSection.test.tsx`: account-settings behavior protection.
- `src/features/passkeys/components/PasskeySection.test.tsx`: passkey behavior protection.
- `src/features/two-factor/components/TwoFactorSection.test.tsx`: two-factor behavior protection.
- `src/features/telegram/components/TelegramSettingsSection.test.tsx`: Telegram behavior protection.

## Task 1: Lock Route Semantics And Local QA Setup

**Files:**
- Create: `.env.development` (local-only, do not commit)
- Modify: `src/app/router.test.tsx`
- Modify: `src/pages/AnonymousEntryRoutes.test.tsx`
- Modify: `src/pages/home/HomePage.tsx`

- [ ] Step 1: Add failing route tests that describe the approved `/` behavior split.
  Example additions:
  ```tsx
  expect(screen.getByRole('heading', { name: 'Spring Playground' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Create account' })).toBeTruthy();
  ```
- [ ] Step 2: Add or extend authenticated route tests so an authenticated visit to `/` still redirects into the product workspace.
  Example assertion:
  ```tsx
  expect(router.state.location.pathname).toBe('/profile');
  ```
- [ ] Step 3: Run `npm test -- src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx` and confirm the new home-route expectations fail before changing `HomePage`.
- [ ] Step 4: Update `src/pages/home/HomePage.tsx` so anonymous users get a real public entry surface while authenticated users still redirect to `/profile`.
- [ ] Step 5: Create a local-only `.env.development` file with the minimum local QA overrides and keep it out of git:
  ```dotenv
  VITE_AUTH_CAPTCHA_REQUIRED=false
  VITE_API_BASE_URL=http://127.0.0.1:8080
  ```
- [ ] Step 6: Re-run `npm test -- src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx` and verify the route semantics now pass.
- [ ] Step 7: Commit the route-semantic baseline without adding `.env.development`.
  ```bash
  git add src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx src/pages/home/HomePage.tsx
  git commit -m "feat: add public home route semantics"
  ```

## Task 2: Split The Shared Presentation Into PublicShell And AppShell

**Files:**
- Create: `src/app/layout/PublicShell.tsx`
- Create: `src/app/layout/AppShell.tsx`
- Create: `src/app/layout/AuthenticatedSidebar.tsx`
- Modify: `src/app/layout/AppLayout.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/app/router.test.tsx`

- [ ] Step 1: Add failing tests for shell-specific navigation so anonymous pages keep the lighter top-bar behavior and authenticated pages expose persistent sidebar navigation.
  Example assertions:
  ```tsx
  expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
  expect(screen.getByRole('navigation', { name: 'Workspace' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Account' })).toBeTruthy();
  ```
- [ ] Step 2: Run `npm test -- src/app/router.test.tsx` and confirm the new shell assertions fail before adding the shell components.
- [ ] Step 3: Create `PublicShell.tsx` with the compact top bar, anonymous utility actions, and a content outlet sized for the calmer public rhythm.
- [ ] Step 4: Create `AppShell.tsx` and `AuthenticatedSidebar.tsx` so authenticated pages share one stable tool-space frame and expose `Profile`, `Account`, `Security`, and `Telegram` as the persistent authenticated navigation set.
- [ ] Step 5: Update `src/app/layout/AppLayout.tsx` and `src/app/router.tsx` so route groups render through the correct shell without changing route meaning or access guards.
- [ ] Step 6: Re-run `npm test -- src/app/router.test.tsx` and verify the shell split preserves the same route and IA semantics.
- [ ] Step 7: Commit the shell split.
  ```bash
  git add src/app/layout/PublicShell.tsx src/app/layout/AppShell.tsx src/app/layout/AuthenticatedSidebar.tsx src/app/layout/AppLayout.tsx src/app/router.tsx src/app/router.test.tsx
  git commit -m "feat: split public and app shells"
  ```

## Task 3: Replace The Shared Visual System And Layout Primitives

**Files:**
- Modify: `src/app/app.css`
- Modify: `src/shared/ui/AuthPageShell.tsx`
- Modify: `src/shared/ui/PageHeader.tsx`
- Modify: `src/app/layout/PublicShell.tsx`
- Modify: `src/app/layout/AppShell.tsx`

- [ ] Step 1: Add the smallest missing semantic assertions needed to guard the new layout primitives if current tests do not already cover them.
  Example:
  ```tsx
  expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
  expect(screen.getByText('Manage sign-in methods and account access posture.')).toBeTruthy();
  ```
- [ ] Step 2: Run the impacted tests and confirm any new semantic coverage fails before restyling.
- [ ] Step 3: Rewrite `src/app/app.css` around the approved light-theme system:
  - warm white surfaces
  - graphite text tiers
  - restrained cool-blue accent
  - typography-led hierarchy
  - lighter separators instead of card grids
  - density differences between public and authenticated shells
- [ ] Step 4: Implement the minimal shared motion system from the spec:
  - restrained page-entry reveal for shell and major content groups
  - crisp hover and focus transitions for navigation and primary actions
  - active-state transitions that stay visible without becoming decorative
- [ ] Step 5: Rework `src/shared/ui/AuthPageShell.tsx` into the shared public intro/content primitive so login, register, reset, verify, and two-factor routes can all share the same structure without duplicating logic.
- [ ] Step 6: Rework `src/shared/ui/PageHeader.tsx` into the workspace header primitive with clearer space for context, status, and actions.
- [ ] Step 7: Update `PublicShell.tsx` and `AppShell.tsx` markup only as needed to match the new CSS primitives, keeping support rails optional and quiet.
- [ ] Step 8: Re-run `npm test -- src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx` and verify that the shared visual refactor did not regress route behavior.
- [ ] Step 9: Commit the shared visual system rewrite.
  ```bash
  git add src/app/app.css src/shared/ui/AuthPageShell.tsx src/shared/ui/PageHeader.tsx src/app/layout/PublicShell.tsx src/app/layout/AppShell.tsx src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx
  git commit -m "feat: add soft threshold design system"
  ```

## Task 4: Rebuild Public Entry And Auth Routes In The New Shell

**Files:**
- Modify: `src/pages/home/HomePage.tsx`
- Modify: `src/pages/login/LoginPage.tsx`
- Modify: `src/pages/register/RegisterPage.tsx`
- Modify: `src/pages/forgot-password/ForgotPasswordPage.tsx`
- Modify: `src/pages/reset-password/ResetPasswordPage.tsx`
- Modify: `src/pages/verify-email/VerifyEmailPage.tsx`
- Modify: `src/pages/verify-email-change/VerifyEmailChangePage.tsx`
- Modify: `src/pages/login/TwoFactorLoginPage.tsx`
- Modify: `src/pages/not-found/NotFoundPage.tsx`
- Modify: `src/features/auth/components/LoginForm.test.tsx`
- Modify: `src/pages/verify-email/VerifyEmailPage.test.tsx`
- Modify: `src/pages/verify-email-change/VerifyEmailChangePage.test.tsx`
- Modify: `src/pages/login/TwoFactorLoginPage.test.tsx`

- [ ] Step 1: Extend failing tests so public routes still protect the same behaviors while their framing changes.
  Example:
  ```tsx
  expect(screen.getByRole('button', { name: 'Sign in with passkey' })).toBeTruthy();
  expect(await screen.findByText('Email verified. Operator access is ready for sign-in.')).toBeTruthy();
  expect(await screen.findByText('Email change verified.')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Two-factor sign in' })).toBeTruthy();
  ```
- [ ] Step 2: Run `npm test -- src/features/auth/components/LoginForm.test.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/pages/verify-email-change/VerifyEmailChangePage.test.tsx src/pages/login/TwoFactorLoginPage.test.tsx` and confirm coverage is in place before changing public route composition.
- [ ] Step 3: Rebuild `src/pages/home/HomePage.tsx` into the approved quiet product entry: short description, restrained capability cues, and direct entry actions without landing-page bloat.
- [ ] Step 4: Update `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, and `TwoFactorLoginPage.tsx` so they inherit the same public-shell language and concise operational copy.
- [ ] Step 5: Refactor `VerifyEmailPage.tsx` so verifying, verified, failed, idle, and resend-success states all read as part of the same public system rather than bolted-on banners.
- [ ] Step 6: Update `VerifyEmailChangePage.tsx` so email-change verification follows the same shell language and status treatment as the other public verification flows.
- [ ] Step 7: Update `NotFoundPage.tsx` so missing routes still sit correctly inside the shared shell language.
- [ ] Step 8: Re-run `npm test -- src/features/auth/components/LoginForm.test.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/pages/verify-email-change/VerifyEmailChangePage.test.tsx src/pages/login/TwoFactorLoginPage.test.tsx src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx`.
- [ ] Step 9: Commit the public-route redesign.
  ```bash
  git add src/pages/home/HomePage.tsx src/pages/login/LoginPage.tsx src/pages/register/RegisterPage.tsx src/pages/forgot-password/ForgotPasswordPage.tsx src/pages/reset-password/ResetPasswordPage.tsx src/pages/verify-email/VerifyEmailPage.tsx src/pages/verify-email-change/VerifyEmailChangePage.tsx src/pages/login/TwoFactorLoginPage.tsx src/pages/not-found/NotFoundPage.tsx src/features/auth/components/LoginForm.test.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/pages/verify-email-change/VerifyEmailChangePage.test.tsx src/pages/login/TwoFactorLoginPage.test.tsx src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx
  git commit -m "feat: redesign public entry and auth routes"
  ```

## Task 5: Rebuild Authenticated Workspaces And Remove Settings Tabs

**Files:**
- Modify: `src/pages/profile/ProfilePage.tsx`
- Modify: `src/pages/settings/AccountSettingsPage.tsx`
- Modify: `src/pages/settings/SecuritySettingsPage.tsx`
- Modify: `src/pages/settings/TelegramSettingsPage.tsx`
- Delete: `src/pages/settings/SettingsTabs.tsx`
- Modify: `src/pages/profile/ProfilePage.test.tsx`
- Modify: `src/features/profile/components/AccountSettingsSection.test.tsx`
- Modify: `src/features/passkeys/components/PasskeySection.test.tsx`
- Modify: `src/features/two-factor/components/TwoFactorSection.test.tsx`
- Modify: `src/features/telegram/components/TelegramSettingsSection.test.tsx`
- Modify: `src/app/router.test.tsx`
- Modify: `src/app/app.css`

- [ ] Step 1: Extend failing tests to protect the contract-preserving cores while the authenticated framing changes.
  Example additions:
  ```tsx
  expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Account' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Passkeys' })).toBeTruthy();
  ```
- [ ] Step 2: Run `npm test -- src/pages/profile/ProfilePage.test.tsx src/features/profile/components/AccountSettingsSection.test.tsx src/features/passkeys/components/PasskeySection.test.tsx src/features/two-factor/components/TwoFactorSection.test.tsx src/features/telegram/components/TelegramSettingsSection.test.tsx src/app/router.test.tsx` and confirm the behavior safety net is active before removing tabs.
- [ ] Step 3: Rebuild `ProfilePage.tsx` as the identity overview workspace and keep it visually distinct from `AccountSettingsPage.tsx`, which should read as the editable account-management workspace.
- [ ] Step 4: Rebuild `AccountSettingsPage.tsx`, `SecuritySettingsPage.tsx`, and `TelegramSettingsPage.tsx` so they share the workspace system, use support rails only where they add real value, and no longer depend on `SettingsTabs`.
- [ ] Step 5: Remove `src/pages/settings/SettingsTabs.tsx` and any imports/usages once the sidebar fully carries the same settings-route semantics.
- [ ] Step 6: Fold any route-specific layout updates back into `src/app/app.css` so the workspace treatment stays consistent across authenticated pages.
- [ ] Step 7: Re-run the authenticated test set and fix regressions without changing backend-facing feature logic.
- [ ] Step 8: Commit the authenticated workspace redesign.
  ```bash
  git add src/pages/profile/ProfilePage.tsx src/pages/settings/AccountSettingsPage.tsx src/pages/settings/SecuritySettingsPage.tsx src/pages/settings/TelegramSettingsPage.tsx src/pages/profile/ProfilePage.test.tsx src/features/profile/components/AccountSettingsSection.test.tsx src/features/passkeys/components/PasskeySection.test.tsx src/features/two-factor/components/TwoFactorSection.test.tsx src/features/telegram/components/TelegramSettingsSection.test.tsx src/app/router.test.tsx src/app/app.css
  git rm src/pages/settings/SettingsTabs.tsx
  git commit -m "feat: redesign authenticated workspaces"
  ```

## Task 6: Final Verification, Responsive Polish, And Local Playwright QA

**Files:**
- Modify: `src/app/app.css`
- Modify: `src/app/layout/PublicShell.tsx`
- Modify: `src/app/layout/AppShell.tsx`
- Modify: `src/shared/ui/AuthPageShell.tsx`
- Modify: `src/shared/ui/PageHeader.tsx`
- Modify: any route/page file found during QA to require small polish-only fixes

- [ ] Step 1: Audit loading, success, error, and empty states across public and authenticated routes so they feel like one product with two densities rather than mixed legacy surfaces.
- [ ] Step 2: Verify support rails remain optional and remove any support rail that does not add meaningful value.
- [ ] Step 3: Run the full automated suite needed for signoff:
  ```bash
  npm test -- src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx src/features/auth/components/LoginForm.test.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/pages/verify-email-change/VerifyEmailChangePage.test.tsx src/pages/login/TwoFactorLoginPage.test.tsx src/pages/profile/ProfilePage.test.tsx src/features/profile/components/AccountSettingsSection.test.tsx src/features/passkeys/components/PasskeySection.test.tsx src/features/two-factor/components/TwoFactorSection.test.tsx src/features/telegram/components/TelegramSettingsSection.test.tsx
  npm run lint
  npm run typecheck
  npm run build
  ```
- [ ] Step 4: Start the frontend dev server with the local backend already running and use [$playwright-interactive](/Users/topilov/.codex/skills/playwright-interactive/SKILL.md) for a QA inventory covering:
  - `/` public entry
  - `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-email-change`, `/login/2fa`
  - `/profile`, `/settings/account`, `/settings/security`, `/settings/telegram`
  - sign in with `demo` / `demo-password`
  - sign out back to the public shell
  - mobile (`390px`), tablet (`768px`), and desktop (`1280px+`) viewport fit
- [ ] Step 5: During Playwright QA, explicitly confirm:
  - the public shell feels calm and product-real, not like a landing page
  - the authenticated shell feels like a personal tool space, not a dashboard
  - the shift between shells feels smooth
  - sidebar navigation preserves `Profile` versus `Account` role clarity
  - no backend contract behavior changed during the visual refactor
- [ ] Step 6: Fix any issues discovered, rerun the affected automated checks, and repeat QA until clean.
- [ ] Step 7: Commit the final polish pass.
  ```bash
  git add src/app/app.css src/app/layout/PublicShell.tsx src/app/layout/AppShell.tsx src/shared/ui/AuthPageShell.tsx src/shared/ui/PageHeader.tsx src/pages/home/HomePage.tsx src/pages/login/LoginPage.tsx src/pages/register/RegisterPage.tsx src/pages/forgot-password/ForgotPasswordPage.tsx src/pages/reset-password/ResetPasswordPage.tsx src/pages/verify-email/VerifyEmailPage.tsx src/pages/verify-email-change/VerifyEmailChangePage.tsx src/pages/login/TwoFactorLoginPage.tsx src/pages/not-found/NotFoundPage.tsx src/pages/profile/ProfilePage.tsx src/pages/settings/AccountSettingsPage.tsx src/pages/settings/SecuritySettingsPage.tsx src/pages/settings/TelegramSettingsPage.tsx src/app/router.tsx src/app/router.test.tsx src/pages/AnonymousEntryRoutes.test.tsx src/features/auth/components/LoginForm.test.tsx src/pages/verify-email/VerifyEmailPage.test.tsx src/pages/verify-email-change/VerifyEmailChangePage.test.tsx src/pages/login/TwoFactorLoginPage.test.tsx src/pages/profile/ProfilePage.test.tsx src/features/profile/components/AccountSettingsSection.test.tsx src/features/passkeys/components/PasskeySection.test.tsx src/features/two-factor/components/TwoFactorSection.test.tsx src/features/telegram/components/TelegramSettingsSection.test.tsx
  git commit -m "feat: finish soft threshold ui redesign"
  ```
