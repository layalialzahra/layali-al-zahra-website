# Homepage SSR and Hydration Acceptance — Task 20

Date: 2026-10-13  
Branch: `feat/layali-managed-content-cms`

## Scope

Verify local server rendering and client hydration for `/` and `/home`, including initial HTML, hydration consistency, canonical metadata, and review publication/order/suppression.

## Changes made

- The homepage handler now passes the requested homepage alias (`/` or `/home`) to the server renderer rather than always forcing `/`. Both routes still render the same homepage; the static canonical URL remains `https://www.layalialzahra.com/`.
- Expanded the built-server smoke test to exercise both paths, confirm homepage content exists in the initial HTML, check the hydration marker, assert exactly one canonical link and ensure the existing legacy review snapshot remains available when managed reviews are not enabled.
- The managed-review smoke case checks published reviews render in input order and that unpublished and suppressed reviews do not appear in the HTML or serialized hydration data.
- Added a jsdom React hydration regression test that checks for hydration mismatch warnings.
- Added an API handler regression test for the `/home` alias path.

## Verification evidence

- **PASS:** GitHub Actions Build verification [38324549630](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38324549630) on code/test commit `3d6c48d932ba9fc97d1bf2163d6b60359cccd473`. Install and `npm audit --audit-level=high` passed (0 vulnerabilities); Node tests passed (127/127); Vitest passed (39 tests across 7 files); client build passed; SSR server bundle build passed; built-server smoke passed for `/` and `/home` including initial HTML, hydration marker, canonical metadata, review publication/order/suppression and legacy fallback.
- **Not covered by local/CI tests:** actual Vercel rewrites/function packaging, live MongoDB review query/sort behavior and crawler-facing production HTTP output. Vercel remains disconnected under the owner-confirmed release hold.

## Acceptance status

Task 20 code and local/CI acceptance is complete for the tested code commit. Live MongoDB ordering/query behavior and deployed Vercel rewrite/crawler response remain unverified and are not claimed. Do not deploy or reconnect Vercel as part of this task.
