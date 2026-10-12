# Task 14 — Google Business Profile API prerequisite check

**Date:** 2026-10-12  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Branch:** `feat/layali-managed-content-cms`  
**Outcome:** **Repository/configuration inspection complete. Live API access remains UNVERIFIED; sync must stay gated.**

## Checks performed

Inspected the feature-branch `.env.example`, `api/_lib/google-reviews.js`, `api/_lib/google-reviews-routes.js`, Google Reviews implementation plan, project status and security review. No secret values were read, printed or copied. No Google API request, token exchange, live sync, deployment or database write was attempted.

## Findings

| Prerequisite | Evidence-backed result | Status |
|---|---|---|
| Required configuration names | `.env.example` lists `GOOGLE_BUSINESS_PROFILE_CLIENT_ID`, `GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET`, `GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN` and `GOOGLE_BUSINESS_PROFILE_PARENT`. | Names verified in repository; presence in the live deployment is **not verified**. |
| Safe credential storage | The checked-in example contains placeholders/empty values, not working credentials. Source reads credentials from server-side environment variables. | No usable credentials found in repository example; this does **not** prove whether Vercel currently has them. |
| Location configuration | Example value is `accounts/ACCOUNT_ID/locations/LOCATION_ID`. Code accepts only the `accounts/{id}/locations/{id}` shape. | Placeholder only; the actual salon location ID and verification/access are **not verified**. |
| OAuth implementation | Code exchanges client ID, client secret and refresh token at Google's OAuth token endpoint, then calls the Business Profile reviews endpoint using the access token. | Implementation exists; live OAuth grant, token validity, granted scope and refresh success are **not verified**. |
| API approval/enablement | Repository has no evidence of Google Cloud project approval, enabled API state or approved quota. | **Not verified.** This requires the relevant Google Cloud project owner/console evidence. |
| Access to verified salon location | Reviews list API is only valid for a verified location and the OAuth user must have access to that profile. No successful authenticated location/reviews response was obtained. | **Not verified.** |
| Current public-site behavior | `VITE_MANAGED_CONTENT_ENABLED=false` and `MANAGED_HOME_REVIEWS_ENABLED=false` in `.env.example`; project status says Vercel is disconnected and changes are not deployed. | Example defaults and release hold verified; live deployment settings were not inspected. Keep current hard-coded reviews as fallback. |

## Important distinction

The code's `isGoogleReviewsSyncConfigured()` checks only that the four environment variables are non-empty and that the location value matches the expected text pattern. The admin response's `syncAvailable` flag therefore indicates **configuration-shaped values are present in that runtime**, not that Google has approved the project, the refresh token works, or the salon location is accessible. Those require an authenticated API check.

## External prerequisites to confirm

Google's official documentation says Business Profile API access must be requested and approved, the relevant APIs must be enabled, OAuth 2.0 credentials/consent must be configured, and the authenticated account must have access to the verified location. The reviews-list method is for a verified location and requires a Business Profile OAuth scope.

- [Google Business Profile API prerequisites and access approval](https://developers.google.com/my-business/content/prereqs)
- [Basic setup, API enablement and OAuth client](https://developers.google.com/my-business/content/basic-setup)
- [Official reviews.list method, verified-location requirement and OAuth scopes](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list)

Google's documented quota indicator for access approval is 0 QPM when not approved and 300 QPM when approved. This was not checked because the relevant Google Cloud Console/project is not available in this inspection.

## Result and next action

Task 14's repository inspection and evidence recording are complete, but the live prerequisites are **BLOCKED/UNVERIFIED**, not passed. Do not attempt a real sync until the Google Cloud project owner confirms API approval/enablement, the authorized OAuth user has consented with the required scope, the server-side credentials are configured in the intended deployment, and the actual verified salon location is accessible.

At the final controlled release window, check only whether each required secret is present (never its value), then perform one read-only reviews-list request and verify the returned location/reviews. Do not log tokens or provider response bodies. Keep both managed-content and managed-homepage-review flags disabled until integration and owner acceptance are complete.

No secret values were accessed or recorded. No API request, database mutation, Vercel reconnection, deployment, production change or public content-source switch occurred.
