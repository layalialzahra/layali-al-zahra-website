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

## 3. Audit Findings
- Vite + React 18 + TypeScript; hash-based navigation.
- The original `AdminPage.tsx` used fake client-only authentication; this is being replaced.
- `TipsPage.tsx` contains six hard-coded tips.
- MongoDB dependency and reusable connection helper exist.
- `.gitignore` excludes environment secrets and `.env.example` documents required variables.
- Production build/deployment verification remains an independent Stage 0 check.

## 4. Master Status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟡 In progress | Audit complete; build verification and rollback checkpoint remain |
| 1 — MongoDB Production Connection | 🟢 Complete | Atlas + Vercel configured; live health check confirmed `layalialzahra` |
| 2 — Secure Admin Authentication | 🟡 In progress | Auth backend restored and `/admin` UI wired to unified session API; live acceptance, rate limiting and password change remain |
| 3 — CMS Foundation | ⬜ Not started | Depends on Stage 2 |
| 4 — Admin Content Editor | ⬜ Not started | Depends on Stage 3 |
| 5 — Public Tips/Blog/News | ⬜ Not started | Depends on Stages 3–4 |
| 6 — Offers | ⬜ Not started | Deferred |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred |

## 5. Stage 0 — Baseline & Safety
- [x] Inspect current production code/routes and API/database experiments.
- [x] Record admin/CMS limitations and preserve public design.
- [x] Establish BRD as project source of truth.
- [ ] Independently confirm current Vercel production build.
- [ ] Establish/verify a known-good rollback checkpoint.

## 6. Stage 1 — MongoDB Production Connection
- [x] Cached reusable MongoDB connection helper.
- [x] Server-side-only URI usage and production-safe DB health endpoint.
- [x] `.gitignore` / `.env.example` without secrets.
- [x] Atlas project/cluster/database user configured and exposed password rotated.
- [x] Vercel access/network/env configuration completed and redeployed.
- [x] Live `/api/health/db` confirmed database `layalialzahra` on 14 September 2026.
- [ ] CMS collections/models/indexes/authenticated CRUD intentionally deferred to Stage 3.

## 7. Stage 2 — Secure Admin Authentication
### Admin access / UX
- [x] `/admin` remains a direct private URL; no public Admin nav link.
- [x] Public navigation/design unchanged.
- [x] Branded email/password login with loading/error states.
- [x] Fake client-only login removed from the admin UI.
- [x] UI checks server session before dashboard access.
- [x] One-time setup form appears only when server reports no admin account.
- [x] Setup/login requests include credentials so the HttpOnly session cookie is used.

### Authentication architecture
- [x] Credentials validated server-side.
- [x] Password never stored in frontend/source; scrypt hash only in MongoDB.
- [x] Signed session with HttpOnly, SameSite=Lax, Secure in production and 8-hour expiry.
- [x] Reusable `requireAdmin` helper for protected APIs.
- [x] Generic authentication errors and server-side logging.
- [x] Same-origin check for state-changing auth requests.
- [x] Unified `/api/admin/auth`: GET session/setup state; POST login or logout.
- [x] `/api/admin/setup`: one-time setup-token-protected initial admin creation.
- [x] Required `ADMIN_SESSION_SECRET` and `ADMIN_SETUP_TOKEN` documented in `.env.example` and configured in production Vercel.
- [ ] Basic login abuse protection/rate limiting appropriate to serverless architecture.

### Admin account management
- [x] Secure initial admin provisioning without GitHub password storage.
- [ ] Settings → Admin Account credential change.
- [ ] Password change requires current authenticated session and current-password verification.

### Verification
- [ ] Verify latest deployment serves `/api/admin/auth` and `/api/admin/setup` correctly.
- [ ] Complete first-admin setup on production.
- [ ] Verify successful login, cookie-backed refresh persistence, logout and unauthorized protected API behavior.

**Stage 2 acceptance:** Unauthenticated visitors cannot access the dashboard/protected APIs; correct credentials create a secure session; refresh retains access during session lifetime; logout removes access; direct unauthenticated protected API calls fail.

## 8. Stage 3 — CMS / Database Foundation
Build one reusable content model, not three unrelated systems. `type: blog | tip | news`.

### Content fields
- [ ] type, title, slug, excerpt, body.
- [ ] featured image + alt text.
- [ ] category, tags, author, related service.
- [ ] SEO title, meta description, social image.
- [ ] draft/published status and publish date/time.
- [ ] created/updated timestamps and stable database ID.

### Taxonomy
Hair: Hair Care, Hair Treatments, Hair Colour, Hair Extensions. Beauty: Skincare, Nails, Brows & Lashes, Waxing. Lifestyle: Dubai Beauty, UAE Beauty, Seasonal, Events. Salon: News, Offers, Announcements. Categories must later be extendable without code changes.

### Database/API rules
- [ ] MongoDB Atlas production store; validated/normalized server input.
- [ ] Unique slug constraint within relevant namespace/type.
- [ ] Drafts never exposed through public APIs.
- [ ] Indexes for type/status/slug/publish date/common filters.
- [ ] Safe errors/no secrets in responses.
- [ ] Authenticated create/read/update/delete/publish/unpublish/draft/search/filter/duplicate APIs.
- [ ] Public published-content listing/filtering/slug APIs.

