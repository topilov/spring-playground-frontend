# Soft Threshold UI Redesign

**Date:** 2026-03-27

## Goal

Redesign the frontend so the product reads as one calm, precise system with two operating states:

- public routes feel minimal, editorial, and product-real
- authenticated routes feel tighter, faster, and utility-driven

The redesign must preserve all existing backend-facing behavior. This is a presentation-layer refactor built through shells, layout primitives, styling, and route composition, not a rewrite of feature logic or API transport.

## Design Summary

### Visual Thesis

`Spring Playground` should feel like a warm, light, Apple-leaning product surface:

- soft white and warm neutral backgrounds
- graphite text with clear hierarchy
- one restrained accent color used for action, focus, and active navigation
- typography, spacing, and alignment doing most of the visual work
- subtle tonal shifts and layering instead of card stacks and border-heavy framing

The result should feel calm, exact, and cohesive rather than marketing-heavy or dashboard-heavy.

### Product Thesis

The experience should cross a soft threshold:

- outside the app: orientation, trust, and quick understanding
- inside the app: operation, focus, and low-friction task completion

The transition between those states should feel natural because both shells share the same design language, top bar, spacing discipline, and motion behavior.

### Interaction Thesis

Motion should remain minimal and useful:

- a short page-entry reveal for shell and major content groups
- subtle hover and focus transitions on navigation and actions
- crisp state changes for the sidebar, buttons, and interactive lists

Motion should never become decorative enough to compete with the product’s quiet tone.

## Current Constraints

- This repository is a frontend API consumer only.
- Backend contract is the source of truth for request/response shape and auth behavior.
- The handwritten transport and feature modules already encode contract-sensitive behavior for auth, passkeys, two-factor, profile, and Telegram.
- The redesign should preserve those feature modules as the contract-preserving core and wrap them in new shells and layout primitives.
- Anonymous and authenticated routes currently use the same top-level app layout but do not yet express the intended outside-versus-inside product shift.

## Contract-Safety Boundaries

The following areas are explicitly in scope for redesign:

- top-level shell structure
- route composition and page framing
- layout primitives and shared presentation components
- typography, spacing, color tokens, surface treatment, and motion
- navigation presentation, including replacing settings tabs with sidebar navigation

The following areas are explicitly out of scope for redesign:

- changing API request or response shapes
- changing auth, session, passkey, two-factor, or Telegram behavior
- rewriting handwritten transport in `src/shared/api` or feature `api.ts` files
- inventing new backend semantics in the UI
- changing route meaning or access rules

Implementation guardrails:

- `features/auth`, `features/passkeys`, `features/two-factor`, `features/profile`, and `features/telegram` remain the contract-preserving core
- UI refactors should prefer composition around those modules over editing their behavioral logic
- if a contract-sensitive flow needs a visual change, it should happen in wrappers, page structure, labels, spacing, or composition first
- any behavioral change discovered during implementation should be treated as a separate decision and not folded into the redesign by default

## UX Architecture

### Shared Language

The product should use one design system with two densities:

- `PublicShell`: more air, larger type, slower rhythm
- `AppShell`: tighter spacing, more compact structure, stronger operational scanning

Both shells share:

- the same top bar concept
- the same light palette and accent behavior
- the same type hierarchy
- the same input, button, and status styling language

This preserves continuity while still making authenticated usage feel meaningfully more focused.

### Public Shell

Anonymous routes should use a dedicated `PublicShell`.

Responsibilities:

- persistent compact top bar
- a true home page at `/` for anonymous users
- calm editorial framing for login, register, forgot/reset password, and verification flows
- direct, low-friction entry into sign-in or account creation

The shell should avoid landing-page patterns such as:

- oversized marketing hero treatment
- feature-grid sections
- social-proof blocks
- large card stacks
- decorative illustration panels with no product value

Instead, public routes should communicate:

- what the product is
- what it helps manage
- where to go next

### App Shell

Authenticated routes should use a dedicated `AppShell`.

Responsibilities:

- reuse the compact top bar from the public shell
- introduce a lightweight sidebar only in authenticated areas
- provide a stable tool-space frame for `Profile`, `Security`, and `Telegram`
- keep the main workspace dominant and the sidebar visually quiet

The app shell should not resemble an enterprise admin dashboard. The sidebar exists to provide structure, not to add chrome.

Sidebar behavior:

