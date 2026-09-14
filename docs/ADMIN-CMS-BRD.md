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
- CMS modules are being built incrementally; the authenticated dashboard is connected to the Stage 4 content editor foundation.
- Deployment issues were identified in both authentication server modules: their MongoDB helper relative imports were incorrect. Both have now been corrected to the proper paths.
- The frontend explicitly recognizes direct pathname `/admin` and suppresses the public header/footer/cookie UI on the admin route.
- Vercel configuration rewrites direct `/admin` requests to the SPA entry point while preserving the browser pathname, allowing the frontend `/admin` route to render.
- Login abuse protection is implemented using MongoDB-backed attempt records keyed by a hashed IP/username combination: five failures within a 15-minute window trigger a 30-minute lockout, with `Retry-After` returned on blocked attempts.
- Admin Account settings expose a secure password-change form backed by `/api/admin/password`; successful password changes invalidate the current browser session and require sign-in again.
- Stage 3 content foundation has shared server-side validation, normalization, sanitization and MongoDB indexes, plus authenticated CRUD/search/filter/duplicate and published-only public content APIs.
- Beauty Tip records support dedicated `tip1` through `tip5` fields for the planned editor.
- Stage 4 has a working admin content manager UI connected to the authenticated content API, with content listing, filters, create/edit forms, publish/unpublish, duplicate and delete actions.
- The admin dashboard shell has now been branded with the existing Layali Al Zahra logo, a dedicated admin-portal header, workspace navigation, clearer module cards, disabled future modules, and a more structured visual hierarchy.
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

### Admin dashboard UX / branding
- [x] Use the existing Layali Al Zahra logo in the admin login and authenticated header.
- [x] Add clear Admin Portal branding and workspace context.
- [x] Replace the initial plain four-card shell with a structured dashboard hierarchy.
- [x] Add clear module icons, active navigation and visual distinction between available and upcoming modules.
- [x] Keep future modules visibly planned without presenting unfinished modules as functional.
- [ ] Final mobile-friendly admin polish after all modules are implemented.

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
- [x] Admin visual identity now uses the existing Layali Al Zahra brand assets and a structured workspace shell.

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
- Kept Stage 2 open because production acceptance, rate limiting and password change were not yet complete.

### 2026-09-14 — Fix authentication module import path
- Corrected the MongoDB helper import in `api/_lib/auth.js` from an invalid relative path to `./mongodb.js`.
- This removes a serverless module-resolution failure that could prevent authentication endpoints from loading in production.

### 2026-09-14 — Fix admin setup module import path
- Corrected the MongoDB helper import in `api/admin/setup.js` from an invalid relative path to `../_lib/mongodb.js`.
- This removes the corresponding setup-endpoint module-resolution failure.

### 2026-09-14 — Direct `/admin` frontend routing
- Added explicit pathname handling so direct `/admin` loads the admin page rather than the public route shell.
- Prevented the public header, footer and cookie UI from appearing inside the private admin area.

### 2026-09-14 — Vercel `/admin` rewrite
- Added a Vercel rewrite from `/admin` to the SPA entry point so direct production navigation reaches the frontend route.

### 2026-09-14 — Durable login abuse protection
- Added MongoDB-backed login attempt tracking keyed by a hashed IP/username combination.
- Five failed attempts in a 15-minute window trigger a 30-minute lockout and `Retry-After` response.
- Successful authentication clears the failure record.

### 2026-09-14 — Admin account password settings
- Added authenticated password-change API and Admin Account settings UI.
- Password replacement is validated and hashed server-side; the active session is cleared after a successful change.

### 2026-09-14 — Unified content data foundation
- Added the shared `blog | tip | news` content model, category taxonomy, field validation, normalization, sanitization and MongoDB indexes.
- Added structured Beauty Tip fields `tip1` through `tip5`.

### 2026-09-14 — Authenticated content CRUD API
- Added protected content listing, search, filtering, pagination, create, update, duplicate, publish/unpublish and delete operations.

### 2026-09-14 — Published-only public content API
- Added public content retrieval that exposes only due published content and supports type/category/slug filters and pagination.

### 2026-09-14 — Build admin content editor foundation
- Added the admin content manager with content lists, editor forms, status controls, SEO fields, Beauty Tip structured fields and media/relationship fields.

### 2026-09-14 — Fix content editor view state
- Corrected editor/list view state so selecting a new or existing item reliably opens the editor.

### 2026-09-14 — Connect dashboard to content editor
- Connected the dashboard Content module to the authenticated content manager.

### 2026-09-14 — Polish admin panel branding and navigation
- Applied the existing Layali Al Zahra logo to the admin login and authenticated header.
- Added a branded Admin Portal header, workspace sidebar, module icons, active navigation, clearer dashboard hierarchy and explicit upcoming-module states.
- Kept unfinished modules visibly disabled rather than implying that they are already functional.
- Updated Stage 4 and the design/usability checklists to record the completed admin branding foundation; final mobile polish and remaining CMS modules remain open.
