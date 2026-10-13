# Task 15 — Controlled Google Reviews sync

**Date:** 2026-10-13  
**Repository/branch:** `layalialzahra/layali-al-zahra-website` / `feat/layali-managed-content-cms`  
**Status:** **OPEN — BLOCKED. No live sync attempted.**

## Result

The controlled live sync cannot be performed because Task 14's external prerequisites remain unverified: Google Business Profile API approval/enablement, valid OAuth grant and required scope, live server-side credential presence, and access to the verified Layali Al Zahra location. The owner has kept Vercel disconnected; no authorised non-production deployment/database target has been verified either.

No OAuth token exchange, Google API request, review sync, database write, deployment or secret inspection was performed. No successful live sync is claimed. The existing local review set and current hard-coded public homepage reviews were left unchanged.

## Source-level review

Reviewed `api/_lib/google-reviews.js`, `api/_lib/google-reviews-routes.js`, and the existing Google Reviews tests on the feature branch.

- `fetchAllGoogleReviews` retrieves pages before returning data to the sync handler. It rejects non-success provider responses, invalid page shapes, invalid or changing `totalReviewCount`, malformed/duplicate review IDs, repeated page tokens, a final count mismatch and pagination exceeding 200 pages.
- The sync handler calls the complete fetch/normalization step before building or executing review upserts. A provider/pagination error reaches the failure path before the review collection's `bulkWrite`; the handler returns HTTP 502 and does not intentionally delete the prior set.
- `mergeSyncedReview` preserves existing local publication state, sort order and creation time. Suppressed IDs are excluded from import.
- Existing provider-independent unit coverage includes a multi-page result and rejection of an incomplete final page. This is test-fixture evidence, not a live Google sync.

## Acceptance not established

The following require the authorised controlled environment and actual Google access; they are **NOT RUN / NOT VERIFIED**:

- successful OAuth and verified-location access;
- completion of pagination against the real location, including comparison of fetched and provider-reported totals;
- imported/updated/suppressed record counts and field-level integrity against actual source records;
- preservation of pre-existing local and published records when a real provider page fails, times out or is incomplete;
- database behavior if a local write operation itself fails partway through a bulk write.

The existing code fetches and validates all provider pages before starting writes, but this source review alone does not prove runtime behavior. MongoDB `bulkWrite` is not a cross-document transaction; a database-side failure during the write phase could still leave some operations applied. Treat that case separately from an incomplete provider response and address/test it before claiming full failure-atomicity.

## Required unblock and next steps

1. The owner/provider must confirm Business Profile API approval and enablement, authorised OAuth consent with the required scope, valid server-side credentials without exposing their values, and access to the verified salon location.
2. Identify an owner-authorised non-production deployment/database and prove it is isolated from production. Keep Vercel disconnected until the approved release window; do not use production as a substitute.
3. In that authorised environment, run one controlled read-only source verification first, then a controlled sync. Record page completion, provider/fetched totals, inserted/updated/suppressed counts, and redacted field-integrity evidence.
4. Inject or reproduce a provider failure/incomplete page in automated tests and verify no review writes occur. Separately test local database write failure and establish whether transactional or compensating behavior is required.
5. Preserve existing local/published data on all failed or incomplete source fetches. Keep Task 15 open until required evidence is recorded.

**No secret values were accessed or recorded. No live API call, simulated successful live sync, database write, migration, Vercel reconnection, deployment or public-source cutover occurred.**