# Frontend Repository Review

## Executive Summary

The repository started from a clean but fragile early-stage baseline. It worked for a small demo flow, but the core app boundaries were not ready to scale: routing was custom and stateful, forms were handwritten, session state was duplicated, and page components directly carried orchestration concerns that should have lived in feature or app layers.

This modernization pass moved the repository to a stronger production baseline without turning it into an overengineered framework shell.

## Key Findings

### 1. Routing structure was too weak for protected/auth-only flows

Before this pass, route selection was a manual `switch` over `window.location.pathname` plus a custom history helper. That made protected route behavior, redirects, 404 handling, and route growth all harder than they needed to be.

Risk:

- auth redirects had to be hand-managed in pages
- route ownership lived in `App.tsx`
- no strong place for route guards or future nested layouts

Applied fix:

- introduced `react-router-dom`
- added a central route table in `src/app/router.tsx`
- added `ProtectedRoute` and `AnonymousOnlyRoute`
- added a real not-found page and a shared app layout

### 2. Server state and auth session state were managed too locally

The previous auth provider mixed boot-time session loading, mutation orchestration, error translation, and page-facing state in one context provider. Pages also owned refresh and error behavior ad hoc.

Risk:

- duplicated loading logic
- weaker cache behavior after login/logout
- hard to add more backend-backed views consistently

Applied fix:

- introduced TanStack Query as the server-state layer
- moved session loading into a query-backed `useAuthSession`
- centralized auth mutations in `src/features/auth/mutations.ts`
- added stable query keys and mutation-driven cache refresh behavior
- added a reusable public query example with `usePublicPing`

### 3. Forms were entirely handwritten

Login, register, and forgot-password all used manual `useState`, manual change handlers, and per-page submit wiring.

Risk:

- pages doing too much
- inconsistent validation behavior
- hard to scale to more form-heavy features

Applied fix:

- introduced React Hook Form and Zod
- moved form validation into `src/features/auth/forms.ts`
- moved submission wiring into dedicated auth form components
- kept route pages mostly declarative and content-focused

### 4. Raw generated schema usage was leaking upward

Entity models were mostly aliases of generated OpenAPI schema types. That is convenient initially, but it couples UI-facing code to backend-generated internals and leaves no stable place for DTO translation.

Risk:

- generated-schema internals spread across the app
- harder future refactors if backend contract shape changes
- UI code tied too closely to transport types

Applied fix:

- added route-aware contract helpers in `src/shared/api/contract.ts`
- converted entity model files into app-owned types plus mapper helpers
- kept transport handwritten in feature API modules

### 5. Auth-related UX needed stronger boundaries

Before the refactor, pages themselves decided whether to show login, profile, or redirect behavior. Anonymous and broken-session states were not clearly separated at route boundaries.

Risk:

- inconsistent protected-page behavior
- awkward already-authenticated handling on auth pages
- weaker future support for intended-route redirects

Applied fix:

- auth-only routes now redirect authenticated users to profile
- protected routes now redirect anonymous users to login
- login redirects to the intended app route when available
- missing-profile and generic session-failure states now remain distinguishable

## Applied Improvements Summary

- Replaced the custom router/navigation layer with React Router.
- Introduced TanStack Query for session and reachability data.
- Introduced React Hook Form + Zod for auth-related forms.
- Added stable route constants and route guards.
- Split app shell, route definitions, feature mutations, form schemas, and form components into clearer ownership layers.
- Added targeted tests for session-state mapping and route-guard behavior.
- Preserved the contract-first rule: generated OpenAPI types still exist, while the handwritten API layer remains explicit.

## What I Intentionally Did Not Overbuild

- I did not generate a full runtime client from OpenAPI. The repo instructions explicitly prefer handwritten transport with generated types.
- I did not add a global state manager. TanStack Query is sufficient for the current server-state needs.
- I did not add a large design-system abstraction. The repo is still early enough that local UI composition is more maintainable.
- I did not expand the feature set with unrelated workflows just to justify the architecture.

## Recommended Next Steps

1. Add the profile edit flow using the same RHF + Zod + TanStack Query mutation pattern now established for auth flows.
2. Add a shared error-presenter utility for page-level server failures if more server-backed views are introduced.
3. Introduce route-level lazy loading once the page surface area grows beyond the current small set.
4. Keep generated OpenAPI types refreshed whenever backend contract work lands, then update mapper functions before touching UI.
