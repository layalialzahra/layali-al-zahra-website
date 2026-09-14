# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

> **Project change-control rule:** Keep this BRD synchronized with implementation. Every repository/code/configuration change must update the BRD status/checklist in the same change.
>
> **Implementation fidelity rule:** A stage is complete only when its applicable checklist and acceptance criteria are implemented and verified.

## 1. Purpose
Convert the hard-coded salon website into a professional, manageable CMS while preserving the existing public website design unless a redesign is explicitly requested. The CMS must allow a non-technical salon owner/admin to manage content without GitHub, source-code edits, Vercel, or developer assistance.

## 2. Target Architecture
Public Tips/Blog/News → Backend API → MongoDB Atlas. Private `/admin` → secure login/session → authenticated admin APIs → MongoDB Atlas.

## 3. Current State
- MongoDB Atlas production connection is complete; the live database health endpoint previously confirmed database `layalialzahra`.
- Secure authentication is implemented with salted `scrypt` password hashing, signed 8-hour HttpOnly sessions, same-origin checks, login/logout, password change and one-time initial setup.
- Stage 2 authentication is complete and its deployed protected-API rejection was independently verified.
- Stage 3 has a unified `blog | tip | news` content model, validation/normalization/sanitization, MongoDB indexes, authenticated CRUD/search/filter/duplicate/publish APIs and a published-only public API.
- Stage 4 has a branded admin content manager with create/edit/delete/duplicate/publish controls and image upload foundation.
- Stage 5 has DB-driven Beauty Tips plus Blog/News public route foundations and protected migration tooling.
- The production Content screen previously displayed `Content service unavailable` while MongoDB health remained healthy.
- Content API index initialization is now non-blocking for CRUD reads/writes: individual index warnings are logged without making the Content API unavailable, and application-level type/slug collision checks are enforced before content writes.
- An authenticated `/api/admin/content-health` diagnostic endpoint has been added to isolate database connection, `content` collection, basic query, serialization and index visibility failures without exposing content data.
- The deployed diagnostic identified and the codebase corrected a `SyntaxError` in the shared content sanitizer caused by a legacy octal escape.
- The corrected diagnostic now confirms MongoDB, content module, database, collection, query, serialization and four content indexes are healthy in production.
- A real Blog Post was created and published from the admin CMS and persisted in the Content list.
- The first public Blog detail route test currently returns `Content not found` for the newly published slug. The public API read path has therefore been hardened so index initialization is a background task and cannot block public reads on cold serverless instances.
- Production acceptance remains open until the public API/detail route is retested and draft privacy, edit/delete and remaining CRUD acceptance are verified.

## 4. Master Status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟢 Complete | Audit, rollback checkpoint and repeatable production-build verification completed |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured; live health check confirmed `layalialzahra` |
| 2 — Secure Admin Authentication | 🟢 Complete | Login/logout/password-change, protected API rejection and session-expiry implementation verification completed |
| 3 — CMS Foundation | 🟡 In progress | Admin create/publish is proven; public published-content read path requires retest after public API resilience fix |
| 4 — Admin Content Editor | 🟡 In progress | Branded dashboard/editor and upload foundation implemented; production Blob configuration/failure checks and final acceptance remain |
| 5 — Public Tips/Blog/News | 🟡 In progress | Beauty Tips is DB-driven; migration and Blog/News foundations exist; first live Blog detail route currently needs API/detail troubleshooting |
| 6 — Offers | ⬜ Not started | Deferred until core content CMS works |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred until content system is stable |

## 5. Stage 0 — Baseline & Safety — COMPLETE
- [x] Inspect existing routes and code.
- [x] Identify database/API experiments and limitations.
- [x] Preserve public design.
- [x] Establish and maintain this BRD.
- [x] Establish rollback checkpoint `checkpoint/pre-stage-0-2-3-close`.
- [x] Add repeatable GitHub Actions production-build verification.
- [x] Current mainline build verification completed successfully.

## 6. Stage 1 — MongoDB Production Connection — COMPLETE
- [x] Production MongoDB Atlas cluster configured.
- [x] Vercel `MONGODB_URI` configured as a Production secret.
- [x] `MONGODB_DB_NAME=layalialzahra` configured.
- [x] Reusable cached MongoDB connection helper implemented.
- [x] Generic production health/error handling implemented.
- [x] Live health check confirmed the production API reaches `layalialzahra`.

