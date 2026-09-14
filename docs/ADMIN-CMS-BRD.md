# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

> **Change-control:** Every repository/code/configuration change must update this BRD in the same change. A stage is complete only when its applicable checklist and acceptance criteria are implemented and verified.

## 1. Purpose
Convert the hard-coded salon website into a professional CMS while preserving the public design unless a redesign is explicitly requested. A non-technical admin must be able to manage content without GitHub, source-code edits, Vercel or developer assistance.

## 2. Target Architecture
Public Tips/Blog/News → backend API → MongoDB Atlas. Private `/admin` → secure session authentication → authenticated admin APIs → MongoDB Atlas.

## 3. Current State
- MongoDB Atlas production connection is complete; database `layalialzahra` is reachable.
- Secure authentication is complete: salted `scrypt`, signed 8-hour HttpOnly sessions, same-origin checks, login/logout, password change, setup and login-abuse protection.
- Stage 3 unified content model/API is implemented for `blog | tip | news`, including validation, normalization, sanitization, indexes, CRUD, search/filter/pagination, duplicate, publish/unpublish and public published-only reads.
- Stage 4 branded admin content editor is implemented with create/edit/delete/duplicate/publish controls and image-upload foundation.
- Stage 5 public Blog/News/Beauty Tips route foundations are implemented.
- Production Content API previously failed because of a shared content-module `SyntaxError`; diagnostic isolation identified it and the sanitizer syntax was corrected.
- Production content health then confirmed MongoDB, content module, database, collection, query, serialization and four indexes.
- A real Blog Post was created and published from the CMS and appears in the admin list.
- The public detail API initially returned `Content not found` for that published slug. `api/content.js` has now been hardened so detail requests first locate the published record and then apply publication-date validation in application code, including compatibility with legacy string-form dates.
- Latest code commit: `95d391869ac75de4bdb9c62a9b57ce5acf89b20c`.
- Latest public API fix is awaiting owner production retest.

## 4. Master Status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟢 Complete | Audit, rollback checkpoint and production-build verification completed |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured and live DB health confirmed |
| 2 — Secure Admin Authentication | 🟢 Complete | Authentication and protected-access acceptance completed |
| 3 — CMS Foundation | 🟡 In progress | CMS create/publish works; public detail read requires retest after publication-date compatibility fix |
| 4 — Admin Content Editor | 🟡 In progress | Editor/list/actions implemented; production image storage and final acceptance remain |
| 5 — Public Tips/Blog/News | 🟡 In progress | DB-driven foundations implemented; live detail/public acceptance remains |
| 6 — Offers | ⬜ Not started | Deferred until core CMS is stable |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred until content system is stable |

## 5. Stage 0 — Baseline & Safety — COMPLETE
- [x] Inspect existing routes/code.
- [x] Identify database/API experiments and limitations.
- [x] Preserve public design.
- [x] Establish and maintain this BRD.
- [x] Establish rollback checkpoint `checkpoint/pre-stage-0-2-3-close`.
- [x] Add repeatable production-build verification.

## 6. Stage 1 — MongoDB Production Connection — COMPLETE
- [x] Production MongoDB Atlas cluster configured.
- [x] Vercel `MONGODB_URI` configured as a Production secret.
- [x] `MONGODB_DB_NAME=layalialzahra` configured.
- [x] Cached MongoDB connection helper.
- [x] Generic production health/error handling.
- [x] Live DB health confirmed.

## 7. Stage 2 — Secure Admin Authentication — COMPLETE
- [x] Direct `/admin` route.
- [x] Server-side admin login/session verification.
- [x] One-time setup token and password confirmation.
- [x] Salted `scrypt` password hashing; hashes never returned.
- [x] Signed 8-hour HttpOnly Secure SameSite=Lax sessions.
- [x] Same-origin protection for writes.
- [x] Five failures/15 minutes → 30-minute lockout.
- [x] Password change invalidates active session.
- [x] Admin username uniqueness and abuse-record TTL cleanup.
- [x] Owner verified login/logout/password change.
- [x] Owner verified unauthenticated protected-API rejection.
- [x] Session-expiry implementation verified from deployed source.

