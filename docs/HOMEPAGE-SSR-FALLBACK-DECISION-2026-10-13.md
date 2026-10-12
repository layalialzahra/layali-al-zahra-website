# Task 19 — Homepage SSR render-exception fallback decision

Date: 2026-10-13
Branch: `feat/layali-managed-content-cms`

## Main-branch comparison

Reviewed the approved CMS specification and the implementation on both `main` and `feat/layali-managed-content-cms`.

- On `main`, `src/main.tsx` mounts React with `createRoot()`; `index.html` contains an empty `#root` and the browser bundle. The existing `src/components/HomePage.tsx` contains the legacy homepage sections and hard-coded review carousel.
- The feature branch adds route-aware server rendering in `api/_lib/homepage-renderer.js`, server output through `src/entry-server.tsx`, and hydration in `src/main.tsx`.
- If server rendering throws, the handler currently returns the original template with an empty `#root` and HTTP 200. A browser can still mount the legacy client app, but the initial HTML response has no homepage content. This is not a crawlable fallback.
- The approved specification requires preserving existing content/design and making published reviews available in initial HTML, but does not define the required response/content when generic React SSR itself fails.

## Keep these failure cases separate

1. **Managed-review lookup failure:** in managed mode, return an empty review list and do not restore legacy reviews. This is intentional fail-closed behavior and must not change.
2. **Generic SSR render exception:** the React page render fails. Returning the original template allows client-side recovery in browsers but does not provide homepage content to crawlers.

## Decision required before implementation

The approved specification does not authorize inventing fallback content or error semantics. Owner decision is required between:

- **A. Legacy client-rendered fallback:** keep returning the original HTML shell with HTTP 200. Browser rendering may recover, but crawler-facing content is empty for that response.
- **B. Explicit server failure:** return HTTP 500 rather than an empty-root HTTP 200. This avoids falsely reporting a successful server-rendered page, but does not provide a content fallback.
- **C. Render a separate server-safe legacy homepage fallback:** provide meaningful initial HTML if SSR fails. This requires an agreed fallback implementation/content source and tests; it must not accidentally restore legacy reviews after a managed-review lookup failure.

No option has been selected. No application code was changed for Task 19. Do not mark this task complete until the owner chooses the expected behavior and regression tests pass. Vercel remains disconnected; no deployment, production write, or public cutover occurred.
