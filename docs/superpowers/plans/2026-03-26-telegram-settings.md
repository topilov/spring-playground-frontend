# Telegram Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/settings/telegram` page where authenticated users can connect Telegram, edit focus emoji settings, manage their automation token, and inspect current Telegram/focus state from backend-owned data.

**Architecture:** Regenerate OpenAPI-backed types first, then add a dedicated `features/telegram` module with handwritten API transport, DTO mappers, and React Query hooks. Keep the route page thin, compose four focused section components, and drive the connection flow from backend `connected` and `pendingAuth.nextStep` state rather than client-derived routing.

**Tech Stack:** React 19, React Router 7, TanStack Query 5, React Hook Form 7, Zod 4, Vitest, handwritten fetch API client, generated OpenAPI types

---

### Task 1: Refresh The Telegram API Contract

**Files:**
- Modify: `src/shared/api/generated/schema.d.ts`
- Check: `scripts/generate-openapi-types.mjs`

- [ ] **Step 1: Regenerate the generated schema from the backend-owned OpenAPI**

Run: `npm run openapi:generate`
Expected: `src/shared/api/generated/schema.d.ts` now includes `/api/profile/me/telegram*` paths and Telegram schema types.

- [ ] **Step 2: Inspect the generated diff for Telegram paths and payload fields**

Run: `rg -n "telegram|Telegram" src/shared/api/generated/schema.d.ts`
Expected: matches for Telegram settings, connect, focus-settings, and automation-token endpoints.

- [ ] **Step 3: Stop and fix the contract source if Telegram endpoints are still missing**

Check: ensure the schema URL env points at the latest backend contract before writing feature code.

### Task 2: Add Telegram Model And Error Helpers

**Files:**
- Create: `src/features/telegram/model.ts`
- Create: `src/features/telegram/errors.ts`
- Test: `src/features/telegram/api.test.ts`

- [ ] **Step 1: Write failing API tests for Telegram settings mapping and request payload shaping**

Add tests that assert:
- `GET /api/profile/me/telegram` maps connected, pending auth, automation token, resolved mappings, and active focus modes
- focus-settings updates send trimmed values
- connect start/code/password endpoints send the expected JSON payloads
- token create/regenerate/revoke and disconnect hit the correct endpoints

- [ ] **Step 2: Run the Telegram API test file and confirm failure**

Run: `npm test -- src/features/telegram/api.test.ts`
Expected: FAIL because the Telegram feature exports do not exist yet.

- [ ] **Step 3: Add Telegram DTO types and mapper helpers in `model.ts`**

Implement:
- focus-mode union aligned with the generated contract
- frontend-facing types for settings, pending auth, telegram user, automation token summary, and raw token result
- request helpers for connect start/code/password and focus-settings update
- light normalization for optional strings and empty mapping values

- [ ] **Step 4: Add Telegram-specific error-code helpers in `errors.ts`**

Implement small helpers that map known backend codes to short user-facing strings while falling back to shared API error behavior.

- [ ] **Step 5: Re-run the Telegram API test file and confirm it now passes**

Run: `npm test -- src/features/telegram/api.test.ts`
Expected: PASS.

### Task 3: Add Handwritten Telegram API Transport And Query Hooks

**Files:**
- Create: `src/features/telegram/api.ts`
- Create: `src/features/telegram/hooks.ts`
- Modify: `src/features/telegram/api.test.ts`

- [ ] **Step 1: Extend failing tests to cover each Telegram API function**

Add assertions for:
- `getTelegramSettings`
- `startTelegramConnection`
- `confirmTelegramCode`
- `confirmTelegramPassword`
- `disconnectTelegram`
- `updateTelegramFocusSettings`
- `createTelegramAutomationToken`
- `regenerateTelegramAutomationToken`
- `revokeTelegramAutomationToken`

- [ ] **Step 2: Run the Telegram API test file and verify the new expectations fail**

Run: `npm test -- src/features/telegram/api.test.ts`
Expected: FAIL on missing functions or incorrect request details.

- [ ] **Step 3: Implement the handwritten API layer**

Use `request(...)` to call the exact contract paths, map responses through `model.ts`, and return void for `204` disconnect/token-revoke flows.

- [ ] **Step 4: Implement React Query hooks**

Add:
- `telegramSettingsQueryKey`
- `useTelegramSettingsQuery`
- one mutation hook per write endpoint

All write hooks should invalidate `telegramSettingsQueryKey` on success.

- [ ] **Step 5: Re-run the Telegram API tests**

Run: `npm test -- src/features/telegram/api.test.ts`
Expected: PASS.

### Task 4: Add The Telegram Settings Route And Navigation

**Files:**
- Modify: `src/shared/routing/paths.ts`
- Modify: `src/pages/settings/SettingsTabs.tsx`
- Create: `src/pages/settings/TelegramSettingsPage.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/app/router.test.tsx`

