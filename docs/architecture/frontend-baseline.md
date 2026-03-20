# Frontend Baseline Architecture

This repository now uses a production-oriented baseline that keeps the app small while giving it stronger boundaries.

## Routing

- `src/app/router.tsx` owns the route table.
- `src/app/layout/AppLayout.tsx` owns the shared shell and top-level navigation.
- `src/app/routes/ProtectedRoute.tsx` redirects anonymous users away from protected routes.
- `src/app/routes/AnonymousOnlyRoute.tsx` redirects authenticated users away from login/register/reset flows.
- Route paths live in `src/shared/routing/paths.ts` so feature code does not scatter raw strings.

## Server State

- TanStack Query is the source of truth for server-backed state.
- `src/features/auth/session/query.ts` owns the session query key and query function.
- `src/features/auth/session/useAuthSession.ts` exposes the app-facing session state used by routes and pages.
- `src/features/auth/mutations.ts` owns auth-related mutations and session cache updates.
- `src/features/public/usePublicPing.ts` is the pattern for simple feature queries.

## API Boundary

- Generated OpenAPI types remain the machine contract in `src/shared/api/generated/schema.d.ts`.
- `src/shared/api/contract.ts` provides route-aware request/response helper types.
- Entity models in `src/entities/*/model.ts` are app-owned types plus DTO mapping helpers.
- Feature API modules in `src/features/*/api.ts` stay handwritten and explicit, but they no longer leak generated schema internals into pages.

## Forms

- React Hook Form is the default form state mechanism.
- Zod schemas in `src/features/auth/forms.ts` own client-side validation rules and field-level messaging.
- Route pages stay thin; the feature form components own submission, validation, and mutation wiring.

## Auth UX

- Session loading is centralized in the query layer instead of repeated page effects.
- Auth-only and protected-route decisions happen at route boundaries, not inside every page.
- Login redirects back to the intended app path when available.
- Session failures distinguish anonymous state from authenticated-but-broken state so the UI can react differently.