## 8. Stage 3 — CMS Foundation
### Content model
One model with `type: blog | tip | news`. Required content metadata includes title, slug, excerpt/body, featured image/alt text, category/tags, author, related service, SEO title/meta/social image, status, publish date, timestamps and stable ID. Beauty Tips additionally support `tip1`–`tip5`.

### Categories
Hair: Hair Care, Hair Treatments, Hair Colour, Hair Extensions.  
Beauty: Skincare, Nails, Brows & Lashes, Waxing.  
Lifestyle: Dubai Beauty, UAE Beauty, Seasonal, Events.  
Salon: News, Offers, Announcements.

### Database/API
- [x] Shared content helper and type validation.
- [x] Slug normalization.
- [x] Tag normalization/deduplication.
- [x] Server validation/normalization.
- [x] Basic body sanitization.
- [x] Unique `{type,slug}` and feed/update indexes.
- [x] Index initialization retry and non-blocking warning handling.
- [x] Application-level slug collision guard.
- [x] Authenticated CRUD/search/filter/pagination.
- [x] Duplicate operation with forced draft + unique copy slug.
- [x] Publish/unpublish.
- [x] Published-only public API.
- [x] `tip1`–`tip5` persistence.
- [x] Search regex/filter/input hardening.
- [x] Long image URL bound.
- [x] Authenticated content-health diagnostic.
- [x] Diagnostic module-import isolation.
- [x] Corrected sanitizer syntax after production diagnostic.
- [x] Production Blog create/publish proven.
- [x] Public API index setup made non-blocking.
- [x] Public detail publication-date compatibility hardened for BSON Date/string values.
- [ ] Verify unique slugs against production data.
- [ ] Verify draft privacy publicly.
- [ ] Verify safe API errors/no secrets in production.

### Production acceptance
- [ ] Authenticated APIs safely create/edit/delete/publish in production.
- [ ] Public APIs expose only intended published content.
- [ ] Published Blog detail API and `/blog/<slug>` route pass live acceptance.

## 9. Stage 4 — Admin Content Editor
### Dashboard/list
- [x] Layali Al Zahra admin branding.
- [x] Dashboard/workspace navigation.
- [x] Content list with title/category/status/date.
- [x] Search/type/status filters.
- [x] Create/edit/duplicate/publish/unpublish/delete confirmation.
- [x] Loading/error/empty states.
- [ ] Mobile polish.

### Editors
- [x] Blog fields: title/slug/category/image/alt/excerpt/body/tags/related service/SEO/status/publish date.
- [x] Basic bold/italic/underline/link controls.
- [x] Beauty Tip description + `tip1`–`tip5` + relationships/SEO/status.
- [x] News shared content fields.
- [ ] Richer News-specific UX.

### Images
- [x] Vercel Blob selected.
- [x] Authenticated upload endpoint.
- [x] JPG/PNG/WebP/GIF, max 4 MB.
- [x] File picker/upload state/preview.
- [ ] Production Blob store configuration and authentication verification.
- [ ] Upload failure handling verification.

### Acceptance
- [ ] Nontechnical admin can create/edit/delete production content end-to-end.
- [ ] Production image upload/select works.
- [x] Draft/publish controls exist.

## 10. Stage 5 — Public Tips/Blog/News
- [x] Beauty Tips DB-driven published-only API.
- [x] Protected idempotent six-tip migration tooling.
- [x] Blog/News listing/detail foundations.
- [x] SPA route recognition and Vercel rewrites for listing/detail routes.
- [x] Listing cards use stable slug URLs.
- [ ] Execute and verify six-tip migration.
- [ ] Verify drafts remain private.
- [ ] Final public design verification.
- [ ] Beauty Journal listing UX/pagination/load-more acceptance.
- [ ] Final live route verification.
- [ ] Stable slugs/H1/alt/publication/category/tags/related-service/404 acceptance.
- [ ] Per-content SEO/canonical/OG/structured content/internal links.
- [ ] Publishing without code deployment acceptance.

## 11. Stages 6–9 — Deferred
### Stage 6 — Offers
- [ ] Dynamic offers data model/page with pricing, validity, images, publication and CTA/booking.