- [ ] **Step 1: Write failing router tests for the new Telegram settings route and tab**

Cover:
- `/settings/telegram` renders for authenticated users
- settings tabs now include `Telegram`
- route path constant resolves to `/settings/telegram`

- [ ] **Step 2: Run the router tests and confirm failure**

Run: `npm test -- src/app/router.test.tsx`
Expected: FAIL because the route and tab do not exist yet.

- [ ] **Step 3: Add the route constant, tab entry, page shell, and router wiring**

Keep the page shell consistent with the current settings layout and reserve the right column for a compact utility-focused sidebar.

- [ ] **Step 4: Re-run the router tests**

Run: `npm test -- src/app/router.test.tsx`
Expected: PASS.

### Task 5: Build The Telegram Settings UI Sections

**Files:**
- Create: `src/features/telegram/components/TelegramSettingsSection.tsx`
- Create: `src/features/telegram/components/TelegramConnectionSection.tsx`
- Create: `src/features/telegram/components/TelegramFocusSettingsSection.tsx`
- Create: `src/features/telegram/components/TelegramAutomationTokenSection.tsx`
- Create: `src/features/telegram/components/TelegramCurrentStateSection.tsx`
- Create: `src/features/telegram/components/TelegramSettingsSection.test.tsx`
- Modify: `src/pages/settings/TelegramSettingsPage.tsx`
- Modify: `src/app/app.css`

- [ ] **Step 1: Write a failing section test for the disconnected connection state**

Cover:
- phone number form is shown
- submit calls connect-start mutation with a trimmed phone number
- a successful response moves the UI into the pending-code state

- [ ] **Step 2: Run the Telegram section tests and confirm failure**

Run: `npm test -- src/features/telegram/components/TelegramSettingsSection.test.tsx`
Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement the composed Telegram settings section with the disconnected and pending-code states**

Keep the page read source on `useTelegramSettingsQuery`, use local state only for transient input values, and render clean loading/error/empty treatment.

- [ ] **Step 4: Add a failing test for the pending-password and connected account states**

Cover:
- password step appears when `nextStep` is `PASSWORD`
- connected state shows Telegram user summary and disconnect action

- [ ] **Step 5: Run the Telegram section tests and confirm failure**

Run: `npm test -- src/features/telegram/components/TelegramSettingsSection.test.tsx`
Expected: FAIL on missing behavior.

- [ ] **Step 6: Implement the rest of the connection flow UI**

Drive the step from backend `pendingAuth.nextStep`, keep disconnect separate, and keep messages short and practical.

- [ ] **Step 7: Add a failing test for focus-settings editing and save**

Cover:
- fields initialize from `defaultEmojiStatusDocumentId` and `resolvedEmojiMappings`
- save submits trimmed values
- no override/default source label is rendered

- [ ] **Step 8: Run the Telegram section tests and confirm failure**

Run: `npm test -- src/features/telegram/components/TelegramSettingsSection.test.tsx`
Expected: FAIL on focus-settings behavior.

- [ ] **Step 9: Implement the focus-settings section**

Keep validation light, allow empty values, and use query-refetched state after save.

- [ ] **Step 10: Add a failing test for token create/regenerate/revoke and one-time raw token display**

Cover:
- create button when token is missing
- regenerate/revoke buttons when token exists
- raw token appears only after create/regenerate success
- copy interaction works while visible

- [ ] **Step 11: Run the Telegram section tests and confirm failure**

Run: `npm test -- src/features/telegram/components/TelegramSettingsSection.test.tsx`
Expected: FAIL on token UX.

- [ ] **Step 12: Implement the automation-token section**

Keep the raw token in transient local state only and show a concise “shown once” note.

- [ ] **Step 13: Add a failing test for current-state rendering**

Cover:
- active focus modes
- effective focus mode
- applied emoji document id
- non-premium warning

- [ ] **Step 14: Run the Telegram section tests and confirm failure**

Run: `npm test -- src/features/telegram/components/TelegramSettingsSection.test.tsx`
Expected: FAIL on current-state rendering.

- [ ] **Step 15: Implement the read-only current-state section and page polish**

Add small, utility-focused sidebar copy and any required CSS for spacing and scanability.

- [ ] **Step 16: Re-run the Telegram section tests**

Run: `npm test -- src/features/telegram/components/TelegramSettingsSection.test.tsx`
Expected: PASS.

### Task 6: Final Verification

**Files:**
- Modify as needed from previous tasks

- [ ] **Step 1: Run the targeted Telegram and routing tests together**

Run: `npm test -- src/features/telegram/api.test.ts src/features/telegram/components/TelegramSettingsSection.test.tsx src/app/router.test.tsx`
Expected: PASS.

- [ ] **Step 2: Run full type checking**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: PASS.
