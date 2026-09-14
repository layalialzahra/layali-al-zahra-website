# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

> **Project change-control rule:** Keep this BRD synchronized with implementation. Every repository/code/configuration change must update the BRD status/checklist in the same change.
>
> **Implementation fidelity rule:** Detailed requirements below are binding. A stage is complete only when its applicable checklist and acceptance criteria are implemented and verified.

## 1. Purpose
Convert the hard-coded salon website into a professional, manageable CMS while preserving the existing public website design unless a redesign is explicitly requested. The CMS must allow a non-technical salon owner/admin to manage content without GitHub, source-code edits, Vercel, or developer assistance.

## 2. Target Architecture
Public Tips/Blog/News → Backend API → MongoDB Atlas. Private `/admin` → secure login/session → authenticated admin APIs → MongoDB Atlas.

## 3. Current State
- MongoDB Atlas production connection is complete and the live database health endpoint previously confirmed database `layalialzahra`.
- Secure authentication backend is implemented: password hashing, signed 8-hour HttpOnly session cookie, session verification, same-origin checks, login/logout, and one-time initial admin setup.
- `/admin` now uses the real authentication API rather than client-only fake credentials. It checks the existing session on load, supports first-time setup, login, logout, loading states and generic errors.
- CMS modules are being built incrementally; the authenticated dashboard is now connected to the Stage 4 content editor foundation.
- Deployment issues were identified in both authentication server modules: their MongoDB helper relative imports were incorrect. Both have now been corrected to the proper paths.
- The frontend now explicitly recognizes direct pathname `/admin` and suppresses the public header/footer/cookie UI on the admin route.
- Vercel configuration now rewrites direct `/admin` requests to the SPA entry point while preserving the browser pathname, allowing the frontend `/admin` route to render.
- Login abuse protection is implemented using MongoDB-backed attempt records keyed by a hashed IP/username combination: five failures within a 15-minute window trigger a 30-minute lockout, with `Retry-After` returned on blocked attempts.
- Admin Account settings now expose a secure password-change form backed by `/api/admin/password`; successful password changes invalidate the current browser session and require sign-in again.
- Stage 3 content foundation now has shared server-side validation, normalization, sanitization, serialization and MongoDB indexes, plus authenticated CRUD/search/filter/duplicate and published-only public content APIs.
- Beauty Tip records now support dedicated `tip1` through `tip5` fields for the planned editor.
- Stage 4 now has a working admin content manager UI connected to the authenticated content API, with content listing, filters, create/edit forms, publish/unpublish, duplicate and delete actions.
- Production authentication/content acceptance testing remains open.

## 4. Master Status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟡 In progress | Audit complete; build verification and rollback checkpoint remain |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured; live health check confirmed `layalialzahra` |
| 2 — Secure Admin Authentication | 🟡 In progress | Core auth, routing, rate limiting and password change implemented; production acceptance remains |
| 3 — CMS Foundation | 🟡 In progress | Content model, indexes, authenticated CRUD and published-only public API implemented; production verification remains |
| 4 — Admin Content Editor | 🟡 In progress | Content manager UI connected to API; image uploads, richer editor UX and final acceptance remain |
| 5 — Public Tips/Blog/News | ⬜ Not started | Depends on Stages 3–4 |
| 6 — Offers | ⬜ Not started | Deferred until core content CMS works |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred until content system is stable |

## 5. Stage 0 — Baseline & Safety
### Completed
- [x] Inspect existing routes and code.
- [x] Identify database/API experiments and limitations.
- [x] Preserve public design.
- [x] Establish and maintain this BRD.
### Open
- [ ] Confirm current Vercel production build/deployment works independently.
- [ ] Establish/verify rollback checkpoint.

## 6. Stage 1 — MongoDB Production Connection — COMPLETE
- [x] Production MongoDB Atlas cluster configured.
- [x] Vercel `MONGODB_URI` configured as a Production secret.
- [x] `MONGODB_DB_NAME=layalialzahra` configured.
- [x] Reusable cached MongoDB connection helper implemented.
- [x] Generic production health/error handling implemented.
- [x] Live health check confirmed the production API reaches `layalialzahra`.
- [x] CMS collections intentionally deferred to later stages.

## 7. Stage 2 — Secure Admin Authentication
### 7.1 Admin access model
- [x] `/admin` is the direct private admin URL.
- [x] No public navigation link is required.
- [x] Public website design/navigation remains unchanged.

### 7.2 Login and first-time setup
- [x] Admin login form uses admin email + password.
- [x] First-time setup is available only when no admin account exists and requires `ADMIN_SETUP_TOKEN`.
- [x] Password confirmation is required during setup.
- [x] Loading states and generic user-facing errors are implemented.
- [x] Password values are cleared after successful authentication/change flows.