## 7. Stage 2 — Secure Admin Authentication — COMPLETE
### Access and security
- [x] `/admin` is the direct private admin URL.
- [x] Login uses admin email/password and server-side verification.
- [x] First-time setup requires `ADMIN_SETUP_TOKEN` and password confirmation.
- [x] Passwords use salted `scrypt`; hashes are never returned.
- [x] Signed sessions enforce an 8-hour expiry; production cookie matches the expiry.
- [x] HttpOnly, SameSite=Lax and Secure production cookie attributes.
- [x] Same-origin protection for authentication writes.
- [x] MongoDB-backed login abuse protection: five failures in 15 minutes trigger a 30-minute lockout.
- [x] Admin password change verifies current password and clears the active session.
- [x] Admin username uniqueness index and TTL cleanup for abuse records.
### Production acceptance
- [x] Login/logout verified by owner.
- [x] Logout + refresh + incognito rejection verified by owner.
- [x] Password change and fresh login verified by owner.
- [x] Direct unauthenticated `/api/admin/content` returned the expected HTTP 401 JSON after hardening.
- [x] Session-expiry implementation technically verified from deployed source.

## 8. Stage 3 — CMS Foundation
### Unified content model
Use one content system with `type: blog | tip | news`.

Required fields: type, title, slug, excerpt, body, featured image, alt text, category, tags, author, related service, SEO title, meta description, social image, draft/published, publish date, created/updated timestamps and stable ID.

Beauty Tips additionally support structured `tip1` through `tip5` fields.

### Categories
**Hair:** Hair Care, Hair Treatments, Hair Colour, Hair Extensions  
**Beauty:** Skincare, Nails, Brows & Lashes, Waxing  
**Lifestyle:** Dubai Beauty, UAE Beauty, Seasonal, Events  
**Salon:** News, Offers, Announcements

Architecture must allow categories to be extended without changing the database model.

### Database/API requirements
- [x] Shared content helper with `blog | tip | news` validation.
- [x] Slugs normalized consistently.
- [x] Tags normalized and deduplicated.
- [x] Server-side field validation and normalization.
- [x] Basic body sanitization for stored content.
- [x] MongoDB indexes defined for unique type/slug, published feeds, category feeds and update ordering.
- [x] Index initialization retries after a failed initialization attempt.
- [x] Index initialization is resilient to individual index-creation warnings and no longer blocks Content API CRUD reads/writes.
- [x] Application-level `{type, slug}` collision checks run before create/update/duplicate writes, with the MongoDB unique index retained as the preferred database-level constraint.
- [x] Authenticated content create/read/update/delete API.
- [x] Authenticated search, status/type/category filters and pagination.
- [x] Authenticated duplicate operation; duplicates are forced to draft state with a unique copy slug.
- [x] Publish/unpublish through the content status field.
- [x] Published-only public API with due-date filtering and type/category/slug filters.
- [x] Beauty Tip `tip1`–`tip5` persistence.
- [x] Admin filter validation, bounded category/search input and escaped search regex.
- [x] Duplicate input rebuilt through the shared validator.
- [x] Long featured-image values bounded server-side.
- [x] Authenticated content health diagnostic covering DB connection, content collection, basic query, serialization and index visibility.
- [x] Diagnostic module-import isolation so failed module loads are identified separately from database-operation failures.
- [x] Corrected shared sanitizer ES-module syntax after deployed diagnostic identified a `SyntaxError` from a legacy octal escape in a replacement string.
- [x] Production Content Manager successfully created and published a real Blog record.
- [x] Public API index initialization changed to a non-blocking background task so public reads are not held behind cold-start index setup.
- [ ] Verify unique slugs against actual production data.
- [ ] Verify draft privacy against the public API in production.
- [ ] Verify safe API errors/no secrets in production.

### Production acceptance
- [ ] Authenticated APIs safely create/edit/delete/publish content in production.
- [ ] Public APIs expose only intended published content in production.
- [ ] Retest the published Blog detail route after the public API resilience fix and confirm the current `Content not found` failure is resolved.

## 9. Stage 4 — Admin Content Editor
### Dashboard and lists
- [x] Layali Al Zahra logo/Admin Portal branding.
- [x] Dashboard/workspace navigation and active/disabled states.
- [x] Content list with title/category/status/date.
- [x] Search and type/status filters.
- [x] Create, edit, duplicate, publish/unpublish and delete confirmation.
- [x] Loading/error/empty states.
- [ ] Mobile-friendly final polish.

