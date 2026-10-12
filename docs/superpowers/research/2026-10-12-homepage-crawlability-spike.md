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

## Component-level proof-of-concept result — 2026-10-12
- Added a server-rendering test using React's `renderToString` on the homepage component. It verifies that the component emits review text into HTML and that a supplied review marked unpublished is omitted while published text remains.
- The POC and full build/test/audit passed in [Build verification run 38256652658](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652658). The reachable-history scan passed in [run 38256652699](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38256652699): 371 commits / ~117.20 MB, zero text findings; 118 binary blobs / 170,446,401 bytes, zero findings.
- This is **component-level only**. There is no route-aware server entry, SSR request handler, database fetch into initial HTML, hydration path or live crawler response test yet. The component still uses the existing hard-coded reviews as its fallback.

## Status
Source-level options assessed and component-level SSR feasibility test passed. Full route-aware SSR/hydration remains pending; no ranking benefit is claimed.