### 7.3 Server-side security
- [x] Credentials are validated server-side.
- [x] Passwords are hashed with salted `scrypt` before storage.
- [x] Password hashes are never returned to the frontend.
- [x] Sessions use a signed token with an 8-hour expiry.
- [x] Session cookie is HttpOnly, SameSite=Lax and Secure in production.
- [x] Protected API helper validates the session server-side.
- [x] Same-origin protection is applied to authentication writes.
- [x] Generic authentication errors avoid exposing sensitive backend details.
- [x] Basic login abuse/rate limiting is implemented with MongoDB-backed attempt tracking.
- [x] Authenticated admin password-change endpoint verifies the current password, hashes the replacement password and clears the active session.

### 7.4 `/admin` integration
- [x] Removed fake client-only `isLoggedIn` authentication flow.
- [x] Admin UI checks the server session on load.
- [x] Valid session opens the authenticated dashboard shell.
- [x] Login creates the server session.
- [x] Logout clears the session cookie and returns to login.
- [x] Unauthenticated users cannot access the authenticated dashboard through the UI.
- [x] Frontend explicitly maps direct `/admin` pathname to `AdminPage` and keeps public header/footer out of the admin route.
- [x] Vercel rewrite added so direct `/admin` requests reach the SPA entry point.
- [ ] Verify the deployed `/admin` route no longer returns Vercel `404: NOT_FOUND`.
- [ ] Verify protected API access independently in production.
- [ ] Verify login/logout/setup/password-change end-to-end on the deployed site.

### 7.5 Admin Account settings
- [x] Settings view is available from the authenticated dashboard.
- [x] Admin Account section provides current password, new password and confirmation fields.
- [x] Password-change success signs the admin out and requires a fresh login.
- [ ] Verify password change against the production database/session flow.

### Stage 2 acceptance
- [ ] Unauthenticated user sees only login/setup as appropriate.
- [ ] Protected dashboard/API rejects unauthenticated access.
- [ ] Valid credentials create a valid session.
- [ ] Logout removes authenticated access.
- [ ] Session expiry is enforced.
- [x] Basic abuse protection is present.
- [x] Admin can change their password securely in the implemented flow.
- [ ] Production deployment passes end-to-end acceptance.

## 8. Stage 3 — CMS Foundation
### Unified content model
Use one content system with `type: blog | tip | news`.

Required fields: type, title, slug, excerpt, body, featured image, alt text, category, tags, author, related service, SEO title, meta description, social image, draft/published, publish date, created/updated timestamps, stable ID.

Beauty Tips additionally support structured `tip1` through `tip5` fields.

### Categories
**Hair:** Hair Care, Hair Treatments, Hair Colour, Hair Extensions  
**Beauty:** Skincare, Nails, Brows & Lashes, Waxing  
**Lifestyle:** Dubai Beauty, UAE Beauty, Seasonal, Events  
**Salon:** News, Offers, Announcements

Architecture must allow categories to be added without code changes.

### Database/API requirements
- [x] Shared content helper created with `blog | tip | news` type validation.
- [x] Slugs normalized consistently.
- [x] Tags normalized and deduplicated.
- [x] Server-side field validation and normalization foundation implemented.
- [x] Basic body sanitization implemented for stored content.
- [x] MongoDB indexes prepared for unique type/slug, published feeds, category feeds and updated time.
- [x] Authenticated content API added for create/read/update/delete.
- [x] Authenticated content search, status/type/category filters and pagination added.
- [x] Authenticated duplicate operation added; duplicates are forced to draft state with a unique copy slug.
- [x] Publish/unpublish supported through the content status field.
- [x] Public content API added; it exposes only published items whose publish date is due and supports type/category/slug filters and pagination.
- [x] Beauty Tip structured fields `tip1`–`tip5` accepted and persisted.
- [ ] Unique slugs within namespace/type verified against production data.
- [ ] Draft privacy verified against the public API in production.
- [ ] Safe API errors; no secrets in responses verified in production.

### Acceptance
- [ ] Authenticated APIs safely create/edit/delete/publish content in production.
- [ ] Public APIs expose only intended published content in production.

## 9. Stage 4 — Admin Content Editor
### Dashboard structure
ADMIN / Dashboard  
CONTENT: Blog Posts, Beauty Tips, Salon News, Offers, Announcements  
WEBSITE: Services, Packages, Gallery, Testimonials  
SETTINGS: SEO, Contact Details, Admin Account

### Content lists
- [x] Show title/category/status/date.
- [x] Search and status/category/type filters.
- [x] Edit, duplicate, publish/unpublish, delete with confirmation.
- [x] Add new.
- [x] Loading/error/empty states.