- always visible on larger authenticated viewports
- collapses into a simpler navigation treatment on smaller screens
- uses quiet active-state styling rather than heavy pills or dark panels
- presents the same primary information architecture currently expressed through protected routes
- should expose `Profile`, `Account`, `Security`, and `Telegram` as the persistent authenticated navigation set on authenticated pages, even when the current page only uses a subset of that space as its local workspace

## Route Strategy

### Home Route

`/` should stop redirecting anonymous users immediately.

Anonymous behavior:

- render a public entry page with a short product explanation
- communicate key capabilities with restraint:
  - account identity and profile workspace
  - passkeys
  - two-factor authentication
  - Telegram integration
- provide direct paths to sign in and create an account

Authenticated behavior:

- continue redirecting into the product workspace
- default destination can remain `/profile` unless implementation uncovers a stronger existing route expectation

### Public Auth Routes

The following routes remain behaviorally intact but gain a shared editorial shell:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/verify-email-change`
- `/login/2fa`

These routes should reuse shared public-facing layout structure rather than each inventing separate composition.

### Authenticated Workspace Routes

The core authenticated routes remain:

- `/profile`
- `/settings/account`
- `/settings/security`
- `/settings/telegram`

Their meaning and access rules stay unchanged. The redesign should change how those routes are framed and navigated, not what they represent.

Important navigation constraint:

- replacing settings tabs with the sidebar must not change the underlying information architecture semantics
- `Account`, `Security`, and `Telegram` remain peer navigable destinations
- the change is presentational navigation consolidation, not route-model redefinition

## Layout Model

### Public Layout

Public pages should follow a restrained, reusable composition:

1. top bar
2. intro plane with title, short context, and optional trust/status note
3. action or form rail
4. minimal secondary navigation or recovery links

On the home page, that structure becomes a calm product entry instead of a form wrapper.

On auth flows, the same system should adapt without duplicating logic between the home page and auth pages.

### Workspace Layout

Authenticated pages should adopt a focused workspace structure:

1. workspace header
2. short operational context
3. main content rail
4. optional support rail when there is useful guidance or read-only context

The layout should feel like a personal tool space rather than a dashboard:

- the main working column stays visually dominant
- support content remains quieter and narrower
- heavy panelization is avoided

For authenticated navigation semantics:

- `Profile` remains the primary identity overview workspace
- `Account`, `Security`, and `Telegram` remain peer settings destinations
- the sidebar should make those relationships clearer without redefining them

## Shared Primitives

Introduce a small set of reusable layout primitives rather than many new UI components.

Expected primitives:

- `PublicShell`
- `AppShell`
- `HeroIntro` or equivalent public intro primitive
- `WorkspaceHeader`
- `ContentRail`
- `SupportRail`
- authenticated sidebar navigation component

Guidelines:

- keep these primitives structural and presentation-focused
- avoid moving business logic into them
- prefer adapting `AuthPageShell`, `PageHeader`, and the top-level layout over creating parallel abstractions when possible
- retire `SettingsTabs` once the sidebar fully covers its navigation role

## Component Adaptation Strategy

### Existing Shared Components

Likely adaptation targets:

- `src/app/layout/AppLayout.tsx`
- `src/shared/ui/AuthPageShell.tsx`
- `src/shared/ui/PageHeader.tsx`

Preferred direction:

- split or evolve the current top-level layout into `PublicShell` and `AppShell`
- rework `AuthPageShell` so it can support the calmer public framing without behaving like a centered auth card
- strengthen `PageHeader` into a proper workspace header primitive for authenticated pages

### Feature Modules

These should remain behavior-first and mostly intact:

- `src/features/auth/*`
- `src/features/passkeys/*`
- `src/features/two-factor/*`
- `src/features/profile/*`
- `src/features/telegram/*`

These modules may receive light markup or class updates when needed for the new layout system, but the redesign should not use them as the main place to reshape behavior.

## Visual System

### Palette

Use a bright, warm light theme only:

- warm white and pale neutral backgrounds
- graphite and muted graphite text hierarchy
- one restrained accent color in a cool blue family
- very soft dividers and fills for state separation

Avoid:

- dark mode styling
- high-contrast marketing gradients
- saturated multi-accent systems
- visible “card on card” stacking

### Typography

Typography should carry much of the product’s identity:

- slightly more editorial heading treatment on public pages
- highly readable, compact body and UI text for authenticated routes
- clear rhythm differences between public and authenticated modes without introducing separate brands

Headings should feel deliberate and product-oriented, not promotional.

### Surface Treatment

Prefer:

- spacing and alignment
- hairline separators only where needed
- subtle depth through tone and blur
- low-contrast grouping instead of boxed cards

Avoid:

- frequent card containers
- thick borders
- heavy shadows as a primary organizational tool

## Page Intent

### Public Entry

The home page should explain the product quietly:

- a short, clear description
- restrained capability context
- immediate next actions

It should not read like a sales page.

### Login And Register

These pages should feel like part of the same product entry system:

- clear titles
- calm guidance
- form-first composition
- operational support copy, not marketing copy

### Recovery And Verification

Forgot/reset password and verification routes should stay visually consistent with login and register:

- same shell language
- stronger emphasis on state and next step
- no alternate visual system for one-off flows

### Profile

Profile should read as an identity workspace:

- key identity information in the main rail
- actions close to the workspace header
- support rail used only for truly secondary context

### Account

Account should remain a focused settings workspace for editable identity details:

- account-editing controls stay in the main rail
- route-level context should clarify the distinction between immediate username changes and verification-backed email changes
- support content should stay secondary and operational rather than explanatory filler

### Security

Security should remain an operational settings workspace:

- passkeys, password changes, and two-factor remain the primary content
- structure should emphasize scanning and action clarity
- support guidance remains present but quieter than the main content

### Telegram

Telegram should continue to feel like a distinct integration workspace:

- connection and settings stay in the main flow
- supporting integration notes can remain in a quieter side rail
- structure should match the same workspace system as profile and security

## Responsive Behavior

The redesign should behave as one responsive system rather than separate desktop/mobile designs.

Rules:

- public layouts collapse cleanly while preserving calm spacing and hierarchy
- authenticated sidebar becomes less persistent on smaller widths without losing navigation clarity
- workspace headers and action groups remain readable and tappable
- support rails should stack beneath the main content where space is constrained
- the top bar should remain compact and stable at all widths

## Verification Expectations

Verification must prove both contract safety and intended product feel as separate outcomes.

### Route And Shell Verification

Required checks:

- anonymous users see a real public home page at `/`
- authenticated users are still routed into the product workspace
- protected routes still require authentication
- anonymous-only routes still reject authenticated access appropriately
- sidebar navigation correctly presents `Profile`, `Account`, `Security`, and `Telegram` destinations where relevant
- `/settings/account`, `/settings/security`, and `/settings/telegram` still resolve as the same peer settings destinations after tabs are removed
- removing settings tabs does not change route destinations or route meaning

### Contract-Safety Verification

Required checks:

- login flow still submits the same backend-owned credentials and handles backend errors correctly
- passkey sign-in still follows the existing protected login flow and local captcha behavior
- two-factor flow still honors challenge storage and redirect behavior
- password recovery and verification flows keep their existing request semantics
- profile refresh, security mutations, and Telegram settings interactions still use current feature modules and transport

Signals of failure:

- any UI change that forces request-shape edits
- duplicated or reimplemented backend state logic in the UI
- feature logic drifting out of existing modules into shell primitives

Automated coverage expectation:

- route and layout regressions should be covered through the existing router and component test pattern where practical
- manual QA supplements this coverage for visual-system goals and shell feel, but should not be the only verification for route presentation changes

## Manual QA Scope

Manual QA should use the local backend already running on `http://127.0.0.1:8080` and frontend local mode with:

- `VITE_AUTH_CAPTCHA_REQUIRED=false`
- demo login `demo`
- demo password `demo-password`

Manual checks should include:

- public entry at `/`
- sign-in flow with password
- sign-in flow with passkey entry affordance if locally testable
- post-login navigation through profile, security, and Telegram
- sign-out and return to public mode
- verification that the outside-to-inside shift feels smooth rather than abrupt

### Exploratory Visual QA

In addition to scripted checks, perform an exploratory visual pass focused on:

- whether the public side feels calm and product-real rather than like a landing page
- whether the authenticated side feels like a personal tool space rather than a dashboard
- whether the sidebar stays visually quiet
- whether spacing, typography, and alignment are doing more work than surfaces or borders
- whether any area feels unexpectedly card-heavy or ornamental
- whether the two operating states feel like one cohesive product

Viewport pass:

- mobile around `390px`
- tablet around `768px`
- desktop around `1280px` or wider

## Out Of Scope

- backend contract changes
- feature additions unrelated to presentation and navigation
- API client rewrites
- introducing new business logic into shells or layout primitives
- changing route semantics while replacing settings tabs with sidebar navigation
- shipping a dark theme as part of this redesign
