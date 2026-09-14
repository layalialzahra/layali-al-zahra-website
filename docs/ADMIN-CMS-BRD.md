# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress  

> **Project change-control rule:** Keep this BRD synchronized with implementation. Every repository/code/configuration change must update the BRD status/checklist in the same change.

## 1. Purpose

Convert the hard-coded salon website into a manageable CMS. The first priority is **Beauty Tips, Blog articles, and Salon News**. Later: Offers, Services, Packages, Testimonials, Gallery, and Settings.

## 2. Target Architecture

```text
PUBLIC WEBSITE → /beauty-tips, /blog, /news → Backend API → MongoDB Atlas
ADMIN → /admin → Secure Login → Dashboard → Content / Website / Settings
```

## 3. Audit Findings

- Vite + React 18 + TypeScript.
- Hash-based navigation is currently used.
- `src/pages/AdminPage.tsx` is a client-only login prototype accepting any non-empty credentials.
- `src/pages/TipsPage.tsx` contains six hard-coded tips.
- `mongodb` dependency already exists.
- `api/test.js` previously created a Mongo client per request and exposed raw errors.
- `vercel.json` exists with SPA fallback/security configuration.
- No `.gitignore` existed at the audit checkpoint.
- No MongoDB secret was found in the repository audit.
- Reliable production build/deployment verification remains open.

## 4. Status

| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟢 Audit complete / verification open | Codebase audited; production build check still pending |
| 1 — MongoDB Production Connection | 🟡 In progress | Code foundation complete; Atlas cluster/user/network access configured; Vercel connection and production verification pending |
| 2 — Secure Admin Authentication | ⬜ Not started | Pending Stage 1 verification |
| 3 — CMS Foundation | ⬜ Not started | Pending |
| 4 — Admin Content Editor | ⬜ Not started | Pending |
| 5 — Public Tips/Blog/News | ⬜ Not started | Pending |
| 6 — Offers | ⬜ Not started | Deferred |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred |

## 5. Stage 0 — Baseline & Safety

- [x] Inspect current production code and routes/pages.
- [x] Identify API/database experiments.
- [x] Record current admin/CMS limitations.
- [x] Preserve public design as default constraint.
- [x] Establish BRD as project source of truth.
- [ ] Confirm current Vercel deployment/build works.
- [ ] Establish/verify rollback checkpoint.

## 6. Stage 1 — MongoDB Production Connection

- [x] Reusable cached MongoDB connection helper.
- [x] Server-side-only database URI usage.
- [x] Production-safe DB health endpoint.
- [x] Shared helper and safe errors in test endpoint.
- [x] `.gitignore` and `.env.example` added without secrets.
- [x] Create MongoDB Atlas project and Free cluster.
- [x] Create database user.
- [x] Rotate database-user password after accidental screenshot exposure.
- [x] Configure Atlas IP Access List for Vercel using `0.0.0.0/0`; entry is Active.
- [ ] Add `MONGODB_URI` to Vercel environment variables.
- [ ] Deploy and verify `/api/health/db`.
- [ ] Add CMS collections/models.

**Stage 1 completion condition:** Production can securely read/write MongoDB data.

## 7. Stage 2 — Secure Admin Authentication

- [ ] Server-side credential validation.
- [ ] Password hashing/no plaintext password storage.
- [ ] Secure session mechanism.
- [ ] Protected admin APIs.
- [ ] Logout/session expiry.
- [ ] Remove client-only authentication bypass.

## 8. Stage 3–9

Detailed requirements remain in the project roadmap: reusable `blog` / `tip` / `news` CMS, non-technical editor, image storage, public slug URLs, migration of six existing tips, then Offers, Services/Packages, Gallery/Testimonials, and SEO/Analytics.

## 9. Core Definition of Done

Real private admin authentication; secure production MongoDB; authenticated CMS APIs; Blog/Tips/News CRUD and publishing; images; six tips migrated; database-driven public pages; slug URLs; SEO; existing site intact; successful production build/deployment; owner can publish without code.

## 10. Implementation Rule

Before each implementation step, inspect current repository state and this BRD. Continue from the first incomplete stage. Preserve existing public design unless explicitly requested otherwise. After every repository/code/configuration change, update this BRD in the same change.