### Blog editor
- [x] Title, slug, category, featured image URL, alt text.
- [x] Excerpt and body editor foundation.
- [x] Tags and related service.
- [x] SEO title/meta/social image.
- [x] Draft/publish and publish date.

### Beauty Tip editor
- [x] Title, description, featured image URL.
- [x] Tip1–Tip5.
- [x] Related service, category/tags, SEO, draft/published.

### News editor
- [x] Separate `news` type.
- [x] Image URL/title/text/date/status foundation.
- [x] Category and related content fields available through the unified editor.
- [ ] Add richer news-specific UX where required.

### Image handling
- [ ] Upload/select image.
- [ ] Use object storage rather than MongoDB binary storage.
- [x] Persist image URL/reference and alt text fields.
- [ ] Handle upload failures clearly.

### Acceptance
- [ ] Nontechnical admin can create/edit/delete content without code in production.
- [ ] Admin can upload/select images.
- [x] Admin can save drafts and publish/unpublish through the editor foundation.

## 10. Stage 5 — Public Tips/Blog/News
- [ ] Replace hard-coded Tips content with DB-driven content.
- [ ] Migrate six existing tips accurately.
- [ ] Keep drafts private.
- [ ] Preserve existing public design.
- [ ] Build Beauty Journal listing with featured article, filters, latest cards and pagination/load-more if needed.
- [ ] Implement `/beauty-tips`, `/beauty-tips/:slug`, `/blog`, `/blog/:slug`, `/news`, `/news/:slug`.
- [ ] Stable slugs, full content, H1, image alt, publication info, category/tags, related service/internal links and 404 handling.
- [ ] Per-content SEO: title, meta, canonical, OG image, structured content, alt text and internal links.
- [ ] No code deployment required to publish content.

## 11. Stage 6 — Offers
- [ ] title, short/full description, included services, price, original price, dates, image, category/tag, published state, CTA/booking.
- [ ] Dynamic Offers page with active/current display and expiry behavior.

## 12. Stage 7 — Services & Packages
- [ ] Services: name, description, category, image, price/starting price, duration, active/published, ordering, SEO, related content/CTA.
- [ ] Packages: name, description, included services, price, original/reference price, image, validity, active/published, ordering.
- [ ] Public Services/Packages pages become DB-driven while preserving design.

## 13. Stage 8 — Gallery & Testimonials
### Gallery
- [ ] Categories: Hair, Nails, Makeup, Bridal, Salon.
- [ ] Upload, title/caption, alt text, category, ordering, visible, delete/replace.
- [ ] Public gallery becomes DB-driven.
### Testimonials
- [ ] Client name, review, rating, date, optional photo, published/unpublished, ordering.

## 14. Stage 9 — SEO & Analytics
- [ ] Sitewide title/default title, default meta, OG image, canonical domain, robots/indexability, sitemap, canonicals, structured data.
- [ ] GA or equivalent and Search Console readiness.
- [ ] Track performance, most-viewed articles, published count and dashboard statistics.

## 15. Cross-stage Non-negotiables
### Security
- [ ] No secrets in GitHub.
- [ ] Server-side environment variables.
- [x] Server-side authentication/session validation foundation.
- [x] Admin content writes require a valid server session.
- [x] No sensitive backend details are returned by the content API.
- [x] Destructive content deletion requires confirmation in the admin UI.
- [x] Basic content sanitization foundation.

### Usability
- [ ] Nontechnical workflow; no GitHub/code/Vercel for publishing.
- [x] Form validation and clear loading/success/failure states in admin authentication/settings/content flows.
- [x] Useful empty state for content lists.
- [ ] Mobile-friendly admin final polish.

### Design
- [x] Public design preserved while backend/admin foundation is developed.

### Performance/reliability
- [x] Cached MongoDB connections.
- [x] Core content indexes defined.
- [x] Content API pagination implemented.
- [ ] Appropriate indexes and pagination verified for all content queries in production.
- [ ] No large image binaries in MongoDB.
- [ ] Performant public pages.
- [ ] Graceful API failure.

## 16. Core MVP Checklist
- [x] Real authentication foundation.
- [x] Secure MongoDB production connection.
- [x] Authentication API foundation.
- [x] Unified content model foundation.
- [x] Authenticated content CRUD foundation.
- [x] Draft/publish status support.
- [ ] Images.
- [x] Categories/tags fields.
- [x] Related service field.
- [x] Per-content SEO fields.
- [ ] Migrate six existing tips.
- [x] DB-driven public API foundation.
- [x] Slug normalization/uniqueness foundation.
- [x] Public API filters drafts out.
- [x] Public site preserved.
- [ ] Production build/deployment independently verified.
- [ ] Owner can publish without code.

