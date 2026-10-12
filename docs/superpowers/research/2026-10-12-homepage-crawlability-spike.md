# Homepage crawlability feasibility spike

Date: 2026-10-12
Branch: `feat/layali-managed-content-cms`

## Baseline inspected
- `src/main.tsx` mounts the app with React `createRoot`, not server hydration.
- `index.html` contains the metadata, analytics snippets and an empty `#root`; homepage content is created in the browser.
- `src/App.tsx` initializes the current route as `home` and resolves the requested pathname inside `useEffect`. A server render using the current component as-is would render the home route for every path until hydration.
- `vercel.json` rewrites known SPA paths to `/` and applies a global CSP. A root HTML handler or rewrite could change route precedence and security headers.
- Homepage reviews are still hard-coded in `src/components/HomePage.tsx`; the public reviews API is separate and returns published records only.

## Options assessed
1. **Keep client-side fetch only:** lowest risk and compatible with the current app, but review text is not guaranteed to appear in the initial HTML returned to crawlers.
2. **Inject a review fragment into static `index.html`:** rejected. The current `createRoot` mount can clear server-provided markup and the visible DOM could diverge from the crawlable HTML.
3. **Server-render the existing React app or convert the homepage to SSR/hydration:** technically plausible but requires route-aware rendering, a server bundle/runtime, a matching hydration path, CSP/rewrite validation and fallback tests. This is wider than a safe isolated review widget change.
4. **Build-time prerender:** not sufficient for review content that should reflect database publishing without every content change triggering a build.

## Recommendation
Do not change the public root route or claim crawlable review text yet. The safe next experiment is a route-aware SSR/hydration proof of concept on a controlled staging deployment, with tests for published/unpublished review text, HTML escaping, existing page metadata, and fallback behavior. The owner has explicitly deferred Vercel connection/release checks until the final stage, so the deployment/runtime proof cannot yet be performed.

## Current safe behavior
- Existing hard-coded homepage reviews remain untouched.
- The new published reviews API remains available for later integration.
- Services, offers, packages and FAQs can optionally read the new public APIs behind `VITE_MANAGED_CONTENT_ENABLED`; the default remains `false`, and the legacy content snapshots are the fallback.
- No public cutover, Vercel configuration change or production deployment was performed.

## Route-aware SSR implementation result — 2026-10-12
- Added `src/entry-server.tsx`, initial-path/review props on the app, a client hydration path, and a homepage renderer in the existing API catch-all function. The root and /home rewrites use that existing function, so the Hobby function-entrypoint count does not increase.
- The handler injects only published reviews, applies the durable suppression list, strips internal review IDs from hydration props and HTML-escapes the serialized data. Managed reviews remain disabled by default; when the flag is enabled, an empty or failed source does not restore legacy reviews.
- Build verification [38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839) passed tests, dependency audit, client build, SSR build and the built-server smoke test. Historical scan [38259645791](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645791) passed with zero text and binary printable-string findings.
- This is **local/CI evidence only**. Vercel is disconnected; actual deployed rewrites/function packaging, live database access and crawler HTTP output remain unverified. No ranking benefit is claimed.

## Current implementation and acceptance reconciliation — 2026-10-12

- The earlier recommendation for a route-aware SSR experiment has been superseded by the local route-aware SSR/hydration implementation recorded above.
- Audited application/code baseline before documentation-only reconciliation: `046c4b7e4b5a7629fc860538b6d37b0e3b969e48`. CI build/test/audit passed in [run 38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486); historical scan [run 38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) passed its text/history and binary printable-string scan steps.
- Managed reviews remain disabled by default. If managed mode is enabled and review lookup fails, the handler intentionally fails closed to an empty review list rather than restoring legacy reviews.
- Task 19 generic render-exception behavior: owner selected HTTP 500 rather than an empty-root HTTP 200 or a separate fallback homepage. The handler logs the render error and returns plain-text `Homepage unavailable` with `Cache-Control: no-store`; HEAD has no body. Managed-review lookup failure remains separate and intentionally fails closed to an empty review list when managed mode is enabled. See [Task 19 decision and implementation](../../HOMEPAGE-SSR-FALLBACK-DECISION-2026-10-13.md). Fresh CI is pending.
- Vercel is disconnected; deployed routing/function packaging, live DB access and crawler-facing HTTP response remain unverified. Core CMS Task 6 and live Google Reviews acceptance remain upstream open gates.

## Task 01 status reconciliation (2026-10-12)

- The local route-aware SSR/hydration implementation is present and covered by CI/build smoke evidence [38259645839](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259645839). That does not verify deployed rewrites or crawler-facing HTTP output.
- Immediately before this documentation-only update, `feat/layali-managed-content-cms` was at `dbd22794c87a7f6cd80003e32c4713d1463d8b34`, 15 commits ahead of audited code baseline `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` with documentation-only changes. Build/audit/tests [38259999486](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999486) and history/binary scan [38259999483](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38259999483) apply to `046c4b7e4b5a7629fc860538b6d37b0e3b969e48` only. No Actions runs were returned for `dbd22794c87a7f6cd80003e32c4713d1463d8b34`; the Vercel failure status is not deployment evidence.
- The generic render-exception path still returns an empty-root HTML shell with HTTP 200. This useful-fallback gap and crawler HTTP acceptance remain open. Vercel is disconnected; next ordered task is Short Task List Task 02 (safe non-production environment confirmation), followed by Core CMS Task 6 acceptance.


## Task 19 implementation update — 2026-10-13

- Generic React SSR exceptions now return HTTP 500 rather than returning the original empty-root HTML template with HTTP 200.
- No duplicate homepage or fallback-content maintenance was introduced.
- Regression coverage verifies the generic 500 path independently from managed-review lookup failure.
- Await fresh CI before closing the task. Deployed routing and crawler HTTP acceptance remain pending because Vercel is disconnected.