**Stage 3 acceptance:** Reusable content foundation safely supports authenticated CRUD/publishing and public APIs expose only intended published content.

## 9. Stage 4 — Admin Content Editor & Dashboard
Dashboard architecture: Dashboard; CONTENT → Blog Posts, Beauty Tips, Salon News, Offers, Announcements; WEBSITE → Services, Packages, Gallery, Testimonials; SETTINGS → SEO, Contact Details, Admin Account.

- [ ] Content lists with search, filters, title/category/status/date, edit, duplicate, publish/unpublish, confirmed delete, Add New and loading/error/empty states.
- [ ] Blog editor: title, slug, category, featured image, excerpt, rich body, tags, related service, SEO/social fields, draft/publish and publish date/time.
- [ ] Beauty Tip editor: title, description, featured image, Tip 1–Tip 5, related service, category/tags, SEO, draft/published state; tips editable without code.
- [ ] Salon News editor: image/title/content/category/status/date for service/staff/equipment/holiday/Eid/Ramadan/renovation/event/product announcements.
- [ ] Image/object storage (not MongoDB binaries), persisted URL/reference, alt text and upload failure handling.

**Stage 4 acceptance:** Non-technical admin can create/edit/delete, upload images, save drafts, publish/unpublish Blog/Tip/News without code.

## 10. Stage 5 — Public Tips / Blog / News
- [ ] Migrate six existing hard-coded Beauty Tips accurately.
- [ ] DB-driven published listings; drafts private; loading/error/empty states.
- [ ] Beauty Journal with featured/latest/category filters/article cards/mobile support.
- [ ] Real routes: `/beauty-tips`, `/beauty-tips/:slug`, `/blog`, `/blog/:slug`, `/news`, `/news/:slug`.
- [ ] Stable slugs, H1, full content, image alt, publication info, taxonomy, related services/internal links and 404 behavior.
- [ ] Per-content title/meta/canonical/OG/H1/indexability.

**Stage 5 acceptance:** Six tips migrated, public pages DB-driven, publishing requires no deployment, each article has an indexable URL/metadata and drafts remain private.

## 11. Stage 6 — Offers
- [ ] CMS fields: title, descriptions, included services, price/original price, dates, image, category/tag, status, CTA/booking.
- [ ] Dynamic public Offers page with active/expiry behavior and admin publish/unpublish.

## 12. Stage 7 — Services & Packages
- [ ] Services: name, description, category, image, price, duration, active/published, ordering, SEO, related content/CTA.
- [ ] Packages: name, description, included services, price/reference price, image, validity, active/published, ordering.
- [ ] Public Services/Packages DB-driven while preserving design.

## 13. Stage 8 — Gallery & Testimonials
- [ ] Gallery: Hair/Nails/Makeup/Bridal/Salon, upload, caption, alt, category, ordering, visibility, delete/replace, public DB-driven display.
- [ ] Testimonials: client name, review, rating, date, optional photo, status, ordering, public dynamic display.

## 14. Stage 9 — Sitewide SEO, Analytics & Content Performance
- [ ] Global/default SEO, canonical domain, robots/indexability, sitemap and structured data.
- [ ] Analytics/Search Console readiness, useful content/dashboard statistics and performance insight.

## 15. Cross-Stage Non-Negotiables
Security: no secrets in GitHub; server env only; server-side auth; frontend state is never authorization; protected writes require valid session; safe errors; confirmed destructive actions; validate/sanitize content.

Usability: non-technical owner; no GitHub/Vercel for publishing; validation/loading/success/failure states; useful empty states; mobile admin usability.

Design: existing public website is baseline; preserve typography, spacing, colors, cards, navigation and responsiveness unless explicitly redesigned.

Performance/reliability: cached DB connections, indexes/pagination, no large Mongo image binaries, performant public pages and graceful API failure.

## 16. Definition of Done — Core MVP
- [ ] Real private `/admin` authentication.
- [x] Secure MongoDB Atlas production connection.
- [ ] Authenticated CMS APIs and unified Blog/Tips/News model.
- [ ] Blog/Tips/News CRUD + draft/publish/unpublish.
- [ ] Image storage, categories/tags, related services and per-content SEO.
- [ ] Six existing tips migrated and public Tips/Blog/News DB-driven.
- [ ] Individual slug URLs; drafts hidden.
- [ ] Existing public site intact and production build/deployment verified.
- [ ] Owner can publish/update content without touching code.

## 17. Change-Control & Continuation Protocol
Before every implementation step: read this BRD; inspect current GitHub state; identify first incomplete requirement; implement the full requirement; test/verify; update this BRD in the same repository change; record important decisions; then continue. BRD + current GitHub state are authoritative on resume.

## 18. Implementation Notes / History
- Stage 1 production MongoDB connectivity verified 14 September 2026.
- Auth backend foundation originally introduced at `7373c0ff49924c146183d343f2770d52586b0b86`.
- The subsequent UI tree accidentally omitted the auth backend files because it was created from an older base tree. This was detected before Stage 2 was marked complete. The corrective change restores the auth files, restores auth env documentation, keeps the server-wired admin UI, and records the correction here.
- Admin UI integration commit lineage includes `f03a668020291eba7da8c2a17273d4226e559422`; Stage 2 remains in progress until production acceptance tests pass.