## 17. Change Log
### 2026-09-14 — Stage 2 authentication integration
- Replaced the mock client-only admin login with server-backed session authentication.
- Added first-time admin setup using the one-time setup token.
- Added login, session-check, logout, loading and generic error states to `/admin`.
- Kept the dashboard as a shell until CMS stages are implemented.
- Kept Stage 2 open because production acceptance, rate limiting and password change are not yet complete.

### 2026-09-14 — Fix authentication module import path
- Corrected the MongoDB helper import in `api/_lib/auth.js` from an invalid relative path to `./mongodb.js`.
- This removes a serverless module-resolution failure that could prevent authentication endpoints from loading in production.
- Stage 2 remains in progress pending direct `/admin` routing and production acceptance.

### 2026-09-14 — Fix admin setup module import path
- Corrected the MongoDB helper import in `api/admin/setup.js` from an invalid relative path to `../_lib/mongodb.js`.
- This removes the corresponding setup-endpoint module-resolution failure.
- Stage 2 remains in progress pending direct `/admin` routing and production acceptance.

### 2026-09-14 — Add direct `/admin` frontend routing
- Updated `src/App.tsx` to recognize the browser pathname `/admin` in addition to the existing hash-based public routing.
- The admin route now renders `AdminPage` directly and excludes the public header, footer and cookie-consent UI.
- Stage 2 remains in progress until Vercel's server-side request routing is corrected/verified and production acceptance passes.

### 2026-09-14 — Add Vercel `/admin` SPA rewrite
- Added a Vercel rewrite from `/admin` to `/` so a direct browser request is served by the Vite SPA instead of Vercel returning `404: NOT_FOUND`.
- The browser pathname remains `/admin`, allowing the frontend route added above to render.
- Stage 2 remains in progress until the new deployment is live and end-to-end authentication acceptance is verified.

### 2026-09-14 — Add durable login abuse protection
- Added MongoDB-backed login attempt tracking keyed by a SHA-256 hash of client IP and normalized username.
- Five failures within a 15-minute window trigger a 30-minute lockout; blocked responses include `Retry-After`.
- Successful login clears the failure record.
- Stage 2 remains in progress pending password change and production acceptance.

### 2026-09-14 — Add admin account password settings
- Added authenticated `/api/admin/password` endpoint with current-password verification, 12-character minimum replacement password, confirmation, salted hashing and session clearing after a successful change.
- Added Settings → Admin Account UI with a password-change form.
- Stage 2 remains in progress pending production verification of the password-change/session flow.

### 2026-09-14 — Create unified content data foundation
- Added shared content helpers for `blog | tip | news`, required-field validation, slug/tag normalization, basic server-side body sanitization and safe serialization.
- Added MongoDB index definitions for unique type/slug, published feeds, category feeds and update ordering.
- Stage 3 is now in progress; content API endpoints are the next implementation item.

### 2026-09-14 — Add authenticated content CRUD API
- Added `/api/admin/content` with server-side session protection.
- Added create/read/update/delete, type/status/category/search filters, pagination and duplicate-to-draft behavior.
- Added publish/unpublish support through the content status field and duplicate slug generation.
- Stage 3 remains in progress pending the public published-only API and production verification.

### 2026-09-14 — Add published-only public content API
- Added `/api/content` for public content retrieval.
- Public queries are restricted to `status=published` and publish dates that are due; drafts are excluded by construction.
- Added public type/category/slug filters and pagination.
- Stage 3 remains in progress pending production verification and the admin content editor.

### 2026-09-14 — Add structured Beauty Tip fields
- Extended the unified content model to persist `tip1` through `tip5` for Beauty Tip records.
- This supports the BRD's dedicated Beauty Tip editor without creating a separate content system.

### 2026-09-14 — Build admin content editor foundation
- Added `AdminContentManager` with content list, search, type/status filters, create/edit forms, draft/publish, duplicate and delete actions.
- Added Blog, Beauty Tip and Salon News editing modes while keeping the unified content model.
- Added SEO, media URL, alt text, tags, related service and publishing fields to the editor.
- Stage 4 remains in progress pending image upload/object storage, final UX polish and production acceptance.

### 2026-09-14 — Fix content editor view state
- Corrected the content manager's list/editor state so the editor opens only after an explicit create/edit action rather than rendering on initial load.

### 2026-09-14 — Connect dashboard to content editor
- Connected the authenticated `/admin` dashboard's Content card to `AdminContentManager`.
- Content management is now reachable from the dashboard while Website and Media remain intentionally deferred to their planned stages.
- Stage 4 remains in progress pending image upload/object storage, final UX polish and production acceptance.