### Editors
- [x] Blog title/slug/category/image/alt/excerpt/body/tags/related service/SEO/status/publish date.
- [x] Basic bold/italic/underline/link formatting controls.
- [x] Beauty Tip title/description/image/tip1–tip5/relationships/SEO/status.
- [x] News content type with shared title/text/image/date/status/category fields.
- [ ] Richer News-specific UX.

### Images
- [x] Vercel Blob selected as object-storage layer.
- [x] Authenticated `/api/admin/upload` endpoint.
- [x] JPG/PNG/WebP/GIF restriction and 4 MB limit.
- [x] Editor file picker, upload state and preview.
- [ ] Connect/create production Blob store and verify authentication.
- [ ] Verify deployed upload failure handling.

### Acceptance
- [ ] Nontechnical admin can create/edit/delete content in production.
- [ ] Admin can upload/select images in production.
- [x] Draft/publish controls exist in the editor foundation.

## 10. Stage 5 — Public Tips/Blog/News
- [x] Beauty Tips converted to published-only DB-driven content API.
- [x] Protected, idempotent migration tooling for six existing Beauty Tips.
- [x] Public Blog/News listing/detail component foundations.
- [x] SPA recognition and Vercel rewrites for `/beauty-tips`, `/blog`, `/news` and slug routes.
- [x] Listing cards use stable slug URLs.
- [ ] Execute six-tip migration in production and verify all six records.
- [ ] Verify drafts remain private publicly.
- [ ] Preserve existing public design for all new routes.
- [ ] Beauty Journal listing final UX, filters and pagination/load-more as required.
- [ ] Final live verification of all public route forms.
- [ ] Stable slugs, H1, alt text, publication info, category/tags, related service/internal links and 404 handling.
- [ ] Per-content SEO: title, meta, canonical, OG image, structured content and internal links.
- [ ] Publishing must not require code deployment.

## 11. Stage 6 — Offers
- [ ] title, short/full description, included services, price, original price, dates, image, category/tag, published state and CTA/booking.
- [ ] Dynamic Offers page with current/expiry behavior.

## 12. Stage 7 — Services & Packages
- [ ] Services: name, description, category, image, price/starting price, duration, active/published, ordering, SEO, related content/CTA.
- [ ] Packages: name, description, included services, price, original/reference price, image, validity, active/published, ordering.
- [ ] Public Services/Packages pages become DB-driven while preserving design.

## 13. Stage 8 — Gallery & Testimonials
### Gallery
- [ ] Categories: Hair, Nails, Makeup, Bridal, Salon.
- [ ] Upload, title/caption, alt text, category, ordering, visibility, delete/replace.
- [ ] Public gallery becomes DB-driven.
### Testimonials
- [ ] Client name, review, rating, date, optional photo, published/unpublished, ordering.

## 14. Stage 9 — SEO & Analytics
- [ ] Sitewide/default title and meta, OG image, canonical domain, robots/indexability, sitemap, canonicals and structured data.
- [ ] GA/equivalent and Search Console readiness.
- [ ] Dashboard performance/article/published-content statistics.

## 15. Cross-stage Non-negotiables
### Security
- [ ] No secrets in GitHub.
- [x] Server-side environment variables.
- [x] Server-side authentication/session validation.
- [x] Admin content writes require a valid session.
- [x] Content API does not return sensitive backend details.
- [x] Destructive deletion requires confirmation.
- [x] Basic content sanitization.

### Usability
- [ ] Nontechnical workflow with no GitHub/code/Vercel required for publishing.
- [x] Validation and loading/success/failure states in auth/settings/content flows.
- [x] Useful empty state for content lists.
- [ ] Mobile-friendly admin final polish.

### Design
- [x] Public design preserved during backend/admin foundation work.
- [x] Admin portal has Layali Al Zahra branding and structured CMS shell.

### Performance/reliability
- [x] Cached MongoDB connections.
- [x] Core content indexes defined.
- [x] Content API pagination.
- [ ] Production index/query performance verification.
- [ ] No large image binaries in MongoDB.
- [ ] Performant public pages.
- [x] Content API remains available when individual index creation emits an initialization warning.

