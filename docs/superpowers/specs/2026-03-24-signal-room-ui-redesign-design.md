# Signal Room UI Redesign

Date: 2026-03-24

## Goal

Redesign the entire frontend UI so the product feels like a premium operator console rather than a set of lightweight form pages. The experience should remain coherent across anonymous and authenticated routes, with sign-in, registration, profile, and security all reading as one system.

The redesign must preserve existing frontend behavior and backend contract usage. This is a visual and structural rewrite of the interface layer, not a change to request or response shapes.

## Design Summary

### Visual Thesis

`Signal Room` is a quiet control surface for identity and access:

- graphite and near-black base surfaces
- pale ink text with clear information tiers
- one mint accent reserved for primary action, active state, and key status
- generous spacing, strong typography, minimal chrome

The app should feel calm, high-trust, and deliberate instead of dense or decorative.

### Content Plan

Each route follows the same high-level rhythm:

1. Primary workspace or page intro
2. Secondary context rail or emphasis zone
3. Core details or form flow
4. One clear next action

There should be no generic dashboard card mosaic, no center-column auth card, and no split between “marketing-style” anonymous pages and “app-style” authenticated pages.

### Interaction Thesis

Motion should be restrained and systemic:

- short route-entry reveal for shell, heading, and content plane
- slight depth and surface shift on hover/focus for key interactive elements
- consistent active-state treatment in navigation and primary actions

Motion must remain smooth on mobile and should be removable without harming comprehension.

## Current Constraints

- The repository is a frontend API consumer only.
- Existing route behavior, auth gating, and handwritten API layers must remain intact.
- The redesign should build from the current shared shell and page components rather than introducing unnecessary parallel abstractions.
- The app surface is compact today: login, register, forgot/reset password, verify email, profile, and security/passkeys.

## Proposed UX Architecture

### Shared Shell

The shared shell becomes the main product anchor:

- a persistent top header integrated into the page surface
- brand at the left, compact session or context indicator near the center when relevant
- minimal route navigation and one utility action on the right
- no sidebar at current scope

The shell should feel embedded into the surface, not like a separate toolbar placed on top of the page.

For action clarity:

- on anonymous routes, the right-side utility action should be a route-appropriate account transition such as `Create account` or `Back to sign in`
- on authenticated routes, the right-side utility action should remain account-oriented, with `Sign out` as the default
- route switching should stay in the minimal navigation group rather than competing with the utility action

### Anonymous Routes

Anonymous routes use the same environment as the signed-in app.

Login, registration, forgot-password, reset-password, and verify-email move from centered-card treatment to a two-zone composition:

- left intro plane for route title, one-line guidance, and trust or status note
- right form plane for fields, actions, and inline feedback

On mobile, the layout collapses to one column while preserving the same hierarchy and emphasis.

### Authenticated Routes

Authenticated routes should feel like a measured control workspace:

- strong page title and identity/status line at the top
- actions grouped tightly and intentionally
- details shown as aligned rows, grouped definition lists, or content bands instead of stacked cards
- one secondary emphasis zone for guidance, posture, or next action

Profile becomes an identity workspace. Security becomes the access-management equivalent, using the same geometry and spacing system.

## Component and Styling Strategy

### Token System

Rework the global design tokens in `src/app/app.css` around:

- graphite background layers
- pale text hierarchy
- mint accent and accent-soft variants
- clearer spacing steps
- tighter, consistent radius choices
- lighter dependence on shadows

The page should still feel premium if shadows are removed.

### Shared Components

The redesign should primarily adapt these existing seams:

- `src/app/layout/AppLayout.tsx`
- `src/shared/ui/AuthPageShell.tsx`
- `src/shared/ui/PageHeader.tsx`

Likely outcomes:

- `AppLayout` owns the new shell, navigation treatment, and top-level spacing
- `AuthPageShell` shifts from single-card layout to the approved two-zone operator entry pattern
- `PageHeader` becomes a stronger workspace heading primitive with better support for compact context and actions

Any additional shared layout primitives should be small and clearly named. Avoid creating a large parallel design system for this scope.

### Forms and Detail Surfaces

Auth forms keep their current functionality and validation flow but should visually become:

- vertically structured field sequences
- stronger labels and grouping
- subtler borders
- clearer inline error and success states

Profile and security surfaces should move from page cards to content bands with dividers, aligned metadata, and emphasized actions only where needed.

## Route-Level Intent

### Login and Register

- same operator environment as the signed-in app
- strong title and route framing
- form plane is the focus, not decorative panels
- supporting copy stays brief and operational

### Forgot Password and Reset Password

- same composition as login/register
- status messaging is prominent but calm
- route differences come from copy and workflow state, not alternate visual systems

### Verify Email

- use the same shell and entry-plane structure
- focus on confirmation status and next action

### Profile

- promote identity information into a spacious workspace layout
- reduce box treatment
- surface only the most useful actions near the heading

### Security

- mirror the profile structure to maintain system consistency
- emphasize passkey posture and sign-in method management
- keep passkey actions explicit and easy to scan

## Data Flow and Behavior

This redesign does not change:

- route definitions
- auth gating behavior
- API request or response handling
- generated schema usage
- passkey feature behavior

Any UI restructuring must continue to work with the current data-loading and mutation flows.

## States and Feedback

Loading, success, empty, and error states should inherit the same visual language as the rest of the shell:

- no bolted-on banners when a more integrated status block fits the layout
- preserve accessibility semantics such as `role="alert"`
- make retry and recovery actions clear but not noisy

The loading experience should feel like part of the console rather than a placeholder card.

## Responsive Behavior

Desktop should feel poster-like and spacious without becoming sparse. Mobile should preserve sequence and emphasis without introducing separate layouts or hiding important context.

Key rules:

- top shell remains compact
- auth two-zone layouts collapse to one column
- content bands and detail rows stack cleanly
- action groups remain thumb-friendly and readable

## Verification Plan

Implementation should be verified with:

- existing test suite for routing, auth, and passkey behavior
- a targeted responsive manual pass across login, register, profile, and security at mobile (~390px), tablet (~768px), and desktop (~1280px) widths
- a visual check that anonymous and authenticated routes now feel like one system

No implementation should claim completion without confirming the UI still respects current route and auth behavior.

## Out of Scope

- backend contract changes
- API client rewrites
- new feature development unrelated to the redesign
- adding a sidebar or broader information architecture not required by current routes
- introducing a full animation library unless the implementation clearly benefits and the dependency choice is justified