### Stage 7 — Services & Packages
- [ ] DB-driven services and packages with pricing, duration, ordering, publication, SEO and CTAs while preserving design.

### Stage 8 — Gallery & Testimonials
- [ ] DB-driven gallery with categories/upload/order/visibility.
- [ ] Testimonials with client name/review/rating/date/photo/publication/order.

### Stage 9 — SEO & Analytics
- [ ] Sitewide SEO defaults, OG, canonical, robots, sitemap and structured data.
- [ ] Analytics/Search Console readiness.
- [ ] CMS performance/statistics dashboard.

## 12. Cross-stage Non-negotiables
### Security
- [ ] Final secret audit.
- [x] Server-side environment variables.
- [x] Server-side authentication/session validation.
- [x] Admin writes require valid session.
- [x] Public content API does not expose backend secrets.
- [x] Destructive delete confirmation.
- [x] Basic content sanitization.

### Usability/design
- [ ] Final nontechnical end-to-end publishing acceptance.
- [x] Loading/success/failure states.
- [x] Useful empty state.
- [ ] Mobile admin polish.
- [x] Public design preserved.
- [x] Branded admin shell.

### Performance/reliability
- [x] Cached MongoDB connections.
- [x] Core indexes.
- [x] API pagination.
- [ ] Production query/index performance verification.
- [ ] No large binaries in MongoDB.
- [ ] Final public performance verification.
- [x] Content API remains available when individual index initialization emits warnings.

## 13. Core MVP Checklist
- [x] Real authentication.
- [x] Secure MongoDB production connection.
- [x] Authentication API.
- [x] Unified content model.
- [x] Authenticated CRUD foundation.
- [x] Draft/publish.
- [ ] Production images.
- [x] Categories/tags.
- [x] Related service.
- [x] Per-content SEO fields.
- [ ] Six-tip migration.
- [x] DB-driven public API foundation.
- [x] Slug normalization/uniqueness foundation.
- [x] Public API filters drafts.
- [x] Public design preserved.
- [x] Production build/deployment verification.
- [ ] Owner can publish end-to-end without code.

## 14. Change Log
### 2026-09-14 — Stage 2 authentication integration
- Replaced mock client-only admin login with server-backed session authentication.
- Added setup, login, session-check, logout and generic error handling.

### 2026-09-14 — Authentication hardening and acceptance
- Corrected MongoDB helper import paths.
- Added direct `/admin` routing and Vercel SPA rewrite.
- Added login-abuse protection, password change/session invalidation and indexes.
- Owner verified login/logout/password change and protected API rejection.
- Closed Stage 2 after technical session-expiry verification.

### 2026-09-14 — Unified CMS foundation and admin editor
- Added unified `blog | tip | news` model, validation, sanitization, serialization and indexes.
- Added authenticated CRUD/search/filter/duplicate/publish APIs and public published-only API.
- Added structured Beauty Tip fields, admin editor, branding, upload foundation and migration tooling.
- Converted public Beauty Tips to DB-driven content and added Blog/News route foundations.

### 2026-09-14 — Stage 3 security/reliability hardening
- Hardened filters/search/duplicate validation and field bounds.
- Added content-index retry behavior, then made individual index warnings non-blocking.
- Added application-level `{type,slug}` collision checks.

### 2026-09-14 — Stage 3 production Content service failure/recovery
- Owner observed `Content service unavailable` in the Content screen while MongoDB health remained healthy.
- Added authenticated `/api/admin/content-health` diagnostic.
- Diagnostic isolated a shared content-module `SyntaxError`; sanitizer syntax was corrected.
- Diagnostic then confirmed MongoDB, content module, database, collection, query, serialization and four indexes.
- Owner created and published a real Blog Post successfully.

### 2026-09-14 — Stage 3 public Blog detail troubleshooting
- Owner confirmed the published Blog appears in the CMS but its public API returned `Content not found`.
- Hardened `api/content.js` detail lookup to fetch the published record first and perform publication-date validation in application code, including legacy string-form dates.
- Updated this BRD immediately with the code change.
- **Next:** retest the same public API URL, then the public Blog detail route; do not close Stage 3 until both pass.