## 16. Core MVP Checklist
- [x] Real authentication foundation.
- [x] Secure MongoDB production connection.
- [x] Authentication API foundation.
- [x] Unified content model foundation.
- [x] Authenticated content CRUD foundation.
- [x] Draft/publish status support.
- [ ] Images in production.
- [x] Categories/tags fields.
- [x] Related service field.
- [x] Per-content SEO fields.
- [ ] Migrate six existing tips.
- [x] DB-driven public API foundation.
- [x] Slug normalization/uniqueness foundation.
- [x] Public API filters drafts out.
- [x] Public site preserved.
- [x] Production build/deployment verification through repository workflow.
- [ ] Owner can publish without code.

## 17. Change Log
### 2026-09-14 — Stage 2 authentication integration
- Replaced mock client-only admin login with server-backed session authentication.
- Added first-time admin setup, login, session-check, logout and generic error states.

### 2026-09-14 — Authentication hardening and acceptance
- Corrected MongoDB helper import paths in authentication/setup modules.
- Added direct `/admin` routing and Vercel SPA rewrite.
- Added durable MongoDB-backed login abuse protection.
- Added password-change settings and session invalidation.
- Added admin username uniqueness and login-abuse TTL cleanup.
- Owner verified login/logout/password-change flows and protected API rejection.
- Closed Stage 2 after technical verification of the 8-hour session expiry implementation.

### 2026-09-14 — Unified CMS foundation and admin editor
- Added unified `blog | tip | news` content model, validation, sanitization, serialization and indexes.
- Added authenticated CRUD/search/filter/duplicate/publish APIs and published-only public API.
- Added structured Beauty Tip fields, admin content editor, dashboard integration and branding.
- Added Vercel Blob upload foundation and six-tip migration tooling.
- Converted public Beauty Tips to the DB-driven published-only API and added Blog/News route foundations.

### 2026-09-14 — Stage 3 security/reliability hardening
- Hardened admin content filters, search regex handling, duplicate input validation and field bounds.
- Added retry behavior for failed content index initialization.

### 2026-09-14 — Stage 3 production Content service failure
- Owner opened the authenticated `/admin` Content screen and observed `Content service unavailable` with an empty content list.
- MongoDB health remained healthy, narrowing the failure to the Content API path rather than the database connection itself.
- Production Stage 3 CRUD acceptance was left open.

### 2026-09-14 — Recover Content API read path
- Changed content index initialization from a blocking prerequisite to a background reliability task so CRUD reads/writes are not held behind index creation.
- Added application-level `{type,slug}` collision checks to create/update/duplicate paths.
- Added clearer client-safe 400 responses for common content validation failures.
- Production Stage 3 acceptance remains open until the deployed Content screen is retested.

### 2026-09-14 — Stage 3 diagnostic isolation
- Added authenticated `/api/admin/content-health` diagnostic endpoint.
- Diagnostic checks production MongoDB access, `content` collection existence, a basic read query, content serialization and visible indexes while returning no content payload.
- The first deployed diagnostic returned an empty check set because MongoDB and content helper imports were bundled into one failure path.
- Diagnostic module-import isolation was then added so the failing module could be identified without exposing backend details.

### 2026-09-14 — Stage 3 content-module syntax fix
- Owner retested the deployed diagnostic and it isolated `contentModule` as failed with `SyntaxError`, while `mongodbModule` passed.
- Root cause was identified in `api/_lib/content.js`: the sanitizer replacement string contained `\\2`, which is a legacy octal escape and invalid syntax in an ES module.
- Replaced the invalid replacement-string backreference with `$2` and committed the correction.
- Production Content API acceptance remained open pending deployed verification.

### 2026-09-14 — Stage 3 empty collection and production create/publish verification
- Corrected the health diagnostic so a non-existent or empty `content` collection is treated as a valid empty CMS state.
- Owner verified the production diagnostic: MongoDB module, content module, database, collection, query, serialization and four content indexes all passed.
- Owner created and published `5 Simple Hair Care Tips for Healthier Hair` from the admin Content Manager and verified the published record appears in the Content list.

### 2026-09-14 — Stage 5 public read resilience
- Owner opened the published Blog detail URL and the public detail page returned `Content not found`.
- Hardened `api/content.js` so content index initialization runs as a background task instead of blocking public reads on serverless cold starts.
- Public published-content acceptance remains open pending deployment and retest of the same published Blog URL.

## 18. Continuation Protocol
Before each implementation pass:
1. Read this BRD first.
2. Inspect the current GitHub state before changing code.
3. Identify the first incomplete applicable requirement.
4. Implement the full requirement rather than a placeholder where practical.
5. Verify the implementation as far as the available environment permits.
6. Update this BRD immediately after every repository/code/configuration change.
7. Record the change in the Change Log.
