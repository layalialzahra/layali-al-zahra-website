# Task 19 — Homepage SSR render-exception handling

Date: 2026-10-13  
Branch: `feat/layali-managed-content-cms`

## Confirmed behavior

The owner selected **Option B: return HTTP 500 when generic homepage server rendering fails**.

- A successful render returns the rendered homepage with HTTP 200.
- If the React homepage renderer throws, the handler logs the error, sets `Cache-Control: no-store`, and returns HTTP 500 with a plain-text `Homepage unavailable` response. For HEAD requests, the response body remains empty.
- Template read/validation errors already return HTTP 500 and remain separate.
- No second homepage or fallback content was added.

## Keep review lookup failure separate

When managed-review lookup fails and `MANAGED_HOME_REVIEWS_ENABLED=true`, the handler still renders with an empty review list. It must not restore legacy reviews. This behavior is unchanged and covered by a separate regression test.

## Verification and release limits

Regression coverage asserts generic SSR failure returns HTTP 500 instead of an empty-root HTTP 200, while the managed-review failure test still verifies fail-closed behavior. Build verification [38324220862](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38324220862) passed tests, dependency audit and build on code/test commit `3c29eade5dd7932485ba0faab908f5ab75bdf3ac`.

Work remains limited to the feature branch. Vercel stays disconnected. No deployment, production write, public cutover or `main` change was performed.
